use std::{collections::HashMap, path::PathBuf, sync::Mutex};

use serde::Serialize;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::DialogExt;
use uuid::Uuid;

use super::{
    error::{WorkspaceCommandError, WorkspaceErrorCode, WorkspaceResult},
    service::{create_workspace, inspect_workspace, WorkspaceSession, WorkspaceSummary},
    settings::{remember_workspace, valid_workspace_session, SETTINGS_FILE_NAME},
};

#[derive(Default)]
pub struct WorkspaceAuthorizationState {
    selected_directories: Mutex<HashMap<Uuid, PathBuf>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DirectorySelection {
    display_path: String,
    token: Uuid,
}

fn settings_path(app: &AppHandle) -> WorkspaceResult<PathBuf> {
    app.path()
        .app_config_dir()
        .map(|directory| directory.join(SETTINGS_FILE_NAME))
        .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::SettingsUnavailable))
}

fn pick_directory(app: &AppHandle, title: &str) -> WorkspaceResult<Option<PathBuf>> {
    app.dialog()
        .file()
        .set_title(title)
        .blocking_pick_folder()
        .map(|selection| {
            selection
                .into_path()
                .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::InvalidPath))
        })
        .transpose()
}

/// Opens a native parent-directory picker and returns an opaque authorization token.
#[tauri::command]
pub async fn select_workspace_parent(
    app: AppHandle,
    state: State<'_, WorkspaceAuthorizationState>,
) -> WorkspaceResult<Option<DirectorySelection>> {
    let Some(path) = pick_directory(&app, "Elige dónde guardar tu espacio de Neo")? else {
        return Ok(None);
    };
    let canonical_path = std::fs::canonicalize(&path)
        .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::InvalidPath))?;
    let token = Uuid::new_v4();
    state
        .selected_directories
        .lock()
        .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::Unexpected))?
        .insert(token, canonical_path.clone());

    Ok(Some(DirectorySelection {
        display_path: canonical_path.to_string_lossy().into_owned(),
        token,
    }))
}

/// Creates a workspace only inside the directory represented by a native selection token.
#[tauri::command]
pub async fn create_local_workspace(
    app: AppHandle,
    state: State<'_, WorkspaceAuthorizationState>,
    selection_token: String,
    workspace_name: String,
) -> WorkspaceResult<WorkspaceSummary> {
    let token = Uuid::parse_str(&selection_token)
        .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::SelectionExpired))?;
    let parent = state
        .selected_directories
        .lock()
        .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::Unexpected))?
        .remove(&token)
        .ok_or_else(|| WorkspaceCommandError::new(WorkspaceErrorCode::SelectionExpired))?;
    let workspace = create_workspace(&parent, &workspace_name)?;
    remember_workspace(&settings_path(&app)?, &workspace)?;
    Ok(workspace)
}

/// Opens and validates a workspace selected through the native directory picker.
#[tauri::command]
pub async fn open_local_workspace(app: AppHandle) -> WorkspaceResult<Option<WorkspaceSummary>> {
    let Some(path) = pick_directory(&app, "Elige un espacio de Neo")? else {
        return Ok(None);
    };
    let workspace = inspect_workspace(&path)?;
    remember_workspace(&settings_path(&app)?, &workspace)?;
    Ok(Some(workspace))
}

/// Restores only remembered paths that still contain valid supported Neo workspaces.
#[tauri::command]
pub async fn load_workspace_session(app: AppHandle) -> WorkspaceResult<WorkspaceSession> {
    valid_workspace_session(&settings_path(&app)?)
}

/// Opens a remembered workspace by stable ID without accepting a frontend filesystem path.
#[tauri::command]
pub async fn open_recent_workspace(
    app: AppHandle,
    workspace_id: String,
) -> WorkspaceResult<WorkspaceSummary> {
    let workspace_id = Uuid::parse_str(&workspace_id)
        .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::NotWorkspace))?;
    let settings_path = settings_path(&app)?;
    let session = valid_workspace_session(&settings_path)?;
    let workspace = session
        .recent_workspaces
        .into_iter()
        .find(|workspace| workspace.manifest.workspace_id == workspace_id)
        .ok_or_else(|| WorkspaceCommandError::new(WorkspaceErrorCode::NotWorkspace))?;
    remember_workspace(&settings_path, &workspace)?;
    Ok(workspace)
}
