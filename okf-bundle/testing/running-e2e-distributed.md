---
type: Reference
title: Running e2e tests — Mellifera remote and distributed runs
description: Remote spill with its exec env and teardown, overlapping spill, the distributed grid with per-piece commands and the reducer, and the simple-mode desk proof.
tags: [testing, e2e, mellifera, distributed, coverage]
timestamp: 2026-11-03T00:00:00Z
---

# Running e2e tests — Mellifera remote and distributed runs

Read this file only for a remote grant (`execution.checkoutMode` `remote`), a distributed-grid tier, or the simple-mode desk proof. Everything else — the agent rule, the Law, local desk, and worktree session — stays in [running e2e](running-e2e.md) ([agent rule](running-e2e.md#agent-rule-read-first), [Daily path for Mellifera](running-e2e.md#mellifera-daily-path)). Commands: [Mellifera command policy](agent-command-policy.md#mellifera-command-policy).

<a id="remote-spill"></a>

## Plane C — remote spill

Same reserve. A remote grant has `execution.checkoutMode` `remote` and `execution.connectUrl` on the reserve JSON. Reserve prints the full grant JSON. Read `execution.connectUrl` from that JSON. [Simple mode](#mellifera-simple-mode) sshes from this worktree to that URL and prints the synced `packages/app/package.json` `version`. Operator ssh may use `StrictHostKeyChecking=accept-new`. `mellifera-cli exec` stays `StrictHostKeyChecking=yes` and uses `hostKeyPin` or the bastion known-hosts file. Do not copy the Mellifera config file. When the federation has no offer of the requested kind, the proof fails. Do not name a donor. The remote image supplies the [guest requirements](#guest-requirements) of its kind. A donated worker may be recycled between runs; do not rely on a previous remote tree. Bastion prerequisites: [CLUSTER.md § Spill donated desk slots](https://github.com/invertase/mellifera/blob/main/CLUSTER.md#spill-donated-desk-slots-rnfb).

`yarn tests:mellifera:exec` is the transport ([mellifera-cli § Exec](https://github.com/invertase/mellifera/blob/main/packages/cli/README.md#exec)). It streams stdout and stderr and returns the remote exit status. It does not sync, install, apply, or release.

1. Run [spill teardown](#spill-teardown) on success, command failure, and a dropped remote shell. It ends with release on the issuing core (`yarn tests:mellifera:release`).
2. `yarn tests:mellifera:remote-sync --scratch-file "$RUN/scratch"` copies this checkout into `mellifera-work/<name>` under the grant's initial directory, never into the initial directory itself (on a desk slot that is the desk login's home). `RUN` is a run dir as in [distributed e2e step 1](#distributed-e2e-run). `<name>` is `--dest DIR` when passed (relative; `.`, `..`, and absolute paths are refused), else the `--session` id, else the worktree pointer's session id, which must be `live` in `session show`. It first checks over `exec` that the remote has `rsync` on `PATH`; when it does not, it exits 1 naming the [guest requirements](#guest-requirements), with nothing created or synced. It then creates that directory and its sibling scratch dir `DIR.scratch` with `exec mkdir -p`, syncs, and prints `DIR` as the only stdout line. Callers pass `--session`, `--url`, and `--federation` before `--rsh`. That invocation carries `rsync --server` and is the sync transport. Callers do not pass a host. An omitted `--filter` uses `scripts/e2e/mellifera-remote-sync.rsync-filter`, which omits `.git` (directory or worktree file), so the remote copy is not a git work tree. Mellifera session and reserve state never leaves this machine: `tests/mellifera-distributed/` (the run dirs, whose reserve JSON holds the session token), `tests/mellifera-platform/`, `tests/mellifera.env.json` and `tests/.mellifera-session.env` are passed to rsync as `--exclude` ahead of any `--filter`, anchored at the checkout root and matching a directory, file or symlink of that name, so a caller filter's include rules cannot include them. A `--filter` file may hold only include and exclude rules: a clear rule (`!` or `clear`), which would drop those excludes, or a `merge` / `.` or `dir-merge` / `:` rule, which would read rules from another file, exits 1 naming the line before anything runs. Sync takes no rsync options, and `.rsync-filter` files in the tree are never read. Before any remote exec, a local `rsync --dry-run` with the same filters lists what would be sent; when a listed path is one of those state paths (in any letter case), or a listed file holds a token (a non-empty `sessionToken`, `MELLIFERA_SESSION_TOKEN` or `MELLIFERA_TOKEN`, with or without spaces around `=`; an `Authorization: Bearer` value of 20 or more token characters; or `token` beside `sessionId` in JSON, also after a UTF-8 BOM; a placeholder such as `<redacted>`, a `$VAR` reference or an elided `...` example is not one), sync exits 1 naming it, with nothing created or synced. With no `--session`, sync and exec follow the single worktree pointer.
3. `spill_env "$RUN/scratch"` ([spill exec env](#spill-exec-env)), then `yarn tests:mellifera:exec "${E[@]}" -w DIR -- yarn install --immutable`, where `DIR` is the directory sync printed. Put `-e` and `-w DIR` before `--`; after `--` they are part of the remote command.
4. On that remote checkout, run the suite with the grant's slot: `yarn tests:mellifera:exec "${E[@]}" -w DIR -- yarn test:full --slot N`. Every exec on the synced tree passes `"${E[@]}"` and `-w DIR`. Device inventory, when missing, is the same [setup commands](running-e2e.md#e2e-slot-index) through `exec "${E[@]}" -w DIR`. The [Law](running-e2e.md#slot-lifecycle) is unchanged.
5. The suite's streamed output and exit status are the result. Log files follow [full suite](running-e2e.md#run-full-tests) on the remote host, which puts them in the scratch dir.

A local-only apply is not this run. A remote command other than the two exceptions below needs a preceding `yarn tests:mellifera:remote-sync`. Exceptions: an `exec` that is the whole task (a probe; it does not run the suite), and `exec --rsh` while it carries `rsync --server`.

Overlapping grants: [Mellifera spill](#mellifera-spill-overlapping-full).

<a id="spill-exec-env"></a>

### Spill exec env

Every exec that runs work on a spill session's synced tree (install, the suite or piece, device setup, release, check, `leftovers`, the simple-mode `yarn lint`) sets this env through exec's `-e KEY=VALUE`. Probes and the `cat`, `tar`, and `rm` execs may leave it off. Exec shell-quotes the values, so they are absolute paths, never `$HOME/...` or `~`. `S` is the scratch dir's absolute path, which `yarn tests:mellifera:remote-sync` prints on stderr (`mellifera-remote-sync: scratch S`) and writes to `--scratch-file FILE`. The scratch dir is the sibling `DIR.scratch` of the synced tree, outside it, so a later sync and the tree's file watchers never reach it.

```bash
SPILL_GRADLE_OPTS="-Dorg.gradle.daemon=false -Dorg.gradle.project.kotlin.compiler.execution.strategy=in-process"
spill_env() { # SCRATCH_FILE: sets E to that session's -e flags
  local s
  s=$(cat "$1")
  E=(-e "TMPDIR=$s" -e "RNFB_METRO_CACHE_ROOT=$s/metro" -e "GRADLE_OPTS=$SPILL_GRADLE_OPTS")
}
```

- `TMPDIR` puts RNFB's logs and scratch files in the scratch dir ([scratch paths](running-e2e.md#e2e-scratch-paths)), along with those of tools that follow `TMPDIR`. `RNFB_METRO_CACHE_ROOT` puts the Metro cache there too. Removing the scratch dir removes them.
- `GRADLE_OPTS` keeps build daemons from outliving the run. `-Dorg.gradle.daemon=false` overrides `org.gradle.daemon=true` in `tests/android/gradle.properties`: each Gradle build forks a single-use daemon for `org.gradle.jvmargs` and stops it when the build ends. The `org.gradle.project.` system property sets the Gradle property `kotlin.compiler.execution.strategy=in-process`, so Kotlin compiles in that build process, within its `-Xmx`, and starts no Kotlin daemon. Exec's `-e` takes only shell identifiers as keys, so the `ORG_GRADLE_PROJECT_<name>` env form cannot carry this dotted name. Every Gradle path runs `tests/android/gradlew`, which reads `GRADLE_OPTS`: `yarn tests:android:unit`, `yarn tests:android:build` (Detox, through `gradlew-with-worker-cap.sh`), `yarn tests:android:post-e2e-coverage` and `yarn tests:android:test:jacoco-report`.
- These values exist only on spill execs. Local desk runs keep the checked-in defaults.

<a id="spill-teardown"></a>

### Spill teardown

Run this for every grant after its work, pass or fail, in this order. `ID`, `DIR`, `SF`, `E`, and `M` are that grant's session id, synced directory, `--scratch-file`, [spill exec env](#spill-exec-env), and `--url`/`--federation` flags. With the single worktree pointer ([remote spill](#remote-spill)), drop `--session "$ID" "${M[@]}"`.

1. **Liveness.** `yarn tests:mellifera:exec --session "$ID" "${M[@]}" -- true`. When it fails (expired grant, host offline), skip to step 6 and report that the work dir, the scratch dir and any processes were left on the host.
2. **Fetch artifacts.** Bring coverage back as exec stdout ([distributed e2e step 4](#distributed-e2e-run) for the piece paths). Logs, when wanted, are the scratch dir's `rnfb-*` entries (the `yarn test:full` LOGDIR, Metro and emulator logs, the piece's logcat): `yarn tests:mellifera:exec --session "$ID" "${M[@]}" -w "$(cat "$SF")" -- sh -c 'exec tar -czf - rnfb-*' > "$RUN/P.logs.tgz"` (no `-t`, so stdout is a byte stream).
3. **Slot or host release, then check.** Read the placement and slot with `yarn tests:mellifera:reduce field --reserve "$RUN/P.reserve.json" --field placement` and `--field slot`; never guess them. `yarn tests:mellifera:exec --session "$ID" "${M[@]}" "${E[@]}" -w "$DIR" -- yarn tests:e2e:release --devices --placement=slot --slot=N` ([desk slot release](#desk-slot-release); `--placement=host` with no slot on a whole-guest grant), then the same exec with `-- yarn tests:e2e:check --slot=N --services` (`-- yarn tests:e2e:check --services` on a whole guest), which must exit 0. When `field slot` exits 3 (placement `pool`, a [global grant](#global-grant-placement) that names no slot index), skip this step and report it: release and check refuse `--placement=pool`, and `--placement=host` would wipe every slot on a desk. Steps 4 to 6 still run; they act only on `DIR`, `DIR.scratch` and the grant. The `linux-self-hosted` grant and the [simple mode](#mellifera-simple-mode) proof start no devices, Metro or emulators, so they skip this step whatever the placement.
4. **Our processes.** `yarn tests:mellifera:exec --session "$ID" "${M[@]}" "${E[@]}" -w "$DIR" -- bash scripts/e2e/mellifera-distributed-piece.sh leftovers` lists this user's processes whose working directory is `DIR`, `DIR.scratch`, or under either (logical and physical paths), and exits 0 when there are none. A process that only names those paths in its arguments is not counted, and the exec shell and its other ancestors are never listed or signalled. Metro, Jet, Node and the emulator suite run with their working directory in the tree. With the spill exec env, each Gradle build uses a single-use daemon that stops when the build ends and Kotlin compiles in that process, so expect no build daemon. A leftover Gradle JVM whose working directory is in the tree (one started from `tests/android` without the spill exec env, for example) is matched like any other process. Kotlin daemons normally run with their working directory outside the tree and are not matched. When it exits 1, run it again with `leftovers --stop` (TERM, then, after `RNFB_SPILL_STOP_WAIT_S`, default 10 seconds, KILL to those still listed), which must exit 0. Exit 2 means it could not check (no `lsof` on macOS, a failed process listing, or no sibling scratch dir); that blocks step 5. For a daemon outside the tree, fix the spill exec env rather than stopping it by name: never run `./gradlew --stop`, `pkill` or `killall` by name on a desk slot, since they reach other slots' daemons.
5. **Remove the work and scratch dirs**, only after step 4 exited 0. From the grant's initial directory (no `-w`): `yarn tests:mellifera:exec --session "$ID" "${M[@]}" -- rm -rf -- "$DIR" "$DIR.scratch"`, then `yarn tests:mellifera:exec --session "$ID" "${M[@]}" -- sh -c '! test -e "$1" && ! test -e "$1.scratch"' sh "$DIR"`, which must exit 0.
6. **Release the grant** on the issuing core, even when an earlier step failed: `yarn tests:mellifera:reduce release --reserve "$RUN/P.reserve.json" "${M[@]}"` for a grant of a distributed run, `yarn tests:mellifera:release` for the worktree pointer.

Accepted residue, kept as the donor cost of a spill: home-level shared caches (Gradle caches and wrapper distributions, the npm cache, the Yarn global cache, the CocoaPods cache, the Firebase emulator downloads); slot devices (`TestingAVD-N`, `RN E2E iOS slot-N`, and a guest's `TestingAVD`), which release shuts down and keeps for reuse; and the adb server, which shares the default port with the donor's serial resources and is not stopped. Files written outside `TMPDIR` by tools that ignore it are not covered by these steps.

<a id="mellifera-spill-overlapping-full"></a>

## Mellifera spill (overlapping full)

**Mellifera spill (donated desk slots):** overlapping `yarn test:full --slot N` runs use one worktree per grant when `--session` is omitted. [Distributed e2e](#distributed-grid) reserves its grants from this one worktree and selects each with `--session`. It does not require another git worktree per grant. `N` is that grant's [slot index](running-e2e.md#e2e-slot-index). Bastion session shape stays in Mellifera — [Spill donated desk slots](https://github.com/invertase/mellifera/blob/main/CLUSTER.md#spill-donated-desk-slots-rnfb). RNFB maps the grant and runs the suite — [remote spill](#remote-spill). Each grant has its own scratch dir, [spill exec env](#spill-exec-env), and [teardown](#spill-teardown). Apply with `yarn tests:mellifera:apply` (`placement: "slot"` and the slot index). Do **not** pass `--clear-whole-host` (kills sibling slots). Overlapping Apple `pod:install` keeps the host-global CocoaPods / trunk CDN risk under [slot lifecycle](running-e2e.md#slot-lifecycle). Overlapping verify: [Overlapping verify / Jest](running-e2e.md#overlapping-verify-jest).

<a id="distributed-grid"></a>

## Distributed grid

Three tiers. [Simple mode](#mellifera-simple-mode) is separate from these tiers. The reducer for every tier runs in this worktree after the remote pieces and records each piece's exit code — commands and report in [Distributed e2e run](#distributed-e2e-run). A live run of distributed full or distributed full + link is not required.

**Distributed e2e** is three simultaneous grants from this one worktree:

- Android e2e on kind `linux-nested-virt-self-hosted`
- iOS e2e, including `yarn tests:ios:ruby`, on kind `macos-self-hosted`
- macOS e2e on kind `macos-self-hosted`, its own grant

Each piece's sync and exec pass that reserve's `sessionId` as `--session`. On sync the flag is before `--rsh`. Each piece's exec also passes `-w` with the directory that piece's sync printed. The next `reserve` replaces the single worktree pointer. `--session` still selects the earlier grants. This section does not require another git worktree per grant.

**Distributed full** is distributed e2e plus one kind `linux-self-hosted` grant that runs `yarn tests:jest`, `yarn lint`, and `yarn codegen:verify` ([linux grant commands](#distributed-full-linux)). `yarn lint` is that linux grant. Ruby lint stays inside the iOS e2e grant via `yarn tests:ios:ruby`.

**Distributed full + link** is distributed full plus `yarn test-expo:ios:link` and `yarn test-rn-bare:ios:build` on kind `macos-self-hosted`.

TypeScript, attw, consumer-types, and typedoc stay outside all three tiers.

<a id="guest-requirements"></a>

### Guest requirements per kind

What RNFB needs on a remote grant of each kind it reserves, before `yarn install`. RNFB never installs toolchains on a guest; the image supplies them. How each image is built is Mellifera's: [linux-colima guest image](https://github.com/invertase/mellifera/blob/main/packages/scaler/guest-images/linux-colima/README.md), [boat snapshots](https://github.com/invertase/mellifera/blob/main/packages/scaler/guest-images/boat/BAKE.md), [Fusion nested-virt template](https://github.com/invertase/mellifera/blob/main/packages/scaler/guest-images/fusion-nested/prepare-template.sh), [Tart golden image](https://github.com/invertase/mellifera/blob/main/okf-bundle/tart-host-runbook.md#spill-golden-image).

| Kind                            | RNFB work                                             | Guest must provide                                                                                                                                                                                                                                       |
| ------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `linux-self-hosted`             | `yarn tests:jest`, `yarn lint`, `yarn codegen:verify` | `rsync`; `git`; node 24 with corepack, so `yarn` resolves the `packageManager` version; Java 21 `java` on `PATH` (`yarn lint:android` runs google-java-format); build tools (python3, make, a C/C++ compiler) for any native addon `yarn install` builds |
| `linux-nested-virt-self-hosted` | Android piece                                         | the `linux-self-hosted` list, with a JDK 21 (`javac` too); the Android SDK with emulator and cmdline-tools at `ANDROID_HOME`; read/write `/dev/kvm`; the RAM and free disk the [piece](#distributed-e2e-run) checks                                      |
| `macos-self-hosted`             | iOS and macOS pieces, link tier                       | `rsync`; `git`; node 24 with corepack; JDK 21; Xcode with the piece's iOS simulator runtime and device type; Homebrew; Ruby with bundler                                                                                                                 |

Only the rsync check runs before sync. The pieces check Java, disk, memory, KVM and Xcode before they install, and `git-baseline` checks `git`; anything else missing fails the first command that needs it.

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

Confirm each JSON has `execution.checkoutMode` `remote` and `execution.connectUrl`; a `placement: "host"` with `slot: 0` guest is a valid piece, and so is a `placement: "slot"` grant with its slot index, including a global grant on a desk slot. A `placement: "pool"` grant, or one with no placement, is not a valid piece ([global grant placement](#global-grant-placement)): release it and stop.

**2. Sync and install each piece** (`P` is `android`, `ios`, or `macos`; repeat per piece and keep its `ID_P`, `SLOT_P`, `DIR_P`; `spill_env` is from [spill exec env](#spill-exec-env)):

```bash
ID_P=$(yarn tests:mellifera:reduce field --reserve "$RUN/P.reserve.json" --field sessionId)
PLACEMENT_P=$(yarn tests:mellifera:reduce field --reserve "$RUN/P.reserve.json" --field placement)   # slot or host
SLOT_P=$(yarn tests:mellifera:reduce field --reserve "$RUN/P.reserve.json" --field slot)   # empty for placement host; exits 3 for pool
DIR_P=$(yarn tests:mellifera:remote-sync --session "$ID_P" "${M[@]}" --scratch-file "$RUN/P.scratch")
spill_env "$RUN/P.scratch"
yarn tests:mellifera:exec --session "$ID_P" "${M[@]}" "${E[@]}" -w "$DIR_P" -- yarn install --immutable
```

**3. Run the three pieces overlapping, capturing each exit code.** [`scripts/e2e/mellifera-distributed-piece.sh`](../../scripts/e2e/mellifera-distributed-piece.sh) runs one platform's canonical `yarn tests:*` sequence in one remote shell, so the emulator suite and Metro stay up between steps. Before any install or build step, every piece checks for a JDK 21 or newer `javac` (from `JAVA_HOME` when set, which Gradle uses) and a Java 21 or newer `java` on `PATH`, which the Firebase emulators use (CI uses Temurin 21 on every platform; `RNFB_JAVA_VERSION` overrides the minimum), and fails naming what is missing; it never installs Java. Each piece also checks free space (`df -Pk`) on the checkout's filesystem before installing or building: 30720 MB for android and 15360 MB for ios and macos (`RNFB_E2E_MIN_FREE_DISK_MB` overrides), plus, on android while `TestingAVD` has no userdata image, 7373 MB (1.2 times the emulator's 6 GiB data partition) on the AVD home's filesystem, and fails naming how much is free and how much it needs. The default sync filter omits `vendor/bundle/`, so each guest's `yarn ruby:install` builds its own gems instead of loading native extensions linked against the caller's Ruby. android fails clearly on Linux when `/dev/kvm` is missing or not read/write (CI grants that with a udev rule), and when the machine's RAM is below the Gradle daemon heap (`-Xmx` in `org.gradle.jvmargs`, `tests/android/gradle.properties`) plus 4096 MB for the compilers and the emulator (`RNFB_ANDROID_MEMORY_HEADROOM_MB` overrides), resolves `ANDROID_HOME` (on Linux it defaults to the CI runner path `/usr/local/lib/android/sdk` and fails clearly when absent), creates the serial base AVD `TestingAVD` when it is missing (same system image as CI: `android-36` `google_apis`, host ABI, no device profile; idempotent; the name matches `SERIAL_ANDROID_AVD` in `tests/.detoxrc.js`), runs the placement's `yarn tests:e2e:release --devices` to stop a stale emulator, then `tests:android:unit`, `:build`, host-clear, emulator, packager, `:test-cover`, `tests:android:post-e2e-coverage` (merged Jacoco). The guest has no display, so unless the caller already set `RNFB_ANDROID_EMULATOR_BOOT_ARGS` the piece exports it as CI's emulator options (`-no-window -gpu swiftshader_indirect -no-snapshot -noaudio -no-boot-anim`, the android-emulator-runner v2.38.0 defaults; `-no-snapshot` covers snapshot load and save) and Detox boots `TestingAVD` with them. CI's `--headless` on `:test-cover` is not forwarded to Detox, so it is not passed here. On first boot the emulator raises an API 24+ data partition to at least 6 GiB and will not start unless 1.2 times that is free, though the image is sparse; CI's AVD home is a separate `/mnt` volume, but a guest holds the build and the AVD on one root disk. So right after creating `TestingAVD` (and for an existing one under `--placement=host`), the piece launches it headless once, on port 5584, until its userdata image exists, then stops it (`RNFB_ANDROID_AVD_PREWARM_TIMEOUT_S`, default 180, bounds the wait); a failed attempt deletes the partial image and fails the piece. The check runs only while that image is missing, and Detox never passes `-wipe-data`. A desk developer's existing `TestingAVD` is not launched. Under `--placement=host` the piece runs `./gradlew --stop` in `tests/android` after `:build`, because the build's idle daemons otherwise keep their heap and swap while the emulator boots; a desk slot skips it, since `--stop` stops every daemon of that Gradle version for the user, including other slots' builds. With the [spill exec env](#spill-exec-env) the build leaves no daemon, so that stop finds nothing. When `:test-cover` fails, the piece saves `adb logcat -d` (main, system and crash buffers) from the piece's emulator to `RNFB_ANDROID_LOGCAT_FILE` (default `${TMPDIR:-/tmp}/rnfb-e2e-logcat-android.txt`, with `-slotN` before `.txt` on a desk slot) and prints its `system_server`, package manager, low-memory, crash and ANR lines before coverage runs. It skips the capture when `adb get-state` does not report the emulator as a device, and bounds each of those adb calls by `RNFB_ANDROID_LOGCAT_TIMEOUT_S` (default 60); a capture failure never changes the piece's exit status. Skipped CI steps: the `/mnt` AVD home (a GitHub-runner disk layout), the tap loop and animation disabling (runner-side flake mitigations Detox does not need), and the emulator host packages, which the guest image supplies. ios checks Xcode, the `RNFB_IOS_SIM_RUNTIME` runtime (default `iOS 27.0`) and the `iPhone 17` device type and fails naming what is missing (it never downloads Xcode or runtimes), installs missing `applesimutils` / `xcbeautify` from the vendored Homebrew tap like CI (fails when `brew` is absent), runs `yarn ruby:install`, then `tests:ios:ruby`, `tests:ios:unit`, `:pod:install`, `:build` with CI's `SKIP_BUNDLING=1` and `RCT_NO_LAUNCH_PACKAGER=1`, host-clear, emulator, packager, `:test-cover`, `tests:ios:test:process-coverage`; macos checks Xcode, installs a missing `xcbeautify`, runs `yarn ruby:install`, then `:pod:install`, `:build` (same build env), host-clear, emulator, `tests:macos:packager:jet`, `:test-cover`. `--placement=` is the reserve JSON's `placement` and is required; the piece exits 2 without it, for `slot` without the slot, and for `host` with one. With `slot` it loads that slot's env first (and creates the slotted AVD or simulator), and both releases are `--placement=slot --slot=N`: they re-apply that slot's env, since `exec` starts a fresh shell, and stop only that slot's resources, so a desk spill never stops sibling slots or the donor's own devices ([desk slot release](#desk-slot-release)). With `host` it uses serial defaults on the whole guest, and both releases are `--placement=host` (whole-machine wipe). The release always runs last. As in CI, the coverage step runs even when the suite failed; the suite's exit wins, and a coverage failure fails an otherwise green piece. Otherwise the first failing step's status is the piece's, and `exec` returns it. The first Android piece on a fresh guest is slower: it downloads the system image and creates `TestingAVD` before the build. A cold guest also builds CocoaPods and the Detox framework cache without CI's caches, so its first iOS and macOS pieces are slow too.

```bash
run_piece() { # P ID DIR PLACEMENT SLOT
  date +%s > "$RUN/$1.started"
  spill_env "$RUN/$1.scratch"
  yarn tests:mellifera:exec --session "$2" "${M[@]}" "${E[@]}" -w "$3" -- bash scripts/e2e/mellifera-distributed-piece.sh "$1" "--placement=$4" $5 > "$RUN/$1.log" 2>&1
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

`reduce release` runs the CLI's `release --session-id ID` with the session token in that child's `MELLIFERA_SESSION_TOKEN` env, not on argv, so local process listings do not show it. The CLI reads that env var only alongside `--session-id`. The token is never printed.

**6. Tear down every piece, pass or fail:** [spill teardown](#spill-teardown) with `ID_P`, `DIR_P`, `SF="$RUN/P.scratch"`, and `spill_env "$RUN/P.scratch"`. Its release step is `yarn tests:mellifera:reduce release`, which reads the token from the reserve JSON and does not print it.

<a id="distributed-full-linux"></a>

**Distributed full: the linux grant.** Reserve as in step 1 with `--kinds linux-self-hosted` into `$RUN/linux.reserve.json`, then run step 2's field, `remote-sync` and `spill_env` lines with `P=linux`; its install comes after the baseline below. The sync omits `.git`, and `git diff` outside a work tree is not a drift check (it exits 1 or 129), so `yarn codegen:verify` and the drift step of `yarn lint:android` need a baseline. `git-baseline` stages the synced tree into a fresh index on the guest, with no commit; `git diff` then compares regenerated files with the synced source. Run it right after sync and before `yarn install`, as CI checks drift against the checkout. It exits 2 without the sibling scratch dir or inside another repository's work tree, so it never touches a real checkout. Each exit code is that target's result; tear down as in step 6.

```bash
L=(--session "$ID_linux" "${M[@]}" "${E[@]}" -w "$DIR_linux")
yarn tests:mellifera:exec "${L[@]}" -- bash scripts/e2e/mellifera-distributed-piece.sh git-baseline
yarn tests:mellifera:exec "${L[@]}" -- yarn install --immutable
yarn tests:mellifera:exec "${L[@]}" -- yarn tests:jest
yarn tests:mellifera:exec "${L[@]}" -- yarn lint
yarn tests:mellifera:exec "${L[@]}" -- yarn codegen:verify
```

<a id="desk-slot-release"></a>

### Desk slot release

A desk shares its host with other slots and the operator. Release a desk-slot grant as `yarn tests:e2e:release --devices --placement=slot --slot=N`, with `N` equal to `grant.slot`, locally or through `exec`. Release re-applies slot `N`'s env (keeping a caller's `RNFB_E2E_PLATFORM`; `--platform=` still wins) and stops only that slot's Metro, Jet and emulator-suite ports, `TestingAVD-N` / `emulator-<5556+2N>`, Detox strays whose AVD is `TestingAVD-N`, `RN E2E iOS slot-N`, and `io.invertase.testing.sN`. It exits 2 before touching anything when `--slot` is missing, `--all-slots` is passed, or a different slot's env is loaded. A bare `--slot=N` on check or release re-applies slot `N` the same way. `--placement=host` is the whole-guest shape only (a provisioned guest, placement `host`, slot `0`): it drops slot env and wipes every slot.

<a id="global-grant-placement"></a>

### Global grant placement (`pool`)

A grant reserved through the global core only (a service-key login with no local core) has `phase: "pool-global"` and `host: "global"`. When it landed on a desk slot and the global core reports that, it has `placement: "slot"` and the desk's slot index in `slot`; RNFB then treats it like any desk slot grant (`field slot` prints the index, and pieces, release and teardown take `--placement=slot --slot=N`). Otherwise it has `placement: "pool"` and `slot: 0`, whatever unit it landed on: a desk slot or a whole guest. That `slot: 0` is a placeholder, not the unit's slot index. A grant with no `placement` reads as `pool`. RNFB cannot tell a desk slot from a whole guest from a `pool` grant, and the wrong guess is unsafe: `--placement=host` on a donor desk wipes every slot and the donor's own devices. So, for a `pool` grant:

- `yarn tests:mellifera:reduce field --field slot` exits 3 with a message for any placement other than `slot` (with a non-negative integer slot) or `host`. `--field placement` prints `pool`.
- `scripts/e2e/mellifera-distributed-piece.sh` and `yarn tests:e2e:release` exit 2 on `--placement=pool`, before touching anything. Never substitute `--placement=host`.
- [Spill teardown](#spill-teardown) skips step 3 for that grant and still runs steps 4 to 6.
- What still works on a `pool` grant: sync, `git-baseline`, install, the [linux grant](#distributed-full-linux) commands, the [simple mode](#mellifera-simple-mode) proof, `leftovers`, removing the work dirs and release. None of them use the slot index.
- What does not: distributed e2e pieces and any device release.

Known limitation: a `pool` grant runs no distributed e2e piece and gets no device release, since only the global reserve knows whether it is a desk slot ([mellifera-cli § Layered reserve](https://github.com/invertase/mellifera/blob/main/packages/cli/README.md#layered-reserve)). The refusals above stay for it.

<a id="mellifera-simple-mode"></a>

## Simple mode

A kind-`slot` remote desk grant: `execution.checkoutMode` is `remote`, `placement` is `slot`, and `execution.connectUrl` is on the reserve JSON. `phase: local` fails. This proof chooses no Detox suite. It is not a distributed-grid tier. The `yarn lint` exec here is the sync proof on the desk grant. The grid's `yarn lint` stays the `linux-self-hosted` grant in [Distributed grid](#distributed-grid).

Reserve prints the full grant JSON. `rememberGrant` does not store `connectUrl`. A session-record `connectUrl` is not the URL for this proof. `exec` on a phase-local grant returns `remote-exec-unavailable`. When the federation has no offer of kind `slot`, the proof fails. Do not name a donor.

1. `yarn tests:mellifera:reserve` with `--kinds slot`, plus `--url` and `--federation` as in [Plane B](running-e2e.md#worktree-session). Save the reserve JSON from stdout. Read `execution.connectUrl` from that JSON. Confirm `execution.checkoutMode` is `remote`, `placement` is `slot` (or `pool` for a [global grant](#global-grant-placement); this proof uses no slot index), and `phase` is not `local`.
2. `yarn tests:mellifera:remote-sync` syncs this checkout onto that slot, into `mellifera-work/<sessionId>` under the desk login's home. Pass that reserve's `sessionId` as `--session` before `--rsh`, with the same `--url` and `--federation`, and `--scratch-file "$RUN/scratch"`. Save the directory it prints (`DIR`).
3. `spill_env "$RUN/scratch"` ([spill exec env](#spill-exec-env)), then `yarn tests:mellifera:exec` with that `--session`, `--url`, and `--federation`, then `"${E[@]}" -w DIR -- yarn lint`, exits 0. That exit is the remote command's exit.
4. The `version` field in the synced `DIR/packages/app/package.json` on the slot equals the same field in this worktree.
5. One log file from the slot is present in this worktree. It arrived as saved `exec` stdout or by rsync over `exec --rsh`. Its contents match the remote file.
6. From this worktree, `ssh -o IdentitiesOnly=yes -i SSH_DIR/mellifera_client_ed25519` to the reserve JSON `execution.connectUrl` and print that same `version` from `DIR/packages/app/package.json`. Plain `ssh` is refused by publickey; pass the key the CLI uses. `exec` takes its identities (`mellifera_client_ed25519` first) and default `known_hosts` from the CLI's SSH dir `SSH_DIR`: `--ssh-dir DIR`, else a non-empty `MELLIFERA_SSH_DIR`, else config `sshDir`, else `$HOME/.ssh` ([mellifera-cli § Host config](https://github.com/invertase/mellifera/blob/main/packages/cli/README.md#host-config), CLI 0.2.0 or later). `mellifera-cli --help` prints the resolved directory and its source. Operator ssh may use `StrictHostKeyChecking=accept-new`. `mellifera-cli exec` stays `StrictHostKeyChecking=yes` and uses `hostKeyPin` or the bastion known-hosts file. The local ssh exit equals the remote command's exit. The printed version equals step 4.
7. [Spill teardown](#spill-teardown) for the grant.
