import { vi } from "vitest";

import type { WorkspaceSummary } from "../features/workspace/domain/workspace-types";
import type { WorkspaceService } from "../features/workspace/services/workspace-service";

export const neoWorkspaceFixture: WorkspaceSummary = {
  manifest: {
    schemaVersion: 1,
    workspaceId: "01900000-0000-7000-8000-000000000000",
    name: "Neo",
    createdAt: "2026-07-21T20:00:00.000Z",
    updatedAt: "2026-07-21T20:00:00.000Z",
  },
  rootPath: "C:\\Users\\Example\\Neo",
};

export function createWorkspaceServiceMock(
  overrides: Partial<WorkspaceService> = {},
): WorkspaceService {
  return {
    createWorkspace: vi.fn().mockResolvedValue(neoWorkspaceFixture),
    loadSession: vi.fn().mockResolvedValue({
      activeWorkspace: neoWorkspaceFixture,
      recentWorkspaces: [neoWorkspaceFixture],
    }),
    openExistingWorkspace: vi.fn().mockResolvedValue(neoWorkspaceFixture),
    openRecentWorkspace: vi.fn().mockResolvedValue(neoWorkspaceFixture),
    selectParentDirectory: vi.fn().mockResolvedValue({
      displayPath: "C:\\Users\\Example",
      token: "550e8400-e29b-41d4-a716-446655440000",
    }),
    ...overrides,
  };
}
