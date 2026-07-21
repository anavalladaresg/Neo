use std::{
    fs::{self, OpenOptions},
    io::Write,
    path::Path,
};

use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::{
    error::{map_io_error, WorkspaceCommandError, WorkspaceErrorCode, WorkspaceResult},
    service::{inspect_workspace, WorkspaceSummary},
};

pub const SETTINGS_SCHEMA_VERSION: u32 = 1;
pub const SETTINGS_FILE_NAME: &str = "settings.json";
const MAX_RECENT_WORKSPACES: usize = 5;

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AppSettings {
    pub schema_version: u32,
    pub active_workspace_path: Option<String>,
    pub recent_workspace_paths: Vec<String>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            schema_version: SETTINGS_SCHEMA_VERSION,
            active_workspace_path: None,
            recent_workspace_paths: Vec::new(),
        }
    }
}

pub fn read_settings(path: &Path) -> AppSettings {
    let Ok(contents) = fs::read_to_string(path) else {
        return AppSettings::default();
    };
    let Ok(settings) = serde_json::from_str::<AppSettings>(&contents) else {
        return AppSettings::default();
    };

    if settings.schema_version == SETTINGS_SCHEMA_VERSION {
        settings
    } else {
        AppSettings::default()
    }
}

pub fn write_settings(path: &Path, settings: &AppSettings) -> WorkspaceResult<()> {
    if settings.schema_version != SETTINGS_SCHEMA_VERSION {
        return Err(WorkspaceCommandError::new(
            WorkspaceErrorCode::SettingsUnavailable,
        ));
    }

    let parent = path
        .parent()
        .ok_or_else(|| WorkspaceCommandError::new(WorkspaceErrorCode::SettingsUnavailable))?;
    fs::create_dir_all(parent)
        .map_err(|error| map_io_error(&error, WorkspaceErrorCode::SettingsUnavailable))?;

    let bytes = serde_json::to_vec_pretty(settings)
        .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::SettingsUnavailable))?;
    let temporary_path = parent.join(format!(".neo-settings-{}.tmp", Uuid::new_v4()));
    let backup_path = parent.join(format!(".neo-settings-{}.backup", Uuid::new_v4()));

    write_exclusive_file(
        &temporary_path,
        &bytes,
        WorkspaceErrorCode::SettingsUnavailable,
    )?;
    serde_json::from_slice::<AppSettings>(&bytes)
        .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::SettingsUnavailable))?;

    if path.exists() {
        fs::rename(path, &backup_path).map_err(|error| {
            let _ = fs::remove_file(&temporary_path);
            map_io_error(&error, WorkspaceErrorCode::SettingsUnavailable)
        })?;
    }

    if let Err(error) = fs::rename(&temporary_path, path) {
        if backup_path.exists() {
            let _ = fs::rename(&backup_path, path);
        }
        let _ = fs::remove_file(&temporary_path);
        return Err(map_io_error(
            &error,
            WorkspaceErrorCode::SettingsUnavailable,
        ));
    }

    if backup_path.exists() {
        fs::remove_file(&backup_path)
            .map_err(|error| map_io_error(&error, WorkspaceErrorCode::SettingsUnavailable))?;
    }

    Ok(())
}

pub fn remember_workspace(path: &Path, workspace: &WorkspaceSummary) -> WorkspaceResult<()> {
    let mut settings = read_settings(path);
    settings.active_workspace_path = Some(workspace.root_path.clone());
    settings
        .recent_workspace_paths
        .retain(|recent| !recent.eq_ignore_ascii_case(&workspace.root_path));
    settings
        .recent_workspace_paths
        .insert(0, workspace.root_path.clone());
    settings
        .recent_workspace_paths
        .truncate(MAX_RECENT_WORKSPACES);
    write_settings(path, &settings)
}

