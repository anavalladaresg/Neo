use std::{
    fs::{self, OpenOptions},
    io::Write,
    path::{Path, PathBuf},
};

use serde::Serialize;
use uuid::Uuid;

use super::{
    error::{map_io_error, WorkspaceCommandError, WorkspaceErrorCode, WorkspaceResult},
    manifest::{parse_workspace_manifest, serialize_workspace_manifest, WorkspaceManifest},
};

const WORKSPACE_DIRECTORIES: &[&str] = &[
    "data",
    "assets",
    "assets/photos",
    "assets/thumbnails",
    "assets/documents",
    "backups",
];

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceSummary {
    pub manifest: WorkspaceManifest,
    pub root_path: String,
}

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceSession {
    pub active_workspace: Option<WorkspaceSummary>,
    pub recent_workspaces: Vec<WorkspaceSummary>,
}

pub fn create_workspace(parent: &Path, name: &str) -> WorkspaceResult<WorkspaceSummary> {
    create_workspace_with_failure(parent, name, false)
}

pub(super) fn canonicalize_workspace_parent(parent: &Path) -> WorkspaceResult<PathBuf> {
    canonicalize_directory(parent, WorkspaceErrorCode::InvalidPath)
}

pub fn inspect_workspace(root: &Path) -> WorkspaceResult<WorkspaceSummary> {
    let canonical_root = canonicalize_directory(root, WorkspaceErrorCode::NotWorkspace)?;
    let manifest_path = canonical_root.join("workspace.json");
    let manifest_metadata = fs::symlink_metadata(&manifest_path)
        .map_err(|error| map_io_error(&error, WorkspaceErrorCode::NotWorkspace))?;

    if manifest_metadata.file_type().is_symlink() || !manifest_metadata.is_file() {
        return Err(WorkspaceCommandError::new(WorkspaceErrorCode::InvalidPath));
    }

    let contents = fs::read_to_string(&manifest_path)
        .map_err(|error| map_io_error(&error, WorkspaceErrorCode::MalformedManifest))?;
    let manifest = parse_workspace_manifest(&contents)?;

    Ok(WorkspaceSummary {
        manifest,
        root_path: canonical_root.to_string_lossy().into_owned(),
    })
}

fn create_workspace_with_failure(
    parent: &Path,
    name: &str,
    simulate_failure_after_manifest: bool,
) -> WorkspaceResult<WorkspaceSummary> {
    let canonical_parent = canonicalize_workspace_parent(parent)?;
    let normalized_name = super::name::validate_workspace_name(name)?;
    reject_case_insensitive_conflict(&canonical_parent, &normalized_name)?;

    let final_path = canonical_parent.join(&normalized_name);
    let temporary_path = canonical_parent.join(format!(".neo-create-{}.tmp", Uuid::new_v4()));
    fs::create_dir(&temporary_path)
        .map_err(|error| map_io_error(&error, WorkspaceErrorCode::WriteFailed))?;

    let result = (|| {
        for relative_directory in WORKSPACE_DIRECTORIES {
            fs::create_dir_all(temporary_path.join(relative_directory))
                .map_err(|error| map_io_error(&error, WorkspaceErrorCode::WriteFailed))?;
        }

        let manifest = WorkspaceManifest::new(&normalized_name)?;
        write_manifest(&temporary_path, &manifest)?;

        if simulate_failure_after_manifest {
            return Err(WorkspaceCommandError::new(WorkspaceErrorCode::WriteFailed));
        }

        fs::rename(&temporary_path, &final_path)
            .map_err(|error| map_io_error(&error, WorkspaceErrorCode::DestinationConflict))?;
        inspect_workspace(&final_path)
    })();

    if result.is_err() && temporary_path.exists() {
        cleanup_owned_temporary_directory(&canonical_parent, &temporary_path);
    }

    result
}

fn canonicalize_directory(
    path: &Path,
    missing_code: WorkspaceErrorCode,
) -> WorkspaceResult<PathBuf> {
    if has_unsupported_prefix(path) {
        return Err(WorkspaceCommandError::new(WorkspaceErrorCode::InvalidPath));
    }

    let metadata =
        fs::symlink_metadata(path).map_err(|error| map_io_error(&error, missing_code))?;
    if metadata.file_type().is_symlink() || !metadata.is_dir() {
        return Err(WorkspaceCommandError::new(WorkspaceErrorCode::InvalidPath));
    }

    fs::canonicalize(path).map_err(|error| map_io_error(&error, missing_code))
}

fn has_unsupported_prefix(path: &Path) -> bool {
    let value = path.to_string_lossy().to_uppercase();
    value.starts_with(r"\\.\") || value.starts_with(r"\\?\GLOBALROOT")
}

fn reject_case_insensitive_conflict(parent: &Path, name: &str) -> WorkspaceResult<()> {
    let entries = fs::read_dir(parent)
        .map_err(|error| map_io_error(&error, WorkspaceErrorCode::AccessDenied))?;

    for entry in entries {
        let entry =
            entry.map_err(|error| map_io_error(&error, WorkspaceErrorCode::AccessDenied))?;
        if entry
            .file_name()
            .to_string_lossy()
            .eq_ignore_ascii_case(name)
        {
            return Err(WorkspaceCommandError::new(
                WorkspaceErrorCode::DestinationConflict,
            ));
        }
    }

    Ok(())
}

fn write_manifest(root: &Path, manifest: &WorkspaceManifest) -> WorkspaceResult<()> {
    let temporary_path = root.join(format!(".neo-manifest-{}.tmp", Uuid::new_v4()));
    let manifest_path = root.join("workspace.json");
    let bytes = serialize_workspace_manifest(manifest)?;
    let mut file = OpenOptions::new()
        .create_new(true)
        .write(true)
        .open(&temporary_path)
        .map_err(|error| map_io_error(&error, WorkspaceErrorCode::WriteFailed))?;
    file.write_all(&bytes)
        .and_then(|_| file.sync_all())
        .map_err(|error| map_io_error(&error, WorkspaceErrorCode::WriteFailed))?;
    parse_workspace_manifest(
        std::str::from_utf8(&bytes)
            .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::WriteFailed))?,
    )?;
    fs::rename(&temporary_path, &manifest_path)
        .map_err(|error| map_io_error(&error, WorkspaceErrorCode::WriteFailed))?;
    Ok(())
}

