# Data model

## Document conventions

Each persisted JSON document is a small, independently versioned object. Every document contains an integer `schemaVersion`. Domain records use stable UUID identifiers. Calendar dates and timestamps use ISO 8601 strings; display formatting never changes the stored representation.

Binary photographs and documents are separate files. JSON stores normalized workspace-relative paths with `/` separators, for example `assets/photos/profile/550e8400-e29b-41d4-a716-446655440000.jpg`. Absolute paths, drive-prefixed paths, parent segments, and encoded traversal are invalid.

All documents are parsed with Zod before entering application state. Parsers should preserve unknown fields when doing so is safe, so a newer document is not silently destroyed by an older application. Unsupported schema versions are opened read-only or rejected with recovery guidance; they are never rewritten as if understood.

## Workspace metadata

The initial `workspace.json` shape is planned as:

```json
{
  "schemaVersion": 1,
  "workspaceId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Neo",
  "createdAt": "2026-07-21T12:00:00.000Z",
  "updatedAt": "2026-07-21T12:00:00.000Z"
}
```

The exact schema is implemented and frozen through its domain issue and tests. Examples here are design inputs, not permission to bypass validation.

## Dog profile

The first profile document will contain:

- Document `schemaVersion`
- Stable profile `id`
- Name
- Breed
- Sex from a documented domain set
- Birth date as an ISO 8601 calendar date
- Current weight using a documented numeric unit and range
- Optional workspace-relative profile photograph path
- Optional notes
- Creation and update timestamps when required by the final schema

Weight history is a separate future document. The profile's current weight is the value needed by the first vertical slice and must not grow into an unbounded embedded history.

## Planned documents

The target `data/` directory contains independently evolving profile, weights, feeding, health, medications, training, behaviour, expenses, milestones, and notes documents. A file is created only when its feature exists; an absent optional document is not automatically corruption.

## Validation pipeline

1. Decode UTF-8 and parse JSON without mutating existing state.
2. Inspect `schemaVersion`.
3. Migrate a supported older version in memory after a backup has succeeded.
4. Validate the current schema with Zod.
5. Normalize only explicitly documented fields.
6. Publish an immutable domain value to state.

Failures retain the last known valid state and expose structured recovery information. Validation and migration modules require 100% test coverage.

## Migration contract

Migrations are pure, ordered functions between adjacent schema versions. They must be idempotent at the orchestration boundary, preserve safe unknown data, and have fixtures for every supported source version. Before any migrated file is committed, Neo creates a timestamped workspace backup and verifies that backup can be opened. A failed migration leaves the original untouched.

## Privacy

Fixtures use fictional data only. Real veterinary documents, private photographs, credentials, and generated user workspaces must never enter Git history.