pub fn valid_workspace_session(path: &Path) -> WorkspaceResult<super::service::WorkspaceSession> {
    let settings = read_settings(path);
    let mut recent_workspaces = Vec::new();

    for recent_path in &settings.recent_workspace_paths {
        if let Ok(workspace) = inspect_workspace(Path::new(recent_path)) {
            if !recent_workspaces.iter().any(|existing: &WorkspaceSummary| {
                existing
                    .manifest
                    .workspace_id
                    .eq(&workspace.manifest.workspace_id)
            }) {
                recent_workspaces.push(workspace);
            }
        }
    }

    let active_workspace = settings
        .active_workspace_path
        .as_deref()
        .and_then(|active_path| inspect_workspace(Path::new(active_path)).ok());

    let sanitized = AppSettings {
        schema_version: SETTINGS_SCHEMA_VERSION,
        active_workspace_path: active_workspace
            .as_ref()
            .map(|workspace| workspace.root_path.clone()),
        recent_workspace_paths: recent_workspaces
            .iter()
            .map(|workspace| workspace.root_path.clone())
            .collect(),
    };

    if sanitized != settings && path.exists() {
        write_settings(path, &sanitized)?;
    }

    Ok(super::service::WorkspaceSession {
        active_workspace,
        recent_workspaces,
    })
}

fn write_exclusive_file(
    path: &Path,
    bytes: &[u8],
    fallback: WorkspaceErrorCode,
) -> WorkspaceResult<()> {
    let mut file = OpenOptions::new()
        .create_new(true)
        .write(true)
        .open(path)
        .map_err(|error| map_io_error(&error, fallback))?;
    file.write_all(bytes)
        .and_then(|_| file.sync_all())
        .map_err(|error| map_io_error(&error, fallback))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::workspace::service::create_workspace;
    use tempfile::tempdir;

    #[test]
    fn reads_missing_and_corrupted_settings_as_empty() {
        let root = tempdir().unwrap();
        let settings_path = root.path().join(SETTINGS_FILE_NAME);
        assert_eq!(read_settings(&settings_path), AppSettings::default());

        fs::write(&settings_path, "not json").unwrap();
        assert_eq!(read_settings(&settings_path), AppSettings::default());

        fs::write(&settings_path, r#"{"schemaVersion":2}"#).unwrap();
        assert_eq!(read_settings(&settings_path), AppSettings::default());
    }

    #[test]
    fn writes_and_replaces_valid_settings_without_partial_json() {
        let root = tempdir().unwrap();
        let settings_path = root.path().join("config").join(SETTINGS_FILE_NAME);
        let first = AppSettings::default();
        write_settings(&settings_path, &first).unwrap();
        assert_eq!(read_settings(&settings_path), first);

        let second = AppSettings {
            active_workspace_path: Some("C:\\Neo".to_owned()),
            recent_workspace_paths: vec!["C:\\Neo".to_owned()],
            ..AppSettings::default()
        };
        write_settings(&settings_path, &second).unwrap();
        assert_eq!(read_settings(&settings_path), second);
        assert_eq!(
            fs::read_dir(settings_path.parent().unwrap())
                .unwrap()
                .count(),
            1
        );
    }

    #[test]
    fn remembers_recent_workspaces_and_prunes_missing_paths() {
        let root = tempdir().unwrap();
        let workspace = create_workspace(root.path(), "Neo").unwrap();
        let settings_path = root.path().join("config").join(SETTINGS_FILE_NAME);
        remember_workspace(&settings_path, &workspace).unwrap();
        remember_workspace(&settings_path, &workspace).unwrap();

        let session = valid_workspace_session(&settings_path).unwrap();
        assert_eq!(session.active_workspace, Some(workspace.clone()));
        assert_eq!(session.recent_workspaces, vec![workspace]);

        fs::remove_dir_all(root.path().join("Neo")).unwrap();
        let empty_session = valid_workspace_session(&settings_path).unwrap();
        assert!(empty_session.active_workspace.is_none());
        assert!(empty_session.recent_workspaces.is_empty());
    }

    #[test]
    fn rejects_settings_with_an_unsupported_internal_version() {
        let root = tempdir().unwrap();
        let settings_path = root.path().join(SETTINGS_FILE_NAME);
        let invalid = AppSettings {
            schema_version: 2,
            ..AppSettings::default()
        };
        assert_eq!(
            write_settings(&settings_path, &invalid).unwrap_err().code,
            WorkspaceErrorCode::SettingsUnavailable
        );
    }
}
