export const workspaceErrorCodes = [
  "access_denied",
  "destination_conflict",
  "invalid_name",
  "invalid_path",
  "malformed_manifest",
  "not_workspace",
  "selection_expired",
  "settings_unavailable",
  "unsupported_schema",
  "write_failed",
  "unexpected",
] as const;

export type WorkspaceErrorCode = (typeof workspaceErrorCodes)[number];

export function normalizeWorkspaceError(error: unknown): WorkspaceErrorCode {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    workspaceErrorCodes.includes((error as { code: WorkspaceErrorCode }).code)
  ) {
    return (error as { code: WorkspaceErrorCode }).code;
  }

  return "unexpected";
}
