---
type: Reference
title: Running e2e tests — Mellifera remote and distributed runs
description: Remote spill, overlapping spill, the distributed grid with per-piece commands and the reducer, and the simple-mode desk proof.
tags: [testing, e2e, mellifera, distributed, coverage]
timestamp: 2026-10-30T00:00:00Z
---

# Running e2e tests — Mellifera remote and distributed runs

Read this file only for a remote grant (`execution.checkoutMode` `remote`), a distributed-grid tier, or the simple-mode desk proof. Everything else — the agent rule, the Law, local desk, and worktree session — stays in [running e2e](running-e2e.md) ([agent rule](running-e2e.md#agent-rule-read-first), [Daily path for Mellifera](running-e2e.md#mellifera-daily-path)). Commands: [Mellifera command policy](agent-command-policy.md#mellifera-command-policy).

<a id="remote-spill"></a>

## Plane C — remote spill

Same reserve. A remote grant has `execution.checkoutMode` `remote` and `execution.connectUrl` on the reserve JSON. Reserve prints the full grant JSON. Read `execution.connectUrl` from that JSON. [Simple mode](#mellifera-simple-mode) sshes from this worktree to that URL and prints the synced `packages/app/package.json` `version`. Operator ssh may use `StrictHostKeyChecking=accept-new`. `mellifera-cli exec` stays `StrictHostKeyChecking=yes` and uses `hostKeyPin` or the bastion known-hosts file. Do not copy the Mellifera config file. When the federation has no offer of the requested kind, the proof fails. Do not name a donor. The remote image supplies node, corepack/yarn, and rsync. A donated worker may be recycled between runs; do not rely on a previous remote tree. Bastion prerequisites: [CLUSTER.md § Spill donated desk slots](https://github.com/invertase/mellifera/blob/main/CLUSTER.md#spill-donated-desk-slots-rnfb).

`yarn tests:mellifera:exec` is the transport ([mellifera-cli § Exec](https://github.com/invertase/mellifera/blob/main/packages/cli/README.md#exec)). It streams stdout and stderr and returns the remote exit status. It does not sync, install, apply, or release.

1. Keep release on the issuing core (`yarn tests:mellifera:release`) on success, command failure, and a dropped remote shell.
2. `yarn tests:mellifera:remote-sync` copies this checkout into `mellifera-work/<name>` under the grant's initial directory, never into the initial directory itself (on a desk slot that is the desk login's home). `<name>` is `--dest DIR` when passed (relative; `.`, `..`, and absolute paths are refused), else the `--session` id, else the worktree pointer's session id, which must be `live` in `session show`. It creates that directory with `exec mkdir -p` first, then prints it as the only stdout line. Callers pass `--session`, `--url`, and `--federation` before `--rsh`. That invocation carries `rsync --server` and is the sync transport. Callers do not pass a host. An omitted `--filter` uses `scripts/e2e/mellifera-remote-sync.rsync-filter`, which omits `.git` (directory or worktree file), so the remote copy is not a git work tree. With no `--session`, sync and exec follow the single worktree pointer.
3. `yarn tests:mellifera:exec -w DIR -- yarn install --immutable`, where `DIR` is the directory sync printed. Put `-w DIR` before `--`; after `--` it is part of the remote command.
4. On that remote checkout, run the suite with the grant's slot: `yarn tests:mellifera:exec -w DIR -- yarn test:full --slot N`. Every exec on the synced tree passes `-w DIR`. Device inventory, when missing, is the same [setup commands](running-e2e.md#e2e-slot-index) through `exec -w DIR`. The [Law](running-e2e.md#slot-lifecycle) is unchanged.
5. The suite's streamed output and exit status are the result. Log files follow [full suite](running-e2e.md#run-full-tests) on the remote host.

A local-only apply is not this run. A remote command other than the two exceptions below needs a preceding `yarn tests:mellifera:remote-sync`. Exceptions: an `exec` that is the whole task (a probe; it does not run the suite), and `exec --rsh` while it carries `rsync --server`.

Overlapping grants: [Mellifera spill](#mellifera-spill-overlapping-full).

<a id="mellifera-spill-overlapping-full"></a>

## Mellifera spill (overlapping full)

**Mellifera spill (donated desk slots):** overlapping `yarn test:full --slot N` runs use one worktree per grant when `--session` is omitted. [Distributed e2e](#distributed-grid) reserves its grants from this one worktree and selects each with `--session`. It does not require another git worktree per grant. `N` is that grant's [slot index](running-e2e.md#e2e-slot-index). Bastion session shape stays in Mellifera — [Spill donated desk slots](https://github.com/invertase/mellifera/blob/main/CLUSTER.md#spill-donated-desk-slots-rnfb). RNFB maps the grant and runs the suite — [remote spill](#remote-spill). Apply with `yarn tests:mellifera:apply` (`placement: "slot"` and the slot index). Do **not** pass `--clear-whole-host` (kills sibling slots). Overlapping Apple `pod:install` keeps the host-global CocoaPods / trunk CDN risk under [slot lifecycle](running-e2e.md#slot-lifecycle). Overlapping verify: [Overlapping verify / Jest](running-e2e.md#overlapping-verify-jest).

<a id="distributed-grid"></a>

## Distributed grid

Three tiers. [Simple mode](#mellifera-simple-mode) is separate from these tiers. The reducer for every tier runs in this worktree after the remote pieces and records each piece's exit code — commands and report in [Distributed e2e run](#distributed-e2e-run). A live run of distributed full or distributed full + link is not required.

**Distributed e2e** is three simultaneous grants from this one worktree:

- Android e2e on kind `linux-nested-virt-self-hosted`
- iOS e2e, including `yarn tests:ios:ruby`, on kind `macos-self-hosted`
- macOS e2e on kind `macos-self-hosted`, its own grant

Each piece's sync and exec pass that reserve's `sessionId` as `--session`. On sync the flag is before `--rsh`. Each piece's exec also passes `-w` with the directory that piece's sync printed. The next `reserve` replaces the single worktree pointer. `--session` still selects the earlier grants. This section does not require another git worktree per grant.

**Distributed full** is distributed e2e plus one kind `linux-self-hosted` grant that runs `yarn tests:jest`, `yarn lint`, and `yarn codegen:verify`. `yarn lint` is that linux grant. Ruby lint stays inside the iOS e2e grant via `yarn tests:ios:ruby`.

**Distributed full + link** is distributed full plus `yarn test-expo:ios:link` and `yarn test-rn-bare:ios:build` on kind `macos-self-hosted`.

TypeScript, attw, consumer-types, and typedoc stay outside all three tiers.

<a id="distributed-e2e-run"></a>

## Distributed e2e run (per piece)

One live distributed e2e from this worktree. Commands are the [Mellifera command policy](agent-command-policy.md#mellifera-command-policy) wrappers plus `yarn tests:mellifera:reduce`. `URL` and `ID` are the `--url` and `--federation` values from [Plane B](running-e2e.md#worktree-session). The reserve JSON holds the session token: keep the run dir mode 0700 and never print that file.

**1. Reserve the three grants** (each its own grant; the next `reserve` replaces the worktree pointer, so every later command passes `--session`):

```bash
RUN="tests/mellifera-distributed/$(date +%Y%m%d-%H%M%S)"   # gitignored, inside this worktree
mkdir -p "$RUN" && chmod 700 "$RUN"
M=(--url URL --federation ID)
R=(--remote-wait-ms 180000 --ttl-ms 5400000)   # caller may append --no-autoscale
yarn tests:mellifera:reserve --kinds linux-nested-virt-self-hosted "${R[@]}" "${M[@]}" > "$RUN/android.reserve.json"
yarn tests:mellifera:reserve --kinds macos-self-hosted "${R[@]}" "${M[@]}" > "$RUN/ios.reserve.json"
yarn tests:mellifera:reserve --kinds macos-self-hosted "${R[@]}" "${M[@]}" > "$RUN/macos.reserve.json"
```

`--remote-wait-ms 180000` (3 minutes): a provisioned guest takes about a minute to boot before the grant is ready, and the default remote wait is 0, which fails before any guest can boot. Three minutes covers one boot plus ssh readiness with margin, and a federation with no offer of the kind still fails within minutes instead of hanging. Each reserve waits for its own guest.

`--ttl-ms 5400000` (90 minutes): the grant must outlive the longest piece. iOS is the longest (Ruby lint, XCTest unit, pod install, build, then the full e2e suite), and 90 minutes covers it with margin; a shorter lease can expire mid-suite and lose the grant.

Autoscale is the caller's choice. The commands leave the CLI default. Append `--no-autoscale` to `R` when no new paid capacity should be booted; the reserve then waits only on existing donated offers. The piece runner and the reducer never reserve. The acceptance proof run for distributed e2e uses `--no-autoscale` and the 90-minute TTL.

Confirm each JSON has `execution.checkoutMode` `remote` and `execution.connectUrl`; a `placement: "host"` with `slot: 0` guest is a valid piece.

**2. Sync and install each piece** (`P` is `android`, `ios`, or `macos`; repeat per piece and keep its `ID_P`, `SLOT_P`, `DIR_P`):

```bash
ID_P=$(yarn tests:mellifera:reduce field --reserve "$RUN/P.reserve.json" --field sessionId)
PLACEMENT_P=$(yarn tests:mellifera:reduce field --reserve "$RUN/P.reserve.json" --field placement)   # slot or host
SLOT_P=$(yarn tests:mellifera:reduce field --reserve "$RUN/P.reserve.json" --field slot)   # empty for placement host
DIR_P=$(yarn tests:mellifera:remote-sync --session "$ID_P" "${M[@]}")
yarn tests:mellifera:exec --session "$ID_P" "${M[@]}" -w "$DIR_P" -- yarn install --immutable
```

**3. Run the three pieces overlapping, capturing each exit code.** [`scripts/e2e/mellifera-distributed-piece.sh`](../../scripts/e2e/mellifera-distributed-piece.sh) runs one platform's canonical `yarn tests:*` sequence in one remote shell, so the emulator suite and Metro stay up between steps: android fails clearly on Linux when `/dev/kvm` is missing or not read/write (CI grants that with a udev rule), resolves `ANDROID_HOME` (on Linux it defaults to the CI runner path `/usr/local/lib/android/sdk` and fails clearly when absent), creates the serial base AVD `TestingAVD` when it is missing (same system image as CI: `android-36` `google_apis`, host ABI, no device profile; idempotent; the name matches `SERIAL_ANDROID_AVD` in `tests/.detoxrc.js`), runs the placement's `yarn tests:e2e:release --devices` to stop a stale emulator, then `tests:android:unit`, `:build`, host-clear, emulator, packager, `:test-cover`, `tests:android:post-e2e-coverage` (merged Jacoco). The guest has no display, so unless the caller already set `RNFB_ANDROID_EMULATOR_BOOT_ARGS` the piece exports it as CI's emulator options (`-no-window -gpu swiftshader_indirect -no-snapshot -noaudio -no-boot-anim`, the android-emulator-runner v2.38.0 defaults; `-no-snapshot` covers snapshot load and save) and Detox boots `TestingAVD` with them. CI's `--headless` on `:test-cover` is not forwarded to Detox, so it is not passed here. Skipped CI steps: the `/mnt` AVD home (a GitHub-runner disk layout), the tap loop and animation disabling (runner-side flake mitigations Detox does not need), and the emulator host packages, which the guest image supplies. ios checks Xcode, the `RNFB_IOS_SIM_RUNTIME` runtime (default `iOS 27.0`) and the `iPhone 17` device type and fails naming what is missing (it never downloads Xcode or runtimes), installs missing `applesimutils` / `xcbeautify` from the vendored Homebrew tap like CI (fails when `brew` is absent), runs `yarn ruby:install`, then `tests:ios:ruby`, `tests:ios:unit`, `:pod:install`, `:build` with CI's `SKIP_BUNDLING=1` and `RCT_NO_LAUNCH_PACKAGER=1`, host-clear, emulator, packager, `:test-cover`, `tests:ios:test:process-coverage`; macos checks Xcode, installs a missing `xcbeautify`, runs `yarn ruby:install`, then `:pod:install`, `:build` (same build env), host-clear, emulator, `tests:macos:packager:jet`, `:test-cover`. `--placement=` is the reserve JSON's `placement` and is required; the piece exits 2 without it, for `slot` without the slot, and for `host` with one. With `slot` it loads that slot's env first (and creates the slotted AVD or simulator), and both releases are `--placement=slot --slot=N`: they re-apply that slot's env, since `exec` starts a fresh shell, and stop only that slot's resources, so a desk spill never stops sibling slots or the donor's own devices ([desk slot release](#desk-slot-release)). With `host` it uses serial defaults on the whole guest, and both releases are `--placement=host` (whole-machine wipe). The release always runs last. As in CI, the coverage step runs even when the suite failed; the suite's exit wins, and a coverage failure fails an otherwise green piece. Otherwise the first failing step's status is the piece's, and `exec` returns it. The first Android piece on a fresh guest is slower: it downloads the system image and creates `TestingAVD` before the build. A cold guest also builds CocoaPods and the Detox framework cache without CI's caches, so its first iOS and macOS pieces are slow too.

```bash
run_piece() { # P ID DIR PLACEMENT SLOT
  date +%s > "$RUN/$1.started"
  yarn tests:mellifera:exec --session "$2" "${M[@]}" -w "$3" -- bash scripts/e2e/mellifera-distributed-piece.sh "$1" "--placement=$4" $5 > "$RUN/$1.log" 2>&1
  echo $? > "$RUN/$1.exit"
  date +%s > "$RUN/$1.ended"
}
run_piece android "$ID_android" "$DIR_android" "$PLACEMENT_android" "$SLOT_android" &
run_piece ios "$ID_ios" "$DIR_ios" "$PLACEMENT_ios" "$SLOT_ios" &
run_piece macos "$ID_macos" "$DIR_macos" "$PLACEMENT_macos" "$SLOT_macos" &
wait
```

**4. Bring each coverage artifact back** as `exec` stdout (no `-t`, so stdout is a byte stream). macOS coverage is JavaScript-only by design: macOS e2e runs the product JavaScript on firebase-js-sdk with no RNFB native code, so `:test-cover` writes only the JS `coverage/lcov.info` on its grant; it lands under `coverage/macos-e2e/` here so it does not collide with local JS coverage.

```bash
mkdir -p tests/android/app/build/reports/jacoco/jacocoTestReport coverage/ios-native coverage/macos-e2e
yarn tests:mellifera:exec --session "$ID_android" "${M[@]}" -w "$DIR_android" -- cat tests/android/app/build/reports/jacoco/jacocoTestReport/jacocoTestReport.xml > tests/android/app/build/reports/jacoco/jacocoTestReport/jacocoTestReport.xml
yarn tests:mellifera:exec --session "$ID_ios" "${M[@]}" -w "$DIR_ios" -- cat coverage/ios-native/lcov.info > coverage/ios-native/lcov.info
yarn tests:mellifera:exec --session "$ID_macos" "${M[@]}" -w "$DIR_macos" -- cat coverage/lcov.info > coverage/macos-e2e/lcov.info
```

Rsync over `exec --rsh` (the transport `yarn tests:mellifera:remote-sync` uses) is the alternative for larger trees.

**5. Reduce in this worktree.** `record` writes `$RUN/piece-P.json`; android and ios coverage paths are fixed, macos passes `--coverage`. `report` writes `$RUN/report.json` and `$RUN/report.md` and exits 1 when any piece is missing or non-zero, a piece has no recorded start and end time or starts at or after its end, a coverage artifact is missing or empty, two pieces share a session, or the recorded lifetimes do not overlap.

```bash
for P in android ios macos; do
  COV=(); [ "$P" = macos ] && COV=(--coverage coverage/macos-e2e/lcov.info)
  yarn tests:mellifera:reduce record --run-dir "$RUN" --piece "$P" --reserve "$RUN/$P.reserve.json" \
    --exit-file "$RUN/$P.exit" --started "$(cat "$RUN/$P.started")" --ended "$(cat "$RUN/$P.ended")" "${COV[@]}"
done
yarn tests:mellifera:reduce report --run-dir "$RUN"
```

The CLI's `release` takes the session token only as `--token` or from the worktree pointer, so `reduce release` passes it on that child's argv; it is never printed, but it is visible to local process listings while release runs.

**6. Clean up every piece, pass or fail** (remove the remote dir from the grant's initial directory, then release that grant on the issuing core; `release` reads the token from the reserve JSON and does not print it):

```bash
yarn tests:mellifera:exec --session "$ID_P" "${M[@]}" -- rm -rf -- "$DIR_P"
yarn tests:mellifera:reduce release --reserve "$RUN/P.reserve.json" "${M[@]}"
```

<a id="desk-slot-release"></a>

### Desk slot release

A desk shares its host with other slots and the operator. Release a desk-slot grant as `yarn tests:e2e:release --devices --placement=slot --slot=N`, with `N` equal to `grant.slot`, locally or through `exec`. Release re-applies slot `N`'s env (keeping a caller's `RNFB_E2E_PLATFORM`; `--platform=` still wins) and stops only that slot's Metro, Jet and emulator-suite ports, `TestingAVD-N` / `emulator-<5556+2N>`, Detox strays whose AVD is `TestingAVD-N`, `RN E2E iOS slot-N`, and `io.invertase.testing.sN`. It exits 2 before touching anything when `--slot` is missing, `--all-slots` is passed, or a different slot's env is loaded. A bare `--slot=N` on check or release re-applies slot `N` the same way. `--placement=host` is the whole-guest shape only (a provisioned guest, placement `host`, slot `0`): it drops slot env and wipes every slot.

<a id="mellifera-simple-mode"></a>

## Simple mode

A kind-`slot` remote desk grant: `execution.checkoutMode` is `remote`, `placement` is `slot`, and `execution.connectUrl` is on the reserve JSON. `phase: local` fails. This proof chooses no Detox suite. It is not a distributed-grid tier. The `yarn lint` exec here is the sync proof on the desk grant. The grid's `yarn lint` stays the `linux-self-hosted` grant in [Distributed grid](#distributed-grid).

Reserve prints the full grant JSON. `rememberGrant` does not store `connectUrl`. A session-record `connectUrl` is not the URL for this proof. `exec` on a phase-local grant returns `remote-exec-unavailable`. When the federation has no offer of kind `slot`, the proof fails. Do not name a donor.

1. `yarn tests:mellifera:reserve` with `--kinds slot`, plus `--url` and `--federation` as in [Plane B](running-e2e.md#worktree-session). Save the reserve JSON from stdout. Read `execution.connectUrl` from that JSON. Confirm `execution.checkoutMode` is `remote`, `placement` is `slot`, and `phase` is not `local`.
2. `yarn tests:mellifera:remote-sync` syncs this checkout onto that slot, into `mellifera-work/<sessionId>` under the desk login's home. Pass that reserve's `sessionId` as `--session` before `--rsh`, with the same `--url` and `--federation`. Save the directory it prints (`DIR`).
3. `yarn tests:mellifera:exec` with that `--session`, `--url`, and `--federation`, then `-w DIR -- yarn lint`, exits 0. That exit is the remote command's exit.
4. The `version` field in the synced `DIR/packages/app/package.json` on the slot equals the same field in this worktree.
5. One log file from the slot is present in this worktree. It arrived as saved `exec` stdout or by rsync over `exec --rsh`. Its contents match the remote file.
6. From this worktree, `ssh -o IdentitiesOnly=yes -i ~/.ssh/mellifera_client_ed25519` to the reserve JSON `execution.connectUrl` and print that same `version` from `DIR/packages/app/package.json`. Plain `ssh` is refused by publickey; pass the key the CLI uses. `exec` uses the same client key: it offers whichever of `mellifera_client_ed25519` (first), `id_ed25519`, `id_rsa`, `id_ecdsa` exist under `$HOME/.ssh`; no env or config setting overrides that list. Operator ssh may use `StrictHostKeyChecking=accept-new`. `mellifera-cli exec` stays `StrictHostKeyChecking=yes` and uses `hostKeyPin` or the bastion known-hosts file. The local ssh exit equals the remote command's exit. The printed version equals step 4.
