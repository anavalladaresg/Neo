import { invoke } from "@tauri-apps/api/core";

import {
  parseDirectorySelection,
  parseWorkspaceSession,
  parseWorkspaceSummary,
} from "../domain/workspace-types";
import type { WorkspaceService } from "./workspace-service";

export const tauriWorkspaceService: WorkspaceService = {
  async createWorkspace(selectionToken, workspaceName) {
    const result = await invoke("create_local_workspace", {
      selectionToken,
      workspaceName,
    });
    return parseWorkspaceSummary(result);
  },

  async loadSession() {
    return parseWorkspaceSession(await invoke("load_workspace_session"));
  },

  async openExistingWorkspace() {
    const result = await invoke("open_local_workspace");
    return result === null ? null : parseWorkspaceSummary(result);
  },

  async openRecentWorkspace(workspaceId) {
    return parseWorkspaceSummary(await invoke("open_recent_workspace", { workspaceId }));
  },

  async selectParentDirectory() {
    const result = await invoke("select_workspace_parent");
    return result === null ? null : parseDirectorySelection(result);
  },
};

declare global {
  interface Window {
    __NEO_WORKSPACE_SERVICE__?: WorkspaceService;
  }
}

/** Resolves an explicit browser test adapter before using the production Tauri boundary. */
export function getDefaultWorkspaceService(): WorkspaceService {
  return window.__NEO_WORKSPACE_SERVICE__ ?? tauriWorkspaceService;
}
