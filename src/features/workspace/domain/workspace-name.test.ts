import { describe, expect, it } from "vitest";

import { normalizeWorkspaceName, validateWorkspaceName } from "./workspace-name";

describe("workspace name validation", () => {
  it("normalizes surrounding and repeated whitespace", () => {
    expect(normalizeWorkspaceName("  Mi   espacio Neo  ")).toBe("Mi espacio Neo");
    expect(validateWorkspaceName("  Mi   espacio Neo  ")).toEqual({
      success: true,
      value: "Mi espacio Neo",
    });
  });

  it.each([
    ["", "required"],
    ["   ", "required"],
    [".", "path_traversal"],
    ["..", "path_traversal"],
    ["...", "dot_only"],
    ["../Neo", "path_traversal"],
    ["..\\Neo", "path_traversal"],
    ["Neo/Casa", "prohibited_character"],
    ["Neo<Casa", "prohibited_character"],
    ["Neo.", "trailing_period"],
    ["CON", "reserved_name"],
    ["con.txt", "reserved_name"],
    ["PRN", "reserved_name"],
    ["AUX", "reserved_name"],
    ["NUL", "reserved_name"],
    ["COM1", "reserved_name"],
    ["COM9.log", "reserved_name"],
    ["LPT1", "reserved_name"],
    ["LPT9", "reserved_name"],
    ["N".repeat(81), "too_long"],
  ])("rejects %j with %s", (value, code) => {
    expect(validateWorkspaceName(value)).toEqual({ code, success: false });
  });

  it.each(["Neo", "CONejito", "COM10", "Mi perro 2026", "Álbum de Neo"])(
    "accepts the portable name %s",
    (value) => {
      expect(validateWorkspaceName(value)).toEqual({ success: true, value });
    },
  );
});
