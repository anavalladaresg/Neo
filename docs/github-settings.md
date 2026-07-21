# GitHub repository settings

## Desired state

The default branch is `main`. Repository settings should:

- Require pull requests and at least one approval.
- Require all configured CI status checks and up-to-date branches.
- Require conversation resolution.
- Require linear history.
- Apply protection to administrators where supported.
- Disable force pushes and deletion of `main`.
- Allow rebase merging and disable merge commits.
- Use minimum workflow permissions and avoid exposing secrets to untrusted pull request code.

## Observed state on 2026-07-21

- Repository: `anavalladaresg/Neo`
- Visibility: public
- Default branch: `main`
- Rebase merges: enabled
- Merge commits: disabled
- Squash merges: disabled
- Automatic head-branch deletion: disabled
- Branch protection: enabled; pull requests, one approval, stale-review dismissal, last-push approval, conversation resolution, linear history, and administrator enforcement are required
- Force pushes and deletion of `main`: disabled
- GitHub Issues, milestone, and required custom labels: created
- GitHub Actions workflows and status checks: not yet created; tracked by [issue #3](https://github.com/anavalladaresg/Neo/issues/3)

The initial remote and local scaffold histories were unrelated. They were reconciled without force push by replaying the existing scaffold commit on top of the remote initialization commit and fast-forwarding `main` before branch protection was enabled.

## Bootstrap sequence

Repository governance is introduced by issue #2. CI and its stable status-check names are introduced separately by issue #3. Protection can require CI only after those checks exist and have reported at least once. Until then, the repository has a documented bootstrap gap: maintainers must not merge without manually verified local checks and review even if GitHub cannot enforce the absent checks.

After issue #3 lands, configure protection with the exact final job names, then verify it using a test pull request. Record any plan or permission failure here and create a labeled GitHub issue for the required manual action.

## Settings audit checklist

- [x] Pull requests required
- [x] One approval required
- [ ] Required status checks configured
- [ ] Branch required to be up to date
- [x] Conversation resolution required
- [x] Linear history required
- [x] Administrators included
- [x] Force pushes disabled
- [x] Branch deletion disabled
- [x] Rebase merging allowed
- [x] Merge commits disabled
- [ ] Workflow permissions minimized

Update this document in the pull request that changes a repository setting, including API errors or plan limitations rather than silently ignoring them.
