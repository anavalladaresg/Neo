/** Abbreviates private local paths while retaining the useful final segments. */
export function formatPrivateWorkspacePath(path: string, visibleSegments = 2): string {
  const segments = path.split(/[\\/]+/u).filter(Boolean);
  if (segments.length <= visibleSegments) {
    return path;
  }

  return `…\\${segments.slice(-visibleSegments).join("\\")}`;
}

export function formatWorkspaceDate(isoTimestamp: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeZone: "Europe/Madrid",
  }).format(new Date(isoTimestamp));
}
