---
type: Ephemeral
title: Prepare benchmark baseline
description: Ephemeral pre- and post-Nx benchmark output for MT0.3 / MT1.
tags: [monorepo, tooling, benchmark, prepare, ephemeral]
timestamp: 2026-07-10T21:30:00Z
---

# Prepare benchmark baseline

Ephemeral MT0.3 / MT1 note. These numbers are baseline evidence for the monorepo tooling rollout and are intentionally not part of the durable prepare/cache design.

Command for both runs:

```bash
bash ./scripts/benchmark-prepare.sh
```

## Pre-Nx baseline (MT0.3)

Environment notes:

- Host: macOS (`darwin 25.5.0`).
- Tree state: `nx.json` absent before the benchmark run.
- Benchmark logs: `.tmp/prepare-benchmarks/20260710-122118/`.
- Script scenario D applies and then removes a temporary comment in `packages/firestore/lib/index.ts` so content-hash-based runners observe a real single-package edit.
- First sandboxed attempt exited before timing because the sandbox could not remove a few ignored `node_modules` entries; the recorded run below was rerun unsandboxed and exited 0.

| Scenario | Name                | Median (s) | Runs (s)                  |
| -------- | ------------------- | ---------- | ------------------------- |
| A        | Cold install        | 125.583    | 125.583, 138.092, 122.102 |
| B        | Full rebuild        | 23.686     | 24.171, 23.686, 23.461    |
| C        | No-op rebuild       | 23.694     | 23.555, 23.811, 23.694    |
| D        | Single-package edit | 23.758     | 23.849, 23.758, 23.515    |

Exit code: 0.

## Post-Nx with cache (MT1)

Environment notes:

- Host: macOS (`darwin 25.5.0`).
- Tree state: `nx.json` present; `yarn lerna:prepare` uses `NX_NO_CLOUD=true`; Nx local cache enabled (`.nx/cache`).
- Benchmark logs: `.tmp/prepare-benchmarks/20260710-152608/`.
- Scenario D uses the same reversible firestore comment marker as the pre-Nx run.
- Scenario B resets `packages/*/dist` and `packages/*/plugin/build` but retains `node_modules` and `.nx/cache` from prior scenarios (matches warm-tree full-rebuild after cold install).
- Scenario D first iteration (5.270s) is a cache miss for the edited package; iterations 2–3 are warm cache hits (~1.44s).

| Scenario | Name                | Median (s) | Runs (s)               | Pre-Nx median (s) | Speedup                                   |
| -------- | ------------------- | ---------- | ---------------------- | ----------------- | ----------------------------------------- |
| A        | Cold install        | 95.079     | 93.605, 95.079, 95.855 | 125.583           | ~1.3×                                     |
| B        | Full rebuild        | 1.880      | 1.980, 1.880, 1.865    | 23.686            | ~12.6×                                    |
| C        | No-op rebuild       | 1.410      | 1.494, 1.409, 1.410    | 23.694            | ~16.8×                                    |
| D        | Single-package edit | 1.457      | 5.270, 1.457, 1.437    | 23.758            | ~16.3× (median; first run 5.270s on miss) |

Exit code: 0.

**Takeaway:** Nx local cache materially improves repeat `yarn lerna:prepare` (B/C/D ~24s → ~1.4–1.9s). Cold install (A) still dominated by `yarn` link/postinstall; post-Nx cold install is modestly faster (~95s vs ~126s), likely from cache replay during postinstallDev prepare.
