import { describe, expect, it } from "vitest";

import { formatPrivateWorkspacePath, formatWorkspaceDate } from "./workspace-formatting";

describe("workspace presentation formatting", () => {
  it("abbreviates private paths while retaining useful final segments", () => {
    expect(formatPrivateWorkspacePath("C:\\Users\\Example\\Neo")).toBe("…\\Example\\Neo");
    expect(formatPrivateWorkspacePath("C:\\Neo")).toBe("C:\\Neo");
    expect(formatPrivateWorkspacePath("/Users/Example/Neo", 1)).toBe("…\\Neo");
  });

  it("formats workspace dates with the Spanish locale and Madrid timezone", () => {
    expect(formatWorkspaceDate("2026-07-21T20:00:00.000Z")).toMatch(/21.*jul.*2026/iu);
  });
});