fn cleanup_owned_temporary_directory(parent: &Path, temporary_path: &Path) {
    let belongs_to_operation = temporary_path.parent() == Some(parent)
        && temporary_path
            .file_name()
            .and_then(|name| name.to_str())
            .is_some_and(|name| name.starts_with(".neo-create-") && name.ends_with(".tmp"));

    if belongs_to_operation {
        let _ = fs::remove_dir_all(temporary_path);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn creates_the_exact_initial_workspace_structure_and_manifest() {
        let parent = tempdir().unwrap();
        let summary = create_workspace(parent.path(), " Mi Neo ").unwrap();
        let root = parent.path().join("Mi Neo");

        assert_eq!(summary.manifest.name, "Mi Neo");
        assert_eq!(
            Path::new(&summary.root_path),
            fs::canonicalize(&root).unwrap()
        );
        assert!(root.join("workspace.json").is_file());
        for relative_directory in WORKSPACE_DIRECTORIES {
            assert!(
                root.join(relative_directory).is_dir(),
                "missing {relative_directory}"
            );
        }
        assert_eq!(fs::read_dir(root.join("data")).unwrap().count(), 0);
        assert_eq!(inspect_workspace(&root).unwrap(), summary);
    }

    #[test]
    fn rejects_existing_destinations_without_overwriting_contents() {
        let parent = tempdir().unwrap();
        let conflict = parent.path().join("Neo");
        fs::create_dir(&conflict).unwrap();
        fs::write(conflict.join("keep.txt"), "keep").unwrap();

        assert_eq!(
            create_workspace(parent.path(), "neo").unwrap_err().code,
            WorkspaceErrorCode::DestinationConflict
        );
        assert_eq!(
            fs::read_to_string(conflict.join("keep.txt")).unwrap(),
            "keep"
        );
        assert!(!conflict.join("workspace.json").exists());
    }

    #[test]
    fn cleans_only_the_operation_temporary_directory_after_failure() {
        let parent = tempdir().unwrap();
        let unrelated = parent.path().join("keep");
        fs::create_dir(&unrelated).unwrap();

        assert_eq!(
            create_workspace_with_failure(parent.path(), "Neo", true)
                .unwrap_err()
                .code,
            WorkspaceErrorCode::WriteFailed
        );
        assert!(unrelated.exists());
        assert!(!parent.path().join("Neo").exists());
        assert_eq!(
            fs::read_dir(parent.path())
                .unwrap()
                .filter_map(Result::ok)
                .count(),
            1
        );
    }

    #[test]
    fn distinguishes_missing_malformed_and_unsupported_workspaces() {
        let root = tempdir().unwrap();
        assert_eq!(
            inspect_workspace(root.path()).unwrap_err().code,
            WorkspaceErrorCode::NotWorkspace
        );

        fs::write(root.path().join("workspace.json"), "not json").unwrap();
        assert_eq!(
            inspect_workspace(root.path()).unwrap_err().code,
            WorkspaceErrorCode::MalformedManifest
        );

        fs::write(root.path().join("workspace.json"), r#"{"schemaVersion":2}"#).unwrap();
        assert_eq!(
            inspect_workspace(root.path()).unwrap_err().code,
            WorkspaceErrorCode::UnsupportedSchema
        );
    }

    #[test]
    fn rejects_invalid_parent_paths_and_traversal_names() {
        let parent = tempdir().unwrap();
        let file = parent.path().join("file.txt");
        fs::write(&file, "file").unwrap();

        assert_eq!(
            create_workspace(&file, "Neo").unwrap_err().code,
            WorkspaceErrorCode::InvalidPath
        );
        assert_eq!(
            create_workspace(parent.path(), "../Neo").unwrap_err().code,
            WorkspaceErrorCode::InvalidName
        );
        assert_eq!(
            inspect_workspace(&parent.path().join("missing"))
                .unwrap_err()
                .code,
            WorkspaceErrorCode::NotWorkspace
        );
    }

    #[cfg(windows)]
    #[test]
    fn rejects_symlink_workspace_parents_before_canonicalization_when_windows_allows_fixture_creation(
    ) {
        use std::os::windows::fs::symlink_dir;

        let parent = tempdir().unwrap();
        let target = parent.path().join("target");
        let link = parent.path().join("link");
        fs::create_dir(&target).unwrap();

        if symlink_dir(&target, &link).is_ok() {
            assert_eq!(
                canonicalize_workspace_parent(&link).unwrap_err().code,
                WorkspaceErrorCode::InvalidPath
            );
            assert!(!target.join("Neo").exists());
        }
    }
}
