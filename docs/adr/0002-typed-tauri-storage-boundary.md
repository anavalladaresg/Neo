# ADR 0002: Keep privileged filesystem access behind typed Tauri commands

- **Status:** Accepted
- **Date:** 2026-07-21

## Context

The React interface needs workspace data, but exposing generic filesystem APIs or accepting arbitrary frontend paths would weaken the selected-workspace boundary and make persistence difficult to test independently from components.

## Decision

Rust implements a narrow workspace service exposed through documented, typed Tauri commands. Commands accept logical operations and constrained workspace-relative identifiers rather than arbitrary absolute paths. Rust canonicalizes and authorizes every target. TypeScript wraps commands behind persistence interfaces; React components depend on application services, not Tauri APIs.

For initial workspace creation, a native folder selection is stored in Rust and represented to the frontend by a one-use UUID token. Creation accepts only that token and a validated workspace name. Opening uses a native dialog inside Rust. Recent selections accept a workspace UUID and resolve its path from validated application-local settings. The frontend never passes an absolute path to a privileged command.

## Alternatives considered

### Direct frontend filesystem plugin access

This is convenient but spreads authorization and error handling through the UI, makes capabilities broader, and increases traversal risk.

### Generic Rust read/write commands

Centralizing I/O in Rust is insufficient if callers can still request any path. A logical command surface gives a smaller security and testing boundary.

### Running all validation in Rust

Rust validation alone would duplicate or separate form/domain rules used by React. The selected design validates native path policy in Rust and validates JSON domain shape with shared TypeScript Zod schemas before state entry, with integration tests across the boundary.

## Consequences

- Tauri capabilities can remain restrictive and auditable.
- Native filesystem behaviour receives focused Rust tests.
- UI components remain portable and easier to test.
- Command types and error codes must be versioned carefully, and data is validated on both sides where trust boundaries require it.
- Native dialog access remains inside Rust, while the webview capability stays at `core:default` with no generic filesystem permission.
