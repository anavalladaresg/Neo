import { z } from "zod";

export const WORKSPACE_SCHEMA_VERSION = 1 as const;

export const workspaceManifestSchema = z
  .object({
    schemaVersion: z.literal(WORKSPACE_SCHEMA_VERSION),
    workspaceId: z.uuid(),
    name: z.string().min(1).max(80),
    createdAt: z.iso.datetime({ offset: true }),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .passthrough();

export type WorkspaceManifest = z.infer<typeof workspaceManifestSchema>;

export class WorkspaceManifestError extends Error {
  constructor(public readonly code: "malformed_manifest" | "unsupported_schema") {
    super(code);
    this.name = "WorkspaceManifestError";
  }
}

/** Parses workspace metadata only after explicitly checking its schema version. */
export function parseWorkspaceManifest(input: unknown): WorkspaceManifest {
  const versionResult = z
    .object({ schemaVersion: z.number().int() })
    .passthrough()
    .safeParse(input);

  if (!versionResult.success) {
    throw new WorkspaceManifestError("malformed_manifest");
  }

  if (versionResult.data.schemaVersion !== WORKSPACE_SCHEMA_VERSION) {
    throw new WorkspaceManifestError("unsupported_schema");
  }

  const manifestResult = workspaceManifestSchema.safeParse(input);

  if (!manifestResult.success) {
    throw new WorkspaceManifestError("malformed_manifest");
  }

  return manifestResult.data;
}
