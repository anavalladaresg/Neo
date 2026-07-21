import { z } from "zod";

import { parseWorkspaceManifest, workspaceManifestSchema } from "./workspace-manifest";

export interface DirectorySelection {
  displayPath: string;
  token: string;
}

export interface WorkspaceSummary {
  manifest: ReturnType<typeof parseWorkspaceManifest>;
  rootPath: string;
}

export interface WorkspaceSession {
  activeWorkspace: WorkspaceSummary | null;
  recentWorkspaces: WorkspaceSummary[];
}

const directorySelectionSchema = z.object({
  displayPath: z.string().min(1),
  token: z.uuid(),
});

const workspaceSummarySchema = z.object({
  manifest: workspaceManifestSchema,
  rootPath: z.string().min(1),
});

const workspaceSessionSchema = z.object({
  activeWorkspace: workspaceSummarySchema.nullable(),
  recentWorkspaces: z.array(workspaceSummarySchema),
});

export function parseDirectorySelection(input: unknown): DirectorySelection {
  return directorySelectionSchema.parse(input);
}

export function parseWorkspaceSummary(input: unknown): WorkspaceSummary {
  const parsed = workspaceSummarySchema.parse(input);

  return {
    ...parsed,
    manifest: parseWorkspaceManifest(parsed.manifest),
  };
}

export function parseWorkspaceSession(input: unknown): WorkspaceSession {
  const parsed = workspaceSessionSchema.parse(input);

  return {
    activeWorkspace: parsed.activeWorkspace ? parseWorkspaceSummary(parsed.activeWorkspace) : null,
    recentWorkspaces: parsed.recentWorkspaces.map(parseWorkspaceSummary),
  };
}
