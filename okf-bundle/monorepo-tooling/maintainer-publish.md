---
type: Reference
title: Maintainer publish procedure
description: Canonical maintainer procedure for npm publish via GitHub Actions — main-only API docs deploy, branch-named dist-tags off main, and same-publish recovery after a partial publish.
tags: [monorepo, tooling, publish, npm, dist-tag, docs]
timestamp: 2026-10-23T19:00:00Z
---

# Maintainer publish procedure

**Canonical owner** of how maintainers publish packages with `.github/workflows/publish.yml`. Decision summary: [MonoTool-AD-2](architecture-decisions.md#monotool-ad-2--keep-lerna-for-versioning-and-publish--accepted). Other docs **link here**; they do not copy this procedure.

**Policy:** [OKF documentation and commit policy](../documentation-policy.md).

Publish is a **manual** maintainer action (`workflow_dispatch` on the Publish workflow). Merging a PR into `main` does **not** by itself create or publish new npm versions.

## Docs deploy only from `main`

When Publish runs, the `deploy-api-reference` job runs only if the npm publish job succeeded **and** the ref is `main` (`success() && github.ref == 'refs/heads/main'`). Off-`main` publishes do not update the public API reference site. Standalone `.github/workflows/deploy-api-reference.yml` is separate from this publish gate.

## Dist-tag follows the branch

- On **`main`:** `lerna publish from-package` uses the default tag (`latest`; no `--dist-tag`).
- Off **`main`:** the same command passes `--dist-tag` equal to the unsanitized branch name (`github.ref_name`).

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
