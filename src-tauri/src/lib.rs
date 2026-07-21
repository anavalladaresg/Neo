mod workspace;

use workspace::commands::{
    create_local_workspace, load_workspace_session, open_local_workspace, open_recent_workspace,
    select_workspace_parent,
};
use workspace::WorkspaceAuthorizationState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(WorkspaceAuthorizationState::default())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            select_workspace_parent,
            create_local_workspace,
            open_local_workspace,
            load_workspace_session,
            open_recent_workspace
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
