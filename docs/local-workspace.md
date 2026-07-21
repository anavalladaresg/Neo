# Local workspace

## Purpose

A Neo workspace is a user-selected directory similar to an Obsidian vault. It is portable, inspectable, independent of an account or database, and never uploaded by the application.

## Current layout

Issue #5 creates exactly this initial structure:

```text
NeoWorkspace/
|-- workspace.json
|-- data/
|-- assets/
|   |-- photos/
|   |-- thumbnails/
|   `-- documents/
`-- backups/
```

No product-domain JSON document is created until its feature exists. This prevents empty placeholder files from becoming an accidental schema commitment.

## Manifest schema

`workspace.json` is portable and contains no absolute computer-specific path:

```json
{
  "schemaVersion": 1,
  "workspaceId": "01900000-0000-7000-8000-000000000000",
  "name": "Neo",
  "createdAt": "2026-07-21T20:00:00.000Z",
  "updatedAt": "2026-07-21T20:00:00.000Z"
}
```

`workspaceId` is a UUID, timestamps are ISO 8601 UTC values, and `schemaVersion` is exactly `1`. Rust validates the file before returning it; TypeScript validates the native result with Zod before it enters Zustand state. Safe unknown manifest fields are retained when parsing and serializing. A future schema version is rejected without changing the file.

## Workspace-name policy

Names are trimmed and repeated internal whitespace is collapsed. A name is limited to 80 characters and is rejected when it:

- is empty, dot-only, or contains a traversal sequence;
- contains a Windows-prohibited character (`< > : " / \ | ? *`);
- ends in a period or space;
- is a Windows device name (`CON`, `PRN`, `AUX`, `NUL`, `COM1` through `COM9`, or `LPT1` through `LPT9`), including those names with an extension; or
- conflicts case-insensitively with an existing child of the selected parent on Windows.

The same policy is tested in TypeScript for form feedback and in Rust at the write boundary.

## Creation lifecycle

1. Rust opens a native folder dialog for the parent directory.
2. Rust canonicalizes the selected directory and keeps it behind a one-use opaque UUID token. The frontend receives the token and a display value, not write authority over an arbitrary path.
3. The user enters and confirms a validated name.
4. Rust revalidates the name, rejects symlink parents and conflicts, and creates a uniquely named temporary sibling directory.
5. Rust creates the required directories and writes `workspace.json` through an exclusive temporary file.
6. Rust reads and validates the completed manifest.
7. Rust renames the complete temporary directory to the final name.
8. Only after successful creation does Neo remember and activate the workspace.

On failure, Neo removes only the temporary directory created by that operation. It never removes the selected parent, an existing destination, or unrelated files. An existing destination is never overwritten.

## Opening lifecycle

Rust opens a native folder dialog, canonicalizes the selected root, rejects unsafe symlink manifests, and validates `workspace.json`. Cancellation leaves application state unchanged. Missing, malformed, and unsupported manifests map to distinct stable codes and Spanish recovery messages; Neo does not repair or replace the selected workspace.

Recent entries are addressed from the frontend by `workspaceId`, not path. Rust looks up the corresponding application-local path and validates the workspace again before activation.

## Application-local settings

Installation-specific references live in Tauri's application configuration directory as `settings.json`. On Windows this resolves through Tauri's `app_config_dir` for identifier `com.ana.neo-desktop` (normally below `%APPDATA%`). The portable workspace never contains these machine-specific values.

```json
{
  "schemaVersion": 1,
  "activeWorkspacePath": "C:\\Users\\Example\\Neo",
  "recentWorkspacePaths": ["C:\\Users\\Example\\Neo"]
}
```

The list is limited to five entries. Missing, malformed, unsupported, inaccessible, or no-longer-valid references are ignored or pruned during startup. A remembered path is always revalidated. This file contains no dog data.

Settings updates use a unique temporary file and a unique backup during replacement. If replacement fails, the previous file is restored where possible. Temporary and backup files owned by the operation are cleaned up.

## Security boundary and permissions

The frontend can invoke only five logical workspace operations:

- `select_workspace_parent`
- `create_local_workspace`
- `open_local_workspace`
- `load_workspace_session`
- `open_recent_workspace`

The production adapter accepts an opaque selection token, a validated name, or a stable workspace ID. It never accepts a frontend-supplied filesystem path. Rust owns native dialogs, canonicalization, authorization, creation, inspection, and settings I/O. Tauri's main-window capability grants only `core:default`; no broad filesystem, shell, opener, or dialog permission is exposed directly to web content.

Native failures serialize only stable codes. Full private paths and raw operating-system or JSON errors are not displayed or logged by this feature.

## Recovery

- A corrupt application-local settings file does not block startup; Neo returns to onboarding.
- A missing remembered workspace is removed from the valid session and does not block startup.
- An invalid selected workspace remains unchanged and can be replaced by another selection.
- Unsupported workspace schemas remain unchanged for use with a compatible Neo version.
- Migration is not implemented in schema version 1. Future migrations must create and verify a workspace backup before modifying any document.

## Manual inspection and development reset

Use only a disposable parent directory. Create a workspace through Neo, close the application, and inspect that the exact structure above exists. Open `workspace.json` in a text editor and verify the five documented fields, UTC timestamps, and absence of an absolute path. Restart Neo to verify that the remembered workspace is revalidated and reopened.

To reset onboarding during development, close Neo, locate the Tauri `app_config_dir` for `com.ana.neo-desktop`, and move `settings.json` to a clearly named backup outside that directory. Do not delete the workspace. Restore the settings backup after testing when it belongs to an existing development installation.

## Test data

Rust tests use isolated `tempfile` directories and fictional manifests. Playwright installs an explicit in-page implementation of the workspace service so browser tests never interact with real OS directory dialogs or user files. Repository ignore rules exclude common workspace names and generated test/build output.
