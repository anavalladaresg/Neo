import { beforeEach, describe, expect, it, vi } from "vitest";

import type { WorkspaceService } from "../services/workspace-service";
import { createWorkspaceStore } from "./workspace-store";

const neoWorkspace = {
  manifest: {
    schemaVersion: 1 as const,
    workspaceId: "01900000-0000-7000-8000-000000000000",
    name: "Neo",
    createdAt: "2026-07-21T20:00:00.000Z",
    updatedAt: "2026-07-21T20:00:00.000Z",
  },
  rootPath: "C:\\Users\\Example\\Neo",
};
const familyWorkspace = {
  manifest: {
    ...neoWorkspace.manifest,
    workspaceId: "01900000-0000-7000-8000-000000000001",
    name: "Familia",
  },
  rootPath: "C:\\Users\\Example\\Familia",
};

function createService(): WorkspaceService {
  return {
    createWorkspace: vi.fn().mockResolvedValue(neoWorkspace),
    loadSession: vi.fn().mockResolvedValue({
      activeWorkspace: null,
      recentWorkspaces: [familyWorkspace],
    }),
    openExistingWorkspace: vi.fn().mockResolvedValue(neoWorkspace),
    openRecentWorkspace: vi.fn().mockResolvedValue(familyWorkspace),
    selectParentDirectory: vi.fn().mockResolvedValue({
      displayPath: "C:\\Users\\Example",
      token: "550e8400-e29b-41d4-a716-446655440000",
    }),
  };
}

describe("workspace state", () => {
  let service: WorkspaceService;

  beforeEach(() => {
    service = createService();
  });

  it("enters onboarding with validated recent workspaces when no workspace is active", async () => {
    const store = createWorkspaceStore(service);
    await store.getState().initialize();
    await store.getState().initialize();

    expect(store.getState().status).toBe("onboarding");
    expect(store.getState().recentWorkspaces).toEqual([familyWorkspace]);
    expect(service.loadSession).toHaveBeenCalledOnce();
  });

  it("restores an active workspace on startup", async () => {
    vi.mocked(service.loadSession).mockResolvedValue({
      activeWorkspace: neoWorkspace,
      recentWorkspaces: [neoWorkspace],
    });
    const store = createWorkspaceStore(service);
    await store.getState().initialize();

    expect(store.getState().status).toBe("active");
    expect(store.getState().activeWorkspace).toEqual(neoWorkspace);
  });

  it("selects a parent and creates a workspace", async () => {
    const store = createWorkspaceStore(service);
    expect(await store.getState().selectParentDirectory()).toBe(true);
    expect(await store.getState().createWorkspace("Neo")).toBe(true);

    expect(service.createWorkspace).toHaveBeenCalledWith(
      "550e8400-e29b-41d4-a716-446655440000",
      "Neo",
    );
    expect(store.getState().activeWorkspace).toEqual(neoWorkspace);
    expect(store.getState().notice).toBe("created");
  });

  it("does not create without an authorized parent selection", async () => {
    const store = createWorkspaceStore(service);
    expect(await store.getState().createWorkspace("Neo")).toBe(false);
    expect(store.getState().error).toBe("selection_expired");
    expect(service.createWorkspace).not.toHaveBeenCalled();
  });

  it("keeps state unchanged when native selection is cancelled", async () => {
    vi.mocked(service.selectParentDirectory).mockResolvedValue(null);
    vi.mocked(service.openExistingWorkspace).mockResolvedValue(null);
    const store = createWorkspaceStore(service);
    await store.getState().initialize();

    expect(await store.getState().selectParentDirectory()).toBe(false);
    expect(await store.getState().openExistingWorkspace()).toBe(false);
    expect(store.getState().status).toBe("onboarding");
    expect(store.getState().pendingSelection).toBeNull();
  });

  it("opens existing and recent workspaces without duplicating recents", async () => {
    const store = createWorkspaceStore(service);
    await store.getState().initialize();
    expect(await store.getState().openExistingWorkspace()).toBe(true);
    expect(await store.getState().openRecentWorkspace(familyWorkspace.manifest.workspaceId)).toBe(
      true,
    );

    expect(store.getState().activeWorkspace).toEqual(familyWorkspace);
    expect(store.getState().recentWorkspaces).toEqual([familyWorkspace, neoWorkspace]);
  });

  it("maps operation and startup failures without leaking native details", async () => {
    vi.mocked(service.loadSession).mockRejectedValue({ code: "settings_unavailable" });
    vi.mocked(service.selectParentDirectory).mockRejectedValue(new Error("C:\\private"));
    vi.mocked(service.openExistingWorkspace).mockRejectedValue({ code: "malformed_manifest" });
    vi.mocked(service.openRecentWorkspace).mockRejectedValue({ code: "not_workspace" });
    const store = createWorkspaceStore(service);

    await store.getState().initialize();
    expect(store.getState().error).toBe("settings_unavailable");
    expect(store.getState().status).toBe("onboarding");
    await store.getState().selectParentDirectory();
    expect(store.getState().error).toBe("unexpected");
    await store.getState().openExistingWorkspace();
    expect(store.getState().error).toBe("malformed_manifest");
    await store.getState().openRecentWorkspace(neoWorkspace.manifest.workspaceId);
    expect(store.getState().error).toBe("not_workspace");
    store.getState().clearError();
    expect(store.getState().error).toBeNull();
  });

  it("keeps the parent selection available after a recoverable creation failure", async () => {
    vi.mocked(service.createWorkspace).mockRejectedValue({ code: "destination_conflict" });
    const store = createWorkspaceStore(service);
    await store.getState().selectParentDirectory();

    expect(await store.getState().createWorkspace("Neo")).toBe(false);
    expect(store.getState().operation).toBe("idle");
    expect(store.getState().error).toBe("destination_conflict");
    expect(store.getState().pendingSelection).not.toBeNull();
  });
});
