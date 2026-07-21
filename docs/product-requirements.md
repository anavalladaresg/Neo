# Product requirements

## Product statement

Neo is a warm, focused desktop application for managing the life, health, training, and memories of a dog. It gives the owner direct control of readable local data and remains useful without an internet connection or account.

## Product principles

1. **Local ownership:** the user selects the workspace and can inspect, copy, and back it up with ordinary filesystem tools.
2. **Offline completeness:** core behaviour has no backend, remote database, cloud dependency, telemetry, analytics, advertisements, or hidden requests.
3. **Safe evolution:** documents are versioned, validated, migration-ready, and protected against partial writes.
4. **Small vertical slices:** each issue delivers one complete, tested outcome rather than a broad unfinished layer.
5. **Calm utility:** the interface is warm and personal without losing the clarity and efficiency expected from desktop software.

## Audience and platform

The first audience is a Spanish-speaking dog owner using Windows. Interface content uses Spanish, locale `es-ES`, and default timezone `Europe/Madrid`. The architecture must remain portable to a future macOS package without replacing the React domain layer or workspace format.

## Initial product areas

- Inicio
- Alimentación
- Salud
- Entrenamiento
- Galería
- Evolución
- Recordatorios
- Notas
- Ajustes

The broader roadmap includes a dog profile, weight history, feeding, food transitions, treats, training, medication, vaccinations, veterinary appointments, symptoms, documents, photographs, milestones, annual reports, expenses, and behaviour observations.

## First milestone

Milestone `v0.1.0-alpha.1 — Local profile foundation` provides a thin profile workflow:

- Create or select a local Neo workspace.
- Create and edit a validated profile containing name, breed, sex, birth date, current weight, profile photograph, and notes.
- Store the profile as local JSON and its photograph as a separate workspace asset.
- Close and reopen Neo without losing the profile.
- Handle malformed profile data safely with clear Spanish recovery guidance.
- Display basic profile details on Inicio.
- Package a tested Windows prerelease.

All other product areas may have navigation placeholders but are outside this milestone's functional scope.

## Experience requirements

The visual direction is warm, minimal, professional, realistic, and desktop-first. Use warm off-white backgrounds, neutral beige surfaces, soft sage accents, muted terracotta emphasis, charcoal text, soft borders and shadows, generous spacing, rounded cards, and clear hierarchy.

The supplied concept image is inspiration for tone, density, and information hierarchy. It is not a specification to copy. Neo must use an original implementation, licensed assets, and honest data states rather than decorative fabricated metrics.

The application requires a proper desktop sidebar, keyboard navigation, visible focus, accessible labels, sufficient contrast, empty/loading/error states, confirmation for destructive actions, resize support, and no horizontal scrolling at standard desktop sizes. Target WCAG 2.2 AA where applicable.

## Non-goals

- A social network, marketplace, veterinary diagnosis tool, or emergency service
- A mandatory account, cloud sync, remote backup, or collaborative workspace
- A database in the initial architecture
- Telemetry, behavioural analytics, advertisements, or growth tracking
- Implementing all planned domains in the first release

## Success criteria

The milestone succeeds when a clean Windows installation completes the profile persistence flow offline, the required test and build matrix passes, documentation matches behaviour, and a traceable prerelease contains the installer and release metadata.
