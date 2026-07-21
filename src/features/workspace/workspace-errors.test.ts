import { describe, expect, it } from "vitest";

import { normalizeWorkspaceError, workspaceErrorCodes } from "./workspace-errors";
import { getWorkspaceErrorMessage } from "./workspace-copy";

describe("workspace error mapping", () => {
  it.each(workspaceErrorCodes)("keeps stable native error code %s", (code) => {
    expect(normalizeWorkspaceError({ code })).toBe(code);
    expect(getWorkspaceErrorMessage(code).title).not.toBe("");
    expect(getWorkspaceErrorMessage(code).description).not.toBe("");
  });

  it.each([null, new Error("private path"), { code: "unknown" }, "write failed"])(
    "maps unsafe error details to an unexpected error %#",
    (error) => {
      expect(normalizeWorkspaceError(error)).toBe("unexpected");
    },
  );
});
