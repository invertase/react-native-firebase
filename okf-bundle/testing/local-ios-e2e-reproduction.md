---
type: Reference
title: Local iOS e2e reproduction (Tart lab)
description: Optional Tart VM lab for CI-like iOS e2e stress runs; temporarily suspended while CI ratchets to Xcode 27 and iOS 27.
tags: [testing, ios, tart, e2e, lab]
timestamp: 2026-09-29T00:00:00Z
---

# Local iOS e2e reproduction (Tart lab)

<a id="status-suspended"></a>

## Status — lab path temporarily suspended

The **Tart VM pipeline** under `scripts/tart/` is a **suspendable lab path** (D9). It is **not** the canonical way to run or gate iOS e2e.

| Use instead | When |
|-------------|------|
| [Running e2e tests](running-e2e.md) — [§ agent rule](running-e2e.md#agent-rule-read-first) | All contributor and agent iOS e2e work |
| [iOS CI workflows](../ci-workflows/ios.md) | CI behaviour, Device Hub boot, iOS 27 runtime pins |
| [Test app dependency pins](test-app-dependency-pins.md) | Mobile fixture line (**RN 0.88.0-rc.3**, **Expo 58**, CLI band) |

**Scripts and entrypoints stay in the repo** (`bake-golden.sh`, `run-ephemeral.sh`, …). Do not delete or redesign Tart in doc-only work; seed/manifest cleanup is tracked separately (C1).

### Resume criteria (when re-enabling the lab)

Re-open this path only when **all** of the following hold:

1. **CI parity** — Dedicated Apple jobs on **`macos-27`** with stable **Xcode 27** and default **`RNFB_IOS_SIM_RUNTIME` = `iOS 27.0`** are green and documented in [iOS CI workflows § Apple CI toolchain](../ci-workflows/ios.md#apple-ci-toolchain-xcode-27).
2. **Tart seed** — A Cirrus (or equivalent) macOS image ships **Xcode 27** (not 26.5); `scripts/tart/manifests/golden-expected.json` is updated to match that seed and `tests_e2e_ios.yml` pins.
3. **Rebake** — Operators run `bake-golden.sh` → `bake-warmed.sh` on a worktree at the target `origin/main` SHAs; `verify-manifest.sh` passes against the new expected manifest.
4. **In-VM boot** — Iteration uses the same **Device Hub + UDID** semantics as CI (`scripts/tart/lib/boot-simulator.sh` delegates to `.github/workflows/scripts/boot-simulator.sh`).

Until then, treat existing golden/warmed VMs built from **Xcode 26.5** / **`macos-26`** manifests as **stale lab artifacts** — not proof for the current ratchet.

<a id="ios-26-5-not-proof"></a>

## iOS 26.5 is not a proof path for this ratchet

An **iOS 26.5** simulator runtime (or Tart images seeded with **Xcode 26.5**) may still be useful for **runtime-differential** debugging — for example Metro `localhost` vs `127.0.0.1` behaviour noted in [iOS CI workflows § issue 5](../ci-workflows/ios.md#5-metro-unresponsive-at-launch--waitforactive-hang-active-app).

It does **not** satisfy:

- CI **`configure-apple-ci.sh`** gates (stable **Xcode major 27**, default **iOS 27.0** runtime when required).
- **`yarn test-expo:ios:launch-smoke`** / **`yarn test-rn-bare:ios:launch-smoke`** UIScene gates on the pinned **iOS 27** runtime ([agent command policy](agent-command-policy.md); [validation checklist § bare](validation-checklist.md#rn-cli-prebuilt-rncore-ios-compile-not-e2e)).

Do not cite “green on iOS 26.5” as closure for Xcode 27 / iOS 27 / UIScene work.

## Operator entrypoints (when resumed)

Quick reference — full operational detail: [`scripts/tart/README.md`](../../scripts/tart/README.md).

```bash
./scripts/tart/bake-golden.sh
./scripts/tart/bake-warmed.sh /path/to/worktree
./scripts/tart/run-ephemeral.sh --worktree /path/to/worktree --mode debug
```

Manifest pins: `scripts/tart/manifests/golden-expected.json` (expected) vs `golden-baked.json` / `warmed-main.json` (after bake). **`golden-expected.json` may still list legacy `macos-26` / Xcode 26.5 until C1 updates the seed** — that file describes the **last baked lab target**, not current CI.

## Related

- [E2e parallel design § Tart layers](e2e-parallel-design.md#rnfb-mellifera-tart-layers) — Tart is not the RNFB e2e product
- [Running e2e § Apple host toolchain](running-e2e.md#apple-host-toolchain-local) — local Xcode 27 + Device Hub expectations
