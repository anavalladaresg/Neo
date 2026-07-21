# Local workspace

## Purpose

A Neo workspace is a user-selected directory similar to an Obsidian vault. It is portable, inspectable, and independent of an account or database.

## Target layout

```text
NeoWorkspace/
├── workspace.json
├── data/
│   ├── profile.json
│   ├── weights.json
│   ├── feeding.json
│   ├── health.json
│   ├── medications.json
│   ├── training.json
│   ├── behaviour.json
│   ├── expenses.json
│   ├── milestones.json
│   └── notes.json
├── assets/
│   ├── photos/
│   ├── thumbnails/
│   └── documents/
└── backups/
```

Only `workspace.json` and directories needed by the current feature must exist initially. Domain files remain small and separate to limit corruption impact, simplify migrations, and make manual recovery understandable.

## Workspace selection

The user selects a root through a native directory dialog. Rust canonicalizes it, validates metadata, and stores an authorization reference appropriate to the operating system. Frontend code addresses known logical documents; it never supplies arbitrary absolute paths.

The path policy rejects:

- Absolute or drive-relative document paths
- `.` and `..` path segments after decoding and normalization
- Alternate separators used to escape checks
- Canonical targets outside the selected root
- Symlinks or junctions that resolve outside the root
- Device paths and unsupported filesystem namespaces

## Atomic writes

For an existing document, Neo will:

1. Validate the in-memory value.
2. Serialize deterministic UTF-8 JSON.
3. Create a uniquely named temporary sibling file with exclusive creation.
4. Write, flush, and close the temporary file.
5. Replace the target atomically where Windows and the filesystem support it.
6. Remove an abandoned temporary file only after confirming it belongs to the current operation and workspace.

A failure before replacement leaves the previous valid file untouched. Neo never truncates the destination before a complete replacement is ready.

## Backups and migrations

Before a future schema migration, Neo creates a timestamped backup under `backups/` containing workspace metadata and every document or asset reference needed to restore the prior state. The backup is verified before migration begins. Backup retention and pruning require a separate issue because deletion is a destructive policy decision.

## Malformed data recovery

Malformed JSON, schema violations, unsupported versions, and missing referenced assets are distinct conditions. Neo keeps the invalid file unchanged, prevents it from entering state, and displays a Spanish explanation with safe choices such as retry, choose another workspace, open the workspace location, or restore a verified backup.

Recovery must not silently reset a profile or overwrite unknown data. Manual edits should be performed on a copy, and support instructions must avoid collecting personal content unnecessarily.

## Example data

Tests may create isolated temporary workspaces containing fictional profiles. Temporary cleanup must resolve and verify the exact test root before deleting it. Repository ignore rules exclude common workspace names and release outputs.
