import { describe, expect, it } from "vitest";

import {
  parseWorkspaceManifest,
  WorkspaceManifestError,
  workspaceManifestSchema,
} from "./workspace-manifest";

const validManifest = {
  schemaVersion: 1,
  workspaceId: "01900000-0000-7000-8000-000000000000",
  name: "Neo",
  createdAt: "2026-07-21T20:00:00.000Z",
  updatedAt: "2026-07-21T20:00:00.000Z",
};

describe("workspace manifest", () => {
  it("parses a valid manifest and preserves safe unknown fields", () => {
    expect(parseWorkspaceManifest({ ...validManifest, futureField: "kept" })).toEqual({
      ...validManifest,
      futureField: "kept",
    });
    expect(workspaceManifestSchema.safeParse(validManifest).success).toBe(true);
  });

  it.each([null, {}, { ...validManifest, workspaceId: "invalid" }])(
    "rejects malformed manifest input %#",
    (input) => {
      expect(() => parseWorkspaceManifest(input)).toThrow(
        new WorkspaceManifestError("malformed_manifest"),
      );
    },
  );

  it("rejects unsupported schema versions before full parsing", () => {
    expect(() => parseWorkspaceManifest({ ...validManifest, schemaVersion: 2 })).toThrow(
      new WorkspaceManifestError("unsupported_schema"),
    );
  });
});
