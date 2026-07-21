# Architecture

## System overview

Neo uses a Tauri 2 native shell with a React and TypeScript frontend. The frontend owns presentation, client-side application state, domain validation, and Spanish formatting. Rust owns privileged desktop operations such as native dialogs and constrained filesystem access.

```text
React routes and components
        |
Application services and Zustand stores
        |
Zod-validated domain and persistence ports
        |
Typed Tauri command adapter
        |
Rust workspace service
        |
User-selected Neo workspace
```

The dependency direction points inward: React depends on application interfaces, not filesystem details. Tauri adapters implement those interfaces. Domain schemas and pure migrations remain testable without a desktop runtime.

## Runtime boundaries

### React and TypeScript

- Render the Spanish interface and accessibility semantics.
- Parse user input and stored documents with shared Zod schemas.
- Manage transient application state.
- Format dates and numbers with `es-ES` and default timezone `Europe/Madrid`.
- Call a narrow, typed persistence adapter.

React components must not read or write filesystem paths directly.

### Rust and Tauri

- Open native workspace and asset selection dialogs.
- Canonicalize and authorize filesystem targets.
- Create workspace directories.
- Read and atomically replace approved workspace files.
- Copy approved assets into workspace-relative locations.
- Convert native failures to stable, non-sensitive error codes.

Tauri capabilities stay restrictive. Generic arbitrary-path read/write commands are prohibited.

## Offline guarantee

The shipped application does not require network permissions or networking dependencies for product behaviour. Any proposed network access requires a dedicated architecture issue, threat analysis, ADR, visible user value, and explicit approval. Build tools may download dependencies during development; that is not product runtime behaviour.

## Data flow

1. A user selects or creates a workspace with a native dialog.
2. Rust canonicalizes the root and validates `workspace.json`.
3. The frontend requests a known logical document such as `profile`; it does not provide an arbitrary file path.
4. Rust reads the corresponding path inside the authorized root.
5. TypeScript parses the JSON with the matching Zod schema before state changes.
6. Writes serialize a validated document, write and flush a temporary sibling file, then atomically replace the target where the platform permits.
7. A future migration first creates a backup and only then replaces migrated documents.

## Error model

Native commands return stable error categories such as workspace not found, access denied, invalid path, malformed document, unsupported schema, and write failure. Internal paths and operating-system details are logged only when safe for local diagnostics. The interface maps categories to concise Spanish messages and offers non-destructive recovery actions.

## Directory direction

The intended source layout will evolve by issue:

```text
src/
  app/             routing and composition
  components/      reusable interface elements
  features/        vertical product slices
  domain/          schemas, types, migrations, formatting
  persistence/     ports and Tauri adapters
  state/           application stores
src-tauri/src/
  commands/        documented Tauri command handlers
  workspace/       path policy and filesystem operations
```

Do not create empty architectural folders before an issue needs them.

## Decisions

- [ADR 0001: Use a versioned local JSON workspace](adr/0001-versioned-local-json-workspace.md)
- [ADR 0002: Keep privileged filesystem access behind typed Tauri commands](adr/0002-typed-tauri-storage-boundary.md)

New significant decisions require an ADR with status, context, decision, alternatives, and consequences.
