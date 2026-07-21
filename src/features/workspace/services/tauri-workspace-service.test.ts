import { beforeEach, describe, expect, it, vi } from "vitest";

import { neoWorkspaceFixture } from "../../../test/workspace-test-service";
import { getDefaultWorkspaceService, tauriWorkspaceService } from "./tauri-workspace-service";

const { invokeMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({ invoke: invokeMock }));

describe("Tauri workspace service", () => {
  beforeEach(() => {
    invokeMock.mockReset();
    delete window.__NEO_WORKSPACE_SERVICE__;
  });

  it("invokes the narrow native commands and validates their results", async () => {
    const selection = {
      displayPath: "…\\Documents",
      token: "550e8400-e29b-41d4-a716-446655440000",
    };
    invokeMock
      .mockResolvedValueOnce(selection)
      .mockResolvedValueOnce(neoWorkspaceFixture)
      .mockResolvedValueOnce({
        activeWorkspace: neoWorkspaceFixture,
        recentWorkspaces: [neoWorkspaceFixture],
      })
      .mockResolvedValueOnce(neoWorkspaceFixture)
      .mockResolvedValueOnce(neoWorkspaceFixture);

    await expect(tauriWorkspaceService.selectParentDirectory()).resolves.toEqual(selection);
    await expect(tauriWorkspaceService.createWorkspace(selection.token, "Neo")).resolves.toEqual(
      neoWorkspaceFixture,
    );
    await expect(tauriWorkspaceService.loadSession()).resolves.toEqual({
      activeWorkspace: neoWorkspaceFixture,
      recentWorkspaces: [neoWorkspaceFixture],
    });
    await expect(tauriWorkspaceService.openExistingWorkspace()).resolves.toEqual(
      neoWorkspaceFixture,
    );
    await expect(
      tauriWorkspaceService.openRecentWorkspace(neoWorkspaceFixture.manifest.workspaceId),
    ).resolves.toEqual(neoWorkspaceFixture);

    expect(invokeMock.mock.calls).toEqual([
      ["select_workspace_parent"],
      ["create_local_workspace", { selectionToken: selection.token, workspaceName: "Neo" }],
      ["load_workspace_session"],
      ["open_local_workspace"],
      ["open_recent_workspace", { workspaceId: neoWorkspaceFixture.manifest.workspaceId }],
    ]);
  });

  it("preserves native directory dialog cancellation", async () => {
    invokeMock.mockResolvedValue(null);

    await expect(tauriWorkspaceService.selectParentDirectory()).resolves.toBeNull();
    await expect(tauriWorkspaceService.openExistingWorkspace()).resolves.toBeNull();
  });

  it("uses an explicit browser adapter only when one is installed", () => {
    expect(getDefaultWorkspaceService()).toBe(tauriWorkspaceService);

    window.__NEO_WORKSPACE_SERVICE__ = tauriWorkspaceService;
    expect(getDefaultWorkspaceService()).toBe(window.__NEO_WORKSPACE_SERVICE__);
  });
});
