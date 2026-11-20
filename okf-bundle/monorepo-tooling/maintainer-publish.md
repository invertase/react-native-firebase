---
type: Reference
title: Maintainer publish procedure
description: Canonical maintainer procedure for npm publish via GitHub Actions — main and stable-branch (release-vN) backport, CI after land, workflow_dispatch from the selected branch, dist-tags, and same-publish recovery after a partial publish.
tags: [monorepo, tooling, publish, npm, dist-tag, docs, stable-branch, backport]
timestamp: 2026-11-15T00:00:00Z
---

# Maintainer publish procedure

**Canonical owner** of how maintainers publish packages with `.github/workflows/publish.yml`, including **stable-branch** backports and releases. Decision summary: [MonoTool-AD-2](architecture-decisions.md#monotool-ad-2--keep-lerna-for-versioning-and-publish--accepted). Other docs **link here**; they do not copy this procedure.

**Policy:** [OKF documentation and commit policy](../documentation-policy.md).

Publish is a **manual** maintainer action (`workflow_dispatch` on the Publish workflow). Merging a PR into `main` (or pushing a stable branch) does **not** by itself create or publish new npm versions. The run uses the **selected branch’s** `.github/workflows/publish.yml` and `lerna.json`, not copies from `main`.

<a id="stable-branch-backport-and-publish"></a>

## Stable branch backport and publish

Stable lines (for example `release-v26`) ship older majors while `main` moves forward. Agents answering “how do I backport to a stable branch?”, “how do I release on `release-vN`?”, or “how do I publish an old line?” should follow this section.

### Land on `main` first

Default: the change belongs on **`main`** and on the stable line.

1. Open the fix on **`main`** with the normal PR path. This repo does not allow merge commits. A squash merge produces one commit on `main`. A rebase merge of several commits produces several commits on `main`.
2. Note the **squash commit SHA** on `main`. That SHA is the cherry-pick source. After a rebase merge, note **each** commit SHA and cherry-pick them **in order**.

Do not treat a PR head SHA as durable until it is on `main`.

**Stable-only exception:** a fix that applies only to the stable line, and must not land on `main`, is written on that branch. There is no `main` SHA to cherry-pick. `release-v26` already has examples: the CocoaPods pod requirement fix, and the iOS SDK 12.19.3 bump in [#9393](https://github.com/invertase/react-native-firebase/pull/9393).

### Land on the stable branch

Default is a **pull request into the stable branch** (for example `release-v26`). Earlier backports used that route ([#9393](https://github.com/invertase/react-native-firebase/pull/9393), [#9434](https://github.com/invertase/react-native-firebase/pull/9434)).

`release-v26` is protected. Required checks are enforced for non-admins, so a direct push succeeds only for a repository **admin** (protection bypass). Direct push is the admin shortcut, not the default.

1. Use an isolated worktree of the stable branch, tracking `origin/<branch>`.
2. Cherry-pick with provenance (skip this step for a stable-only fix authored on the branch):
   ```bash
   git cherry-pick -x <squash-sha>
   ```
   For a rebase merge, run that once per commit, oldest first. `-x` appends `(cherry picked from commit …)` so history stays auditable.
3. Resolve conflicts carefully. Product code usually ports cleanly; OKF / workflow files on the stable line may lag `main` and need judgment (keep the **product** fix; do not blindly take unrelated `main`-only tooling).
4. Open a PR into the stable branch and merge it when required checks are green.
5. Admin shortcut, instead of the PR: push the stable branch directly.
   ```bash
   git push origin HEAD:<stable-branch>
   ```
   Required checks then run **after** the commit has landed. They are not a pre-push merge gate. Wait until they are green before publish. A non-admin cannot land this way.

### Validate on the stable line (prefer CI)

Local hosts often run **newer** Xcode / Android / runner toolchains than the stable branch’s CI still pins. A local `yarn test:full` (or native build) can fail for environment drift even when the cherry-pick is correct.

- Prefer **GitHub Actions on the stable branch tip** after the change has landed (PR checks, or the post-push run after an admin push).
- Those checks confirm the landed commit. They are not the publish step, and on an admin push they are not a gate that runs before the commit is on the branch.
- Spot-check locally only when the host toolchain matches what that branch’s workflows use (see `.github/workflows/tests_e2e_*.yml` on that branch).
- Scope CI attention to the platforms the change actually touches, but do not publish while the branch’s required checks are red.

### Publish from the stable branch

Publish checks out the **selected branch** and runs **that branch’s** `.github/workflows/publish.yml` and `lerna.json`. Before publishing, read both files on the branch you are about to select and confirm the guards you expect are present.

On `release-v26` (read the branch again before the next publish; it can move):

- `lerna.json` does **not** set `command.version.createRelease`. Publish does **not** create GitHub Releases on that line. `main` does set `createRelease: github`.
- The publish job runs on `macos-26` with Xcode `latest-stable`, not `xcode-27`.
- The dist-tag branch and the `github.ref == refs/heads/main` docs gate are on `release-v26` only because they were cherry-picked there. A stable branch that lacks them follows its own workflow, which can still publish `latest` or deploy API docs. Do not publish until those guards are on the branch you select.

Run Publish as in [How to run Publish](#how-to-run-publish-any-branch), selecting the **stable branch** in the branch dropdown (**not** `main`).

When the selected branch’s workflow matches the guards below (see [Dist-tag follows the branch](#dist-tag-follows-the-branch) / [Docs deploy only from `main`](#docs-deploy-only-from-main)):

- npm `--dist-tag` is the **branch name** (for example `release-v26`), not `latest`.
- The public API reference site is **not** updated.

Partial publish on that branch uses the same recovery as on `main`: [Partial publish recovery](#partial-publish-recovery). That recovery is a **new** `workflow_dispatch` on the branch tip, and only when the failure was during `lerna publish`, not during `lerna version`.

## Docs deploy only from `main`

When Publish runs, the `deploy-api-reference` job runs only if the npm publish job succeeded **and** the ref is `main` (`success() && github.ref == 'refs/heads/main'`). Off-`main` publishes do not update the public API reference site. That `if` is whatever the **selected branch’s** `publish.yml` contains. Standalone `.github/workflows/deploy-api-reference.yml` is separate from this publish gate.

## Dist-tag follows the branch

These rules are whatever the **selected branch’s** `publish.yml` implements. On current `main` (and on `release-v26`, because the guards were cherry-picked):

- On **`main`:** `lerna publish from-package` uses the default tag (`latest`; no `--dist-tag`).
- Off **`main`:** the same command passes `--dist-tag` equal to the unsanitized branch name (`github.ref_name`).

<a id="how-to-run-publish-any-branch"></a>

## How to run Publish (any branch)

1. GitHub → **Actions** → **Publish**.
2. **Run workflow**.
3. Choose the branch to publish from (`main` for `latest`, or a stable branch for that line’s dist-tag). The run uses **that** branch’s `publish.yml` and `lerna.json`.
4. Confirm the run. If it fails **during** `lerna publish from-package` (not during `lerna version`, and not on a dirty tree), start a **new** workflow: **Run workflow** again on the **same branch tip**. Follow [Partial publish recovery](#partial-publish-recovery). Do **not** use GitHub’s **Re-run jobs** or **Re-run failed jobs**. That button checks out the pre-release SHA, so `lerna changed` sees the version bump as new work and `lerna version` tries to cut a tag that already exists.

The workflow bumps package versions (`lerna version`) then publishes (`lerna publish from-package`). Do not run a separate local `lerna version` unless you are intentionally cutting versions outside this workflow.

## Partial publish recovery

`lerna publish from-package` can leave some packages on the registry and others unpublished if it exits non-zero mid-run. Recovery is a **new** Publish `workflow_dispatch` on the **same branch tip** with the same dist-tag behavior: `from-package` skips versions already present and publishes the rest.

Use this recovery only when the failure was during publish, not during `lerna version` and not from a dirty tree. If `lerna version` failed before it pushed a tag, fix that failure and start Publish again only after the branch tip is the commit you intend to release. Do not use the GitHub Re-run button ([How to run Publish](#how-to-run-publish-any-branch)).

When the publish command fails, the workflow step summary includes:

> Partial publish recovery is achieved by rerunning the exact same publish

That sentence means a fresh `workflow_dispatch` on the same ref, which is also what the summary checklist says (`Rerun Publish via workflow_dispatch`). It does not mean the GitHub Re-run button.

Do not change the dist-tag, package set, or publish command for that recovery run.

## Related

| Topic | Document |
| ----- | -------- |
| Decision (short) | [MonoTool-AD-2](architecture-decisions.md#monotool-ad-2--keep-lerna-for-versioning-and-publish--accepted) |
| API reference site maintenance | [Documentation site maintenance](../documentation-site-maintenance.md) |
| Workflow | [`.github/workflows/publish.yml`](../../../.github/workflows/publish.yml) |
