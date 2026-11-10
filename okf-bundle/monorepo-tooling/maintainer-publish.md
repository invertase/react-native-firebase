---
type: Reference
title: Maintainer publish procedure
description: Canonical maintainer procedure for npm publish via GitHub Actions — main and stable-branch (release-vN) backport, CI validation, workflow_dispatch publish, dist-tags, and same-publish recovery after a partial publish.
tags: [monorepo, tooling, publish, npm, dist-tag, docs, stable-branch, backport]
timestamp: 2026-11-10T00:00:00Z
---

# Maintainer publish procedure

**Canonical owner** of how maintainers publish packages with `.github/workflows/publish.yml`, including **stable-branch** backports and releases. Decision summary: [MonoTool-AD-2](architecture-decisions.md#monotool-ad-2--keep-lerna-for-versioning-and-publish--accepted). Other docs **link here**; they do not copy this procedure.

**Policy:** [OKF documentation and commit policy](../documentation-policy.md).

Publish is a **manual** maintainer action (`workflow_dispatch` on the Publish workflow). Merging a PR into `main` (or pushing a stable branch) does **not** by itself create or publish new npm versions.

<a id="stable-branch-backport-and-publish"></a>

## Stable branch backport and publish

Stable lines (for example `release-v26`) ship older majors while `main` moves forward. Agents answering “how do I backport to a stable branch?”, “how do I release on `release-vN`?”, or “how do I publish an old line?” should follow this section.

### Land on `main` first

1. Open/merge the fix on **`main`** with the normal PR path.
2. Note the **merge commit SHA on `main`** (or the single rebased commit SHA after a rebase-merge). That SHA is the cherry-pick source.

Do not treat a PR head SHA as durable until it is on `main`.

### Cherry-pick onto the stable branch

1. Use an isolated worktree of the stable branch (for example `release-v26`), tracking `origin/<branch>`.
2. Cherry-pick with provenance:
   ```bash
   git cherry-pick -x <main-sha>
   ```
   `-x` appends `(cherry picked from commit …)` so history stays auditable.
3. Resolve conflicts carefully. Product code usually ports cleanly; OKF / workflow files on the stable line may lag `main` and need judgment (keep the **product** fix; do not blindly take unrelated `main`-only tooling).
4. Push the stable branch when ready for CI:
   ```bash
   git push origin HEAD:<stable-branch>
   ```

### Validate on the stable line (prefer CI)

Local hosts often run **newer** Xcode / Android / runner toolchains than the stable branch’s CI still pins. A local `yarn test:full` (or native build) can fail for environment drift even when the cherry-pick is correct.

- Prefer **GitHub Actions on the stable branch tip** as the merge/publish gate for that line.
- Spot-check locally only when the host toolchain matches what that branch’s workflows use (see `.github/workflows/tests_e2e_*.yml` on that branch).
- Scope CI attention to the platforms the change actually touches, but do not skip the branch’s required checks before publish.

### Publish from the stable branch

Run Publish as in [How to run Publish](#how-to-run-publish-any-branch), selecting the **stable branch** in the branch dropdown (**not** `main`).

Effects off `main` (same as [Dist-tag follows the branch](#dist-tag-follows-the-branch) / [Docs deploy only from `main`](#docs-deploy-only-from-main)):

- npm `--dist-tag` is the **branch name** (for example `release-v26`), not `latest`.
- The public API reference site is **not** updated.

Partial publish: same recovery as on `main` — [Partial publish recovery](#partial-publish-recovery).

## Docs deploy only from `main`

When Publish runs, the `deploy-api-reference` job runs only if the npm publish job succeeded **and** the ref is `main` (`success() && github.ref == 'refs/heads/main'`). Off-`main` publishes do not update the public API reference site. Standalone `.github/workflows/deploy-api-reference.yml` is separate from this publish gate.

## Dist-tag follows the branch

- On **`main`:** `lerna publish from-package` uses the default tag (`latest`; no `--dist-tag`).
- Off **`main`:** the same command passes `--dist-tag` equal to the unsanitized branch name (`github.ref_name`).

<a id="how-to-run-publish-any-branch"></a>

## How to run Publish (any branch)

1. GitHub → **Actions** → **Publish**.
2. **Run workflow**.
3. Choose the branch to publish from (`main` for `latest`, or a stable branch for that line’s dist-tag).
4. Confirm the run; if it fails partway, re-run the **same** workflow on the **same** branch until it converges.

The workflow bumps package versions (`lerna version`) then publishes (`lerna publish from-package`). Do not run a separate local `lerna version` unless you are intentionally cutting versions outside this workflow.

## Partial publish recovery

`lerna publish from-package` can leave some packages on the registry and others unpublished if it exits non-zero mid-run. Recovery is the same publish again on the same ref with the same dist-tag behavior: `from-package` skips versions already present and publishes the rest.

When the publish command fails, the workflow step summary includes:

> Partial publish recovery is achieved by rerunning the exact same publish

Do not change the dist-tag, package set, or publish command for that recovery run.

## Related

| Topic | Document |
| ----- | -------- |
| Decision (short) | [MonoTool-AD-2](architecture-decisions.md#monotool-ad-2--keep-lerna-for-versioning-and-publish--accepted) |
| API reference site maintenance | [Documentation site maintenance](../documentation-site-maintenance.md) |
| Workflow | [`.github/workflows/publish.yml`](../../../.github/workflows/publish.yml) |
