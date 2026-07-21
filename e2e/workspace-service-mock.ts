import type { Page } from "@playwright/test";

import type { WorkspaceSummary } from "../src/features/workspace/domain/workspace-types";
import type { WorkspaceService } from "../src/features/workspace/services/workspace-service";

export type WorkspaceMockMode = "active" | "first-run" | "invalid-open";

/** Installs the explicit browser-test adapter used instead of real operating-system dialogs. */
export async function installWorkspaceServiceMock(page: Page, mode: WorkspaceMockMode) {
  await page.addInitScript((initialMode) => {
    const baseManifest = {
      schemaVersion: 1 as const,
      workspaceId: "01900000-0000-7000-8000-000000000000",
      name: "Neo",
      createdAt: "2026-07-21T20:00:00.000Z",
      updatedAt: "2026-07-21T20:00:00.000Z",
    };
    let activeWorkspace: WorkspaceSummary | null =
      initialMode === "active"
        ? { manifest: baseManifest, rootPath: "C:\\Users\\Example\\Neo" }
        : null;

    const browserWindow = window as Window & { __NEO_WORKSPACE_SERVICE__?: WorkspaceService };
    browserWindow.__NEO_WORKSPACE_SERVICE__ = {
      createWorkspace(_selectionToken: string, workspaceName: string) {
        activeWorkspace = {
          manifest: { ...baseManifest, name: workspaceName },
          rootPath: `C:\\Users\\Example\\${workspaceName}`,
        };
        return Promise.resolve(activeWorkspace);
      },
      loadSession() {
        return Promise.resolve({
          activeWorkspace,
          recentWorkspaces: activeWorkspace ? [activeWorkspace] : [],
        });
      },
      openExistingWorkspace() {
        if (initialMode === "invalid-open") {
          return Promise.reject(
            Object.assign(new Error("mock native rejection"), { code: "not_workspace" }),
          );
        }

        activeWorkspace = {
          manifest: { ...baseManifest, name: "Familia" },
          rootPath: "D:\\Familia\\Neo",
        };
        return Promise.resolve(activeWorkspace);
      },
      openRecentWorkspace() {
        return activeWorkspace
          ? Promise.resolve(activeWorkspace)
          : Promise.reject(new Error("No recent workspace configured"));
      },
      selectParentDirectory() {
        return Promise.resolve({
          displayPath: "C:\\Users\\Example",
          token: "550e8400-e29b-41d4-a716-446655440000",
        });
      },
    };
  }, mode);
}
