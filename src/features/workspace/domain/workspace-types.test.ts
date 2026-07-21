import { describe, expect, it } from "vitest";

import {
  parseDirectorySelection,
  parseWorkspaceSession,
  parseWorkspaceSummary,
} from "./workspace-types";

const manifest = {
  schemaVersion: 1,
  workspaceId: "01900000-0000-7000-8000-000000000000",
  name: "Neo",
  createdAt: "2026-07-21T20:00:00.000Z",
  updatedAt: "2026-07-21T20:00:00.000Z",
};
const summary = { manifest, rootPath: "C:\\Users\\Example\\Neo" };

describe("workspace boundary parsing", () => {
  it("parses native directory selections", () => {
    expect(
      parseDirectorySelection({
        displayPath: "C:\\Users\\Example",
        token: "550e8400-e29b-41d4-a716-446655440000",
      }),
    ).toEqual({
      displayPath: "C:\\Users\\Example",
      token: "550e8400-e29b-41d4-a716-446655440000",
    });
  });

  it("parses workspace summaries and sessions", () => {
    expect(parseWorkspaceSummary(summary)).toEqual(summary);
    expect(
      parseWorkspaceSession({ activeWorkspace: summary, recentWorkspaces: [summary] }),
    ).toEqual({ activeWorkspace: summary, recentWorkspaces: [summary] });
    expect(parseWorkspaceSession({ activeWorkspace: null, recentWorkspaces: [] })).toEqual({
      activeWorkspace: null,
      recentWorkspaces: [],
    });
  });

  it.each([
    () => parseDirectorySelection({ displayPath: "C:\\Neo", token: "invalid" }),
    () => parseWorkspaceSummary({ manifest: {}, rootPath: "" }),
    () => parseWorkspaceSession({ activeWorkspace: null, recentWorkspaces: "invalid" }),
  ])("rejects malformed native boundary input %#", (parse) => {
    expect(parse).toThrow();
  });
});
