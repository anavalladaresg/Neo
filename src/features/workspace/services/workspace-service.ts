import type {
  DirectorySelection,
  WorkspaceSession,
  WorkspaceSummary,
} from "../domain/workspace-types";

export interface WorkspaceService {
  createWorkspace: (selectionToken: string, workspaceName: string) => Promise<WorkspaceSummary>;
  loadSession: () => Promise<WorkspaceSession>;
  openExistingWorkspace: () => Promise<WorkspaceSummary | null>;
  openRecentWorkspace: (workspaceId: string) => Promise<WorkspaceSummary>;
  selectParentDirectory: () => Promise<DirectorySelection | null>;
}
