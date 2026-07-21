export const WORKSPACE_NAME_MAX_LENGTH = 80;

export type WorkspaceNameErrorCode =
  | "dot_only"
  | "path_traversal"
  | "prohibited_character"
  | "required"
  | "reserved_name"
  | "too_long"
  | "trailing_period";

export type WorkspaceNameValidation =
  { success: true; value: string } | { code: WorkspaceNameErrorCode; success: false };

const prohibitedCharacters = /[<>:"/\\|?*]/u;
const reservedDeviceName = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/iu;

/** Normalizes display whitespace without changing meaningful filename characters. */
export function normalizeWorkspaceName(value: string): string {
  return value.trim().split(/\s+/u).filter(Boolean).join(" ");
}

/** Validates a portable workspace folder name against Windows filename rules. */
export function validateWorkspaceName(value: string): WorkspaceNameValidation {
  const normalized = normalizeWorkspaceName(value);

  if (!normalized) {
    return { code: "required", success: false };
  }

  if (normalized === "." || normalized === ".." || /(?:^|[/\\])\.\.(?:[/\\]|$)/u.test(value)) {
    return { code: "path_traversal", success: false };
  }

  if (/^\.+$/u.test(normalized)) {
    return { code: "dot_only", success: false };
  }

  if (prohibitedCharacters.test(normalized)) {
    return { code: "prohibited_character", success: false };
  }

  if (normalized.endsWith(".")) {
    return { code: "trailing_period", success: false };
  }

  if (reservedDeviceName.test(normalized)) {
    return { code: "reserved_name", success: false };
  }

  if (Array.from(normalized).length > WORKSPACE_NAME_MAX_LENGTH) {
    return { code: "too_long", success: false };
  }

  return { success: true, value: normalized };
}
