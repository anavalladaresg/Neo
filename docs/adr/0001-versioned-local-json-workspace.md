# ADR 0001: Use a versioned local JSON workspace

- **Status:** Accepted
- **Date:** 2026-07-21

## Context

Neo must work fully offline, require no account or backend, keep user data portable, and support future schema changes without exposing users to an opaque database. The first milestone needs only a small profile slice, while future domains will grow independently and include separate media files.

## Decision

Use a user-selected workspace directory containing `workspace.json`, multiple small domain JSON documents, separate assets, and backups. Every JSON document has a `schemaVersion`, is validated before use, and evolves through ordered migrations. References to binary files are workspace-relative. Writes are atomic where possible, and migrations require a verified backup first.

## Alternatives considered

### SQLite

SQLite provides transactions and querying but makes casual inspection and selective recovery harder, adds migration and packaging complexity before it is needed, and conflicts with the approved initial constraint.

### One large JSON file

A single file is easy to start but increases corruption impact, write amplification, merge difficulty, and migration coupling between unrelated domains.

### Cloud or remote database

Remote storage conflicts with offline completeness, user-controlled data, no-account operation, and the prohibition on hidden network dependencies.

## Consequences

- Users can inspect and back up data with ordinary tools.
- Each domain can evolve and recover independently.
- Neo must implement careful path authorization, atomic replacement, cross-document consistency rules, validation, migrations, and backup verification.
- Complex cross-domain querying may require in-memory indexes. A future database requires a new approved issue and ADR rather than an implicit change.
