# Release process

## Versioning

Neo follows Semantic Versioning and uses prerelease versions while the product is incomplete. The first target is `0.1.0-alpha.1` with tag `v0.1.0-alpha.1`.

Synchronize every release version across:

- `package.json` and `package-lock.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml` and `src-tauri/Cargo.lock`
- `CHANGELOG.md`
- Workflow and release metadata that contains a version

## Release preparation

1. Confirm every milestone issue is complete through a reviewed pull request.
2. Create `release/v<version>` from updated `main` and link a release issue.
3. Synchronize versions and finalize changelog/release notes.
4. Document workspace schema changes, migrations, upgrade steps, and known limitations.
5. Run the full test, coverage, Rust, frontend, end-to-end, and Tauri build matrix.
6. Open a focused release PR and obtain required approval.
7. Rebase-merge only after all required checks pass and conversations are resolved.

## Publishing

Publish only from the verified commit on `main`. Create an annotated `v<version>` tag and a GitHub Release marked prerelease when appropriate. Attach Windows installer artifacts and checksums where practical. Release notes are English and link included issues and pull requests.

The manually dispatched `Release candidate` workflow validates a requested Git ref and uploads MSI and NSIS artifacts with read-only repository permissions. It does not create a tag, GitHub Release, or published release asset; issue #11 owns those irreversible release actions.

Do not move or replace a published tag. If an artifact is defective, document it and prepare a new patch/prerelease version.

## Verification

On a clean supported Windows environment, verify download checksum, installation, launch, workspace create/select, profile create/save, restart, edit, corruption recovery, and uninstall behaviour. Confirm the application makes no unexpected network requests during the critical flow.

## Rollback and data compatibility

Application rollback does not imply workspace downgrade support. Release notes must state the highest workspace schema written and whether older versions can open it safely. A failed migration restores or retains the verified pre-migration backup; the release process must never instruct users to delete their only workspace copy.
