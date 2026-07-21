# Security policy

## Supported versions

Neo is pre-alpha. Security fixes are applied to the latest development line only until the first stable release defines a broader support policy.

## Reporting a vulnerability

Do not open a public issue for an undisclosed vulnerability or include private user data in a report. Use GitHub's private vulnerability reporting feature for this repository. If that feature is unavailable, contact the repository owner privately through their GitHub profile and provide only the minimum information needed to establish a secure channel.

Include:

- A concise impact summary
- Affected version or commit
- Reproduction steps or a minimal proof of concept
- Expected security boundary and observed behaviour
- Relevant logs with secrets and personal data removed
- Suggested mitigation, if known

The maintainer will acknowledge a valid report, assess severity, prepare a private fix when practical, and coordinate disclosure. No response-time guarantee is made during pre-alpha development.

## Security boundaries

Neo is designed to operate offline with no backend, account, telemetry, analytics, advertising, or implicit network access. The selected workspace is the filesystem trust boundary. Paths must be canonicalized and constrained to that workspace, JSON must be validated before use, and writes must be atomic where possible.

Neo does not currently claim encryption at rest. Users remain responsible for operating-system access controls, disk encryption, and backups.
