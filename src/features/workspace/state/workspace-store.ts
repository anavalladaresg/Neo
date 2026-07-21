import { createStore } from "zustand/vanilla";

import type { DirectorySelection, WorkspaceSummary } from "../domain/workspace-types";
import type { WorkspaceService } from "../services/workspace-service";
import { normalizeWorkspaceError, type WorkspaceErrorCode } from "../workspace-errors";

export type WorkspaceOperation = "creating" | "idle" | "opening" | "selecting";
export type WorkspaceStatus = "active" | "booting" | "onboarding";

export interface WorkspaceState {
  activeWorkspace: WorkspaceSummary | null;
  cancelCreation: () => void;
  clearError: () => void;
  createWorkspace: (workspaceName: string) => Promise<boolean>;
  error: WorkspaceErrorCode | null;
  initialize: () => Promise<void>;
  initialized: boolean;
  notice: "created" | "opened" | null;
  openExistingWorkspace: () => Promise<boolean>;
  openRecentWorkspace: (workspaceId: string) => Promise<boolean>;
  operation: WorkspaceOperation;
  pendingSelection: DirectorySelection | null;
  recentWorkspaces: WorkspaceSummary[];
  selectParentDirectory: () => Promise<boolean>;
  status: WorkspaceStatus;
}

function withActiveWorkspace(
  workspace: WorkspaceSummary,
  recentWorkspaces: WorkspaceSummary[],
): Pick<
  WorkspaceState,
  "activeWorkspace" | "error" | "operation" | "pendingSelection" | "recentWorkspaces" | "status"
> {
  return {
    activeWorkspace: workspace,
    error: null,
    operation: "idle",
    pendingSelection: null,
    recentWorkspaces: [
      workspace,
      ...recentWorkspaces.filter(
        (recent) => recent.manifest.workspaceId !== workspace.manifest.workspaceId,
      ),
    ],
    status: "active",
  };
}

export function createWorkspaceStore(service: WorkspaceService) {
  return createStore<WorkspaceState>((set, get) => ({
    activeWorkspace: null,
    cancelCreation: () => set({ error: null, pendingSelection: null }),
    clearError: () => set({ error: null }),
    createWorkspace: async (workspaceName) => {
      const selection = get().pendingSelection;
      if (!selection) {
        set({ error: "selection_expired" });
        return false;
      }

      set({ error: null, notice: null, operation: "creating" });
      try {
        const workspace = await service.createWorkspace(selection.token, workspaceName);
        set({
          ...withActiveWorkspace(workspace, get().recentWorkspaces),
          notice: "created",
        });
        return true;
      } catch (error) {
        set({ error: normalizeWorkspaceError(error), operation: "idle" });
        return false;
      }
    },
    error: null,
    initialize: async () => {
      if (get().initialized) {
        return;
      }

      set({ initialized: true, status: "booting" });
      try {
        const session = await service.loadSession();
        set({
          activeWorkspace: session.activeWorkspace,
          error: null,
          operation: "idle",
          recentWorkspaces: session.recentWorkspaces,
          status: session.activeWorkspace ? "active" : "onboarding",
        });
      } catch (error) {
        set({
          activeWorkspace: null,
          error: normalizeWorkspaceError(error),
          operation: "idle",
          status: "onboarding",
        });
      }
    },
    initialized: false,
    notice: null,
    openExistingWorkspace: async () => {
      set({ error: null, notice: null, operation: "opening" });
      try {
        const workspace = await service.openExistingWorkspace();
        if (!workspace) {
          set({ operation: "idle" });
          return false;
        }

        set({
          ...withActiveWorkspace(workspace, get().recentWorkspaces),
          notice: "opened",
        });
        return true;
      } catch (error) {
        set({ error: normalizeWorkspaceError(error), operation: "idle" });
        return false;
      }
    },
    openRecentWorkspace: async (workspaceId) => {
      set({ error: null, notice: null, operation: "opening" });
      try {
        const workspace = await service.openRecentWorkspace(workspaceId);
        set({
          ...withActiveWorkspace(workspace, get().recentWorkspaces),
          notice: "opened",
        });
        return true;
      } catch (error) {
        set({ error: normalizeWorkspaceError(error), operation: "idle" });
        return false;
      }
    },
    operation: "idle",
    pendingSelection: null,
    recentWorkspaces: [],
    selectParentDirectory: async () => {
      set({ error: null, operation: "selecting" });
      try {
        const selection = await service.selectParentDirectory();
        set({ operation: "idle", pendingSelection: selection });
        return selection !== null;
      } catch (error) {
        set({ error: normalizeWorkspaceError(error), operation: "idle" });
        return false;
      }
    },
    status: "booting",
  }));
}

export type WorkspaceStore = ReturnType<typeof createWorkspaceStore>;
