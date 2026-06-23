# Local iOS E2E reproduction (Tart)

Self-contained Tart VM pipeline for reproducing **Testing E2E iOS** locally. Full design: [okf-bundle/testing/local-ios-e2e-reproduction.md](../../okf-bundle/testing/local-ios-e2e-reproduction.md).

**Isolation:** everything lives under `scripts/tart/` plus OKF documentation. This system does not modify `.github/`, CI workflows, or package scripts.

## Prerequisites (host)

- Apple Silicon Mac with [Tart](https://tart.run/) installed
- `sshpass` (`brew install sshpass`)
- **≥ 80 GiB free** on the volume holding `~/.tart` (symlink to external disk if needed)
- Git worktree for the branch under test (not the primary clone)

## Quick start

```bash
# 1. Bake golden toolchain (once, after disk cleanup)
./scripts/tart/bake-golden.sh

# 2. Prewarm caches on origin/main (once per main bump)
./scripts/tart/bake-warmed.sh /path/to/any/rnfb-clone-or-worktree

# 3. Run one ephemeral iteration on your worktree
./scripts/tart/run-ephemeral.sh --worktree /path/to/worktree --mode debug

# 4. Stress loop
./scripts/tart/run-stress.sh --worktree /path/to/worktree --count 10 --mode debug
```

## Yarn cache

All tart scripts export:

```bash
YARN_CACHE_FOLDER=$HOME/.yarn-rnfb-cache
```

The repo uses `enableGlobalCache: false` in `.yarnrc.yml`; the env var keeps Berry cache outside the virtiofs worktree without changing repo config.

## Scripts

| Script | Where |
|--------|-------|
| `bake-golden.sh` | Host — seed → golden VM |
| `bake-warmed.sh` | Host — golden → warmed VM |
| `run-ephemeral.sh` | Host — one iteration, delete VM |
| `run-stress.sh` | Host — N iterations |
| `stop-ephemeral.sh` | Host — stop/delete a kept ephemeral VM |
| `provision-toolchain.sh` | In-VM (via SSH during bake) |
| `prewarm-caches.sh` | In-VM (via SSH during warm bake) |
| `run-iteration.sh` | In-VM (via SSH during ephemeral run) |
| `verify-manifest.sh` | Host |
| `report-disk-usage.sh` | Host |

CI helper equivalents are vendored under `lib/` and `vendor/homebrew-rnfb/` — not imported from `.github/`.

## Completion, artifacts, and cleanup

`run-ephemeral.sh` launches the iteration **detached inside the VM** (`nohup`), then polls virtiofs for `iteration-complete.json`. No long-lived SSH log stream.

### How completion is detected

1. Host SSHs once to start `run-iteration.sh` under `nohup` on VM disk (`~/rnfb-prewarm/...`).
2. In-VM `run-iteration.sh` logs to `run-iteration.log` on VM disk (not over SSH).
3. When finished (or on failure via `EXIT` trap), it writes **`iteration-complete.json`** and syncs small files to virtiofs.
4. Host polls the worktree for `iteration-complete.json`, reads `rc`, then **SCPs bulk logs** from the VM (while it is still running, unless `--no-sync-artifacts`).
5. Orchestrator tears down the VM on exit (or leaves it running with `--keep-vm`).

**Artifact flow (two paths):**

| Stage | What | Where |
|-------|------|--------|
| In-VM write | Full iteration output during the run | `~/rnfb-prewarm/scripts/tart/artifacts/<SESSION_ID>/<mode>-iter<N>/` on VM disk |
| Virtiofs sync | Small completion files (`iteration-complete.json`, `detox-step.log`, `ccache-stats.txt`, …) | Same path under the mounted worktree (host-visible without SSH) |
| Host SCP harvest (default) | Bulk files (`run-iteration.log`, `simulator.log`, `simulator.mp4`, …) | Host pulls from VM → worktree after completion marker |

Use **`--no-sync-artifacts`** to skip the SCP harvest step. Essentials still land on the worktree via virtiofs; bulk logs remain on the VM until teardown (or inspect with `--keep-vm` + SSH).

The VM **stays running** from `tart run` through iteration and SCP harvest. Nothing stops it until the host orchestrator calls teardown at exit (or you pass `--keep-vm` to leave it up).

Live status (optional):

```bash
ssh admin@$(tart ip rnfb-e2e-<uuid>) tail -f ~/rnfb-prewarm/scripts/tart/artifacts/<SESSION_ID>/<mode>-iter<N>/run-iteration.log
```

`bake-warmed.sh` uses a similar marker pattern: in-VM `prewarm-caches.sh` writes **`prewarm-complete.json`**; the host polls for it.

### Artifact layout

All run outputs live under **`scripts/tart/artifacts/<SESSION_ID>/`**, where `SESSION_ID` is the UTC run start timestamp (e.g. `20260623T062250Z`). The directory is gitignored.

| Path | Purpose |
|------|---------|
| `<SESSION_ID>/run-ephemeral.log` | Host orchestrator log (APFS, not virtiofs) |
| `<SESSION_ID>/<mode>-iter<N>/` | Per-iteration artifacts (see below) |
| `<SESSION_ID>/prewarm.log` | `bake-warmed.sh` prewarm log |

### Artifact files (per iteration)

Iteration dir: `scripts/tart/artifacts/<SESSION_ID>/<mode>-iter<N>/` (e.g. `debug-iter0`).

| File | Purpose |
|------|---------|
| `iteration-complete.json` | Authoritative completion marker + exit code |
| `run-iteration.log` | Full in-VM iteration log (SCP'd on harvest) |
| `iteration-env.txt` | Lockfile SHAs, warmed-manifest comparison, build duration |
| `ccache-stats.txt` | `ccache -s` snapshots at each phase |
| `detox-step.log` | Detox/Jet test output |
| `flake-summary.txt` | Post-run flake digest |

Host wrapper log: `scripts/tart/artifacts/<SESSION_ID>/run-ephemeral.log` (host APFS, not virtiofs).

## Operational pitfalls (learned in practice)

### Do not stream iteration output over SSH or virtiofs

Build output (xcbeautify note spam) can block `tee` on virtiofs and wedge the whole pipeline. Iteration stdout belongs on **VM disk**; the host waits on **`iteration-complete.json`** only.

Bulk artifacts (`simulator.log`, `testing.log`, `simulator.mp4`, `run-iteration.log`) are pulled with **host-side SCP** after the completion marker appears.

### Do not rsync large logs over virtiofs

The iteration exit path **must not** block on copying hundreds of MB through virtiofs. Essential files only (`iteration-complete.json`, `detox-step.log`, etc.).

### SSH sessions can outlive the VM

`rnfb_tart_ssh` connects to `tart ip <vm>`. Problems observed on older flows:

- Long-lived SSH streams blocking cleanup (mitigated by detached iteration launch).
- **Deleted VMs leave zombie `sshpass` processes** still connected to stale `192.168.64.*` addresses.

Mitigations in `lib/common.sh`:

- `ServerAliveInterval=15` / `ServerAliveCountMax=4` — dead connections drop in ~60s
- `timeout` wrapper on SSH/SCP (default **`RNFB_TART_SSH_TIMEOUT=3600`** seconds for launch/harvest)
- **`RNFB_TART_ITERATION_TIMEOUT=7200`** — max wait for `iteration-complete.json` on virtiofs

### Low CPU does not mean the pipeline finished

A completed test run can still leave:

- An ephemeral VM running (host script blocked on SSH)
- Zombie `sshpass` / `run-ephemeral.sh` / `bake-warmed.sh` wrappers on the host
- `tart run` background processes

Always check process state explicitly.

## Troubleshooting

### Check for zombie host processes

```bash
pgrep -fl 'sshpass|run-ephemeral|bake-warmed|tart run'
tart list
```

- Any **`sshpass` to `192.168.64.*`** with no matching **`rnfb-e2e-*`** VM in `tart list` → safe to kill.
- Multiple overlapping `run-ephemeral.sh` from retries → kill extras; only one should own the ephemeral VM.

```bash
pkill -f 'sshpass.*192.168.64'
pkill -f 'scripts/tart/run-ephemeral.sh'
```

### Check iteration outcome

```bash
ls scripts/tart/artifacts/*/
cat scripts/tart/artifacts/<SESSION_ID>/<mode>-iter<N>/iteration-complete.json
cat scripts/tart/artifacts/<SESSION_ID>/<mode>-iter<N>/ccache-stats.txt
tail scripts/tart/artifacts/<SESSION_ID>/<mode>-iter<N>/detox-step.log
```

### Manual VM cleanup

Ephemeral VMs are named `rnfb-e2e-<uuid>`. By default `run-ephemeral.sh` stops and deletes them on exit. With `--keep-vm`, the orchestrator leaves the VM running:

```bash
./scripts/tart/stop-ephemeral.sh rnfb-e2e-<uuid>           # stop only
./scripts/tart/stop-ephemeral.sh rnfb-e2e-<uuid> --delete  # stop + delete image
```

Or manually:

```bash
tart list
tart stop rnfb-e2e-<uuid>
tart delete rnfb-e2e-<uuid>
```

Preserve **`rnfb-ios-e2e-golden`** and **`rnfb-ios-e2e-warmed`** (stopped is normal).

### `bake-warmed` appeared finished but host hung

If in-VM prewarm logged `[prewarm] complete` but the host never reached `[bake-warmed] tagging`:

1. Check for stuck `sshpass` / `bake-warmed.sh`.
2. Confirm `~/rnfb-tart-manifests/prewarm-complete.json` exists in the build VM (or fetch `warmed-main.json` manually).
3. Tag manually: `tart clone rnfb-ios-e2e-warmed-build rnfb-ios-e2e-warmed`, then delete the `-build` VM.

### When to rebake warmed

Re-run `bake-warmed.sh` when `origin/main` changes **`yarn.lock`** or **`tests/ios/Podfile.lock`** (compare SHAs in `manifests/warmed-main.json`). Golden rebake only when CI toolchain pins change (`manifests/golden-expected.json`).

## Environment variables (SSH / caches)

| Variable | Default | Notes |
|----------|---------|-------|
| `RNFB_TART_SSH_TIMEOUT` | `3600` | Max seconds per SSH/SCP call (`timeout` wrapper) |
| `RNFB_TART_ITERATION_TIMEOUT` | `7200` | Max seconds to poll for `iteration-complete.json` |
| `RNFB_TART_SSH_USER` / `RNFB_TART_SSH_PASSWORD` | `admin` / `admin` | Cirrus Tart images |
| `YARN_CACHE_FOLDER` | `~/.yarn-rnfb-cache` | Outside virtiofs worktree |
| `CCACHE_DIR` | `~/.ccache` | Shared between prewarm and iteration via `~/rnfb-prewarm` path |
| `RNFB_TART_PREWARM_DIR` | `~/rnfb-prewarm` | Iteration materializes worktree here for ccache key alignment |

