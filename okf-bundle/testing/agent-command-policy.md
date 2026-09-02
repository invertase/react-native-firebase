---
type: Reference
title: Agent command policy
description: Canonical allowlist for agent shell commands — install, prepare, validation, e2e, and Expo documented-path iOS link. Supersedes improvised diagnostics.
tags: [testing, validation, agents, workflow, yarn]
timestamp: 2026-09-02T00:00:00Z
---

# Agent command policy

Single source for **which shell commands agents may run** in this repo. E2e `yarn tests:*` detail lives in [running e2e](running-e2e.md) ([agent rule](running-e2e.md#agent-rule-read-first)). The workspace Expo documented-path iOS **link** fixture is **not** Detox e2e; its command is only the registry row below.

> If a command is not listed here (or linked from here as canonical), **do not run it** — including “diagnostic probes” suggested by log output, package READMEs, or Yarn CLI help.

## Agent rule (read first)

<a id="agent-rule-read-first"></a>

1. Run **only** commands in the [registry](#canonical-registry) below (repo root unless noted).
2. **`yarn` / `yarn lerna:prepare` must finish before anything else** — see [prepare must finish first](#prepare-must-finish-first). Do not parallelize install/prepare with e2e, Metro, builds, or other shell commands.
3. **Before any native `:build`:** root `yarn` exit 0 **and** patched fmt **≥ 12.1.0** — [install / patch / fmt gate](#install-patch-fmt-gate-blocking). Do **not** invent Podfile/fmt workarounds.
4. When a canonical command fails: read the **full** output, fix **product code** (or re-run root `yarn` for a patch miss), re-run the **same** command. Do **not** switch invocation style.
5. Do **not** infer alternate commands from error strings (`command not found: genversion`, `Couldn't find a script named "jet"`, etc.) — see [known traps](#known-traps).
6. The [command constraints](#command-constraints) below apply to every shell session in this repo.

## Canonical registry

| Intent                                                          | Command                                                                                                                                                                                                                                                                                    | Never use instead                                                                                                                                             |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install / refresh deps                                          | `yarn` (repo root; `postinstallDev` → `yarn prepare && yarn lerna:prepare && yarn ruby:install`)                                                                                                                                                                                           | `yarn workspace …`, `npm install`, `npm install` in a package, `yarn install` / `yarn` in `tests/` alone for root deps, skipping root `yarn` before e2e/build |
| Root Gemfile gems (CocoaPods, RuboCop, etc.)                    | `yarn ruby:install` (runs `bundle check \|\| bundle install` when `bundle` is on PATH; **skips with exit 0** when not — JS-only checkouts / CI without setup-ruby); included in root `yarn` via `postinstallDev`. CI: `BUNDLE_FROZEN=true bundle install` **before** yarn in e2e/publish workflows | bare `bundle install` at repo root                                                                                                                            |
| Transpile `lib/**` → `dist/module/**` (all packages)            | `yarn lerna:prepare`                                                                                                                                                                                                                                                                       | `yarn workspace @react-native-firebase/* prepare`, `cd packages/<pkg> && yarn prepare`, `cd packages/<pkg> && yarn run build`                                 |
| Transpile one package                                           | `yarn lerna run prepare --scope @react-native-firebase/<pkg>`                                                                                                                                                                                                                              | `yarn workspace @react-native-firebase/<pkg> prepare`                                                                                                         |
| After `packages/*/lib/**` edits (Metro serves `dist/module/**`) | `yarn lerna:prepare`; Metro restart when already running ([running e2e § prepare completion gate](running-e2e.md#prepare-completion-gate-blocking)) — platform `:build` only when [running e2e § Rules #3](running-e2e.md#rules) requires native/codegen/instrumentation, not for JS alone | ad-hoc `bob`, `babel`, or package-scoped prepare                                                                                                              |
| TS/JS validation sequence                                       | [validation checklist](validation-checklist.md)                                                                                                                                                                                                                                            | ad-hoc `tsc` in package dirs unless listed there                                                                                                              |
| JS lint (implementation / review gate)                          | `yarn lint:js`, `yarn lint:js --fix`                                                                                                                                                                                                                                                       | package-scoped `eslint`, `npx eslint`                                                                                                                         |
| Android Java format / lint                                      | `yarn lint:android`                                                                                                                                                                                                                                                                        | `yarn google-java-format`, bare `google-java-format`, `google-java-format -i`, `npx google-java-format`, any invented format script                           |
| Docs lint                                                       | `yarn lint:markdown`, `yarn lint:spellcheck` — when: [validation checklist § lint and formatting](validation-checklist.md#lint-and-formatting) (`docs/**` only; OKF-only skips)                                                                                                           | ad-hoc prettier/eslint on single files                                                                                                                        |
| iOS Ruby lint (RuboCop)                                         | `yarn lint:ruby` (also runs inside `yarn tests:ios:ruby`)                                                                                                                                                                                                                                  | ad-hoc `rubocop`, `bundle exec rubocop` without the Gemfile/config                                                                                            |
| Android JVM unit tests                                          | `yarn tests:android:unit`                                                                                                                                                                                                                                                                  | ad-hoc `./gradlew …` outside this yarn script; bare Robolectric/JUnit IDE-only as the agent gate                                                              |
| iOS XCTest unit tests (in-package)                              | `yarn tests:ios:unit`                                                                                                                                                                                                                                                                      | ad-hoc `xcodebuild test`; CocoaPods `test_spec`; `tests/ios/testingTests` host UI tests                                                                       |
| iOS Ruby unit tests (SPM / CocoaPods helpers)                   | `yarn lint:ruby` / `yarn tests:ios:ruby` (after root `yarn` or `yarn ruby:install` when gems are missing)                                                                                                                                                                                  | ad-hoc `ruby packages/app/__tests__/…_test.rb`, bare `ruby …/run_with_coverage.rb` without the yarn script as the agent gate                                  |
| iOS CocoaPods provisioning before shared build                 | `yarn tests:ios:pod:install` (after root `yarn` or `yarn ruby:install` when gems are missing; required order below)                                                                                                                                                                         | bare `pod install`, `cd tests/ios && pod install`, or assuming `yarn tests:ios:build` creates CocoaPods support files                                          |
| Expo documented-path iOS link (workspace `test-expo/`)          | `yarn test-expo:ios:link` (repo root; script `.github/workflows/scripts/test-expo-ios-link.sh`)                                                                                                                                                                                             | ad-hoc `expo prebuild` / `xcodebuild` outside that script; `cd test-expo && …` as the agent gate                                                              |
| Android merged Jacoco (unit + e2e)                              | `yarn tests:android:post-e2e-coverage` (after e2e); `yarn tests:android:test:jacoco-report` when regenerating the merge report                                                                                                                                                             | `./gradlew jacocoAndroidTestReport` as Codecov path; inventing other jacoco yarn scripts                                                                      |
| E2e + coverage                                                  | [running e2e](running-e2e.md) — **only** `yarn tests:*`                                                                                                                                                                                                                                    | `jet`, `npx jet`, `yarn jet`, `detox test`, bare `detox`, `cd tests && …`, `cd tests-macos && …`, direct Metro/emulator starts                                |
| iOS Detox framework cache rebuild                               | `yarn tests:ios:detox-framework-cache:rebuild`                                                                                                                                                                                                                                             | `cd tests && yarn detox clean-framework-cache`, `cd tests && yarn detox build-framework-cache`, bare `detox …`                                                |
| Host pre-flight (before each `:test-cover`)                     | [running e2e § pre-flight](running-e2e.md#pre-flight-is-the-host-clear-to-start) — host-clear + services ready + **[checkout ownership](running-e2e.md#services-checkout-ownership-blocking)** + harness tier. `yarn tests:e2e:check` / `yarn tests:e2e:release` ([host-clear probes](running-e2e.md#host-clear-probes)) | Port/HTTP checks alone when Metro/emulators belong to another worktree; `pgrep`/spawn probes of Jet/Detox as completion signals; ad-hoc `pgrep` / hardcoded `:8090` only; improvised kill lists; `--all-slots` while another owner is live |
| Slotted parallel                                                | [running e2e § slot lifecycle](running-e2e.md#slot-lifecycle) — `eval "$(yarn tests:e2e:export-slot-env <platform> N)"` then the **same** `yarn tests:packager:*` / `yarn tests:emulator:start` / `pod:install` / `:build` / `:test-cover` as serial. macOS packager is `yarn tests:macos:packager:*` (`tests-macos/`); mobile is `yarn tests:packager:*` (`tests/`) | ad-hoc port math; second lifecycle helpers as the runbook; rsync between local worktrees; host flock; Metro-after-build; disabling Swift explicit modules; Debug `RCT_NO_LAUNCH_PACKAGER` as a Metro fix; using the mobile packager for macOS Jet (or vice versa) |
| TurboModule codegen (all migrated / CI)                         | `yarn codegen:verify` (wipe + regen + diff); `yarn codegen:all` for local regen via package scripts                                                                                                                         | ad-hoc CLI without wipe; inventing alternate codegen yarn scripts — see [TurboModule codegen](#turbomodule-codegen)                                           |

### Prepare / transpile (detail)

`yarn lerna:prepare` runs each package's **`prepare`** script (`build` → `compile` via react-native-builder-bob). That is what produces **`dist/module/**`** consumed by Metro in debug e2e — only **release\*\* builds pre-bundle/embed JS ([running e2e § Rules #3](running-e2e.md#rules)).

- **`yarn compile`** (package script) is **not** a standalone agent entrypoint — it is invoked **inside** `prepare` via lerna. Do not run `cd packages/<pkg> && yarn compile` for handoff unless [validation checklist](validation-checklist.md) explicitly adds an exception (none today).
- **`yarn`** at repo root runs `postinstallDev` → `yarn prepare && yarn lerna:prepare && yarn ruby:install`; a fresh install already transpiles and installs root Gemfile gems. Re-run **`yarn lerna:prepare`** after `lib/**` edits without reinstalling.

<a id="prepare-must-finish-first"></a>

### Prepare must finish first (blocking)

**`yarn`**, **`yarn lerna:prepare`**, and **`yarn lerna run prepare --scope …`** are **blocking foreground** commands. Wait for the shell to return **exit code 0** before starting **any** other command — including in the same agent turn via parallel tool calls.

| Do not start until prepare exits 0        | Why                                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `yarn tests:*` (e2e, packager, build)     | Metro (debug JS) reads **`dist/module/**`**, not `lib/\*\*` — partial prepare → missing modules, stale bundles |
| `yarn tests:packager:jet-reset-cache` / `yarn tests:macos:packager:jet-reset-cache` | Reset after prepare, not during it. Free `:8081` first — [running e2e § packager reset-cache](running-e2e.md#packager-reset-cache-eaddrinuse). Mobile packager is `tests/`; macOS packager is `tests-macos/` |
| `yarn tsc:compile`, Jest, `compare:types` | May read transpiled output or assume `dist/` is current                                                        |
| Another `yarn` / scoped prepare           | Overlapping Nx/Lerna runs race on `dist/`                                                                      |

**Agent rule:** one prepare invocation per message batch; wait for completion; then run the next step (Metro restart if needed → pre-flight → `:test-cover`). [Running e2e § prepare completion gate](running-e2e.md#prepare-completion-gate-blocking) is the e2e-side mirror of this rule.

**Symptoms when violated:** `Cannot find module '…/dist/module/…'`, Metro 500 on bundle, e2e failures before tests run, or green Metro `/status` while the app loads a half-written `dist/`.

<a id="install-patch-fmt-gate-blocking"></a>

### Install / patch / fmt gate (blocking before native `:build`)

**Canonical owner** for install + patch freshness before Detox native builds. E2e docs link here — do not restate this procedure elsewhere.

**Before any** `yarn tests:ios:build`, `yarn tests:android:build`, or other Detox native build path:

1. **Root `yarn` MUST have run and exited 0** in this checkout. Required on a fresh checkout, after deleting `node_modules`, after pulling patch changes, and whenever patches may be stale. Do **not** start native `:build` until that install finished successfully.
2. Root `yarn` applies **`.yarn/patches`** (jet, detox, mocha-remote) and workspace **`patch-package`** patches. **macOS** still applies **`tests-macos/patches/react-native+0.78.3.patch`** (fmt **12.1.0**). **Mobile RN 0.86.2** ships fmt **12.1.0** upstream (no `tests/patches/react-native+*.patch` fmt bump). `tests` / `tests-macos` `prepare` is `patch-package` and must **not** be Nx-cache-skipped ([MonoTool-AD-12](../monorepo-tooling/architecture-decisions.md#monotool-ad-12--never-nx-cache-prepare-when-the-script-is-patch-package--accepted)).
3. **Verify** the React Native fmt podspec reports version **≥ 12.1.0** (Xcode 26 / Apple Clang 21-safe floor for this pin). **Yarn exit 0 alone is not sufficient** — always run the check below before native `:build` (a prepare cache-skip historically left fmt at **11.0.2** despite a green install):

```bash
# Mobile toolchain (tests/) — required before ios/android :build
rg 'spec\.version|:tag' tests/node_modules/react-native/third-party-podspecs/fmt.podspec
# macOS app (tests-macos/) — required before macos :build (path may be workspace-local or hoisted)
rg 'spec\.version|:tag' tests-macos/node_modules/react-native/third-party-podspecs/fmt.podspec \
  || rg 'spec\.version|:tag' node_modules/react-native/third-party-podspecs/fmt.podspec
```

Expect `12.1.0` (or higher) on both `spec.version` and `:tag`.

4. If fmt is still **11.0.2** (or anything **< 12.1.0**): **STOP**. Re-run root `yarn` / fix patch application for **macOS** (including Nx `tests-macos:prepare` cache policy — [MonoTool-AD-12](../monorepo-tooling/architecture-decisions.md#monotool-ad-12--never-nx-cache-prepare-when-the-script-is-patch-package--accepted)). On mobile 0.86+, fmt should already be ≥12.1.0 without a patch; if not, investigate the resolved `react-native` version. Do **not** invent Podfile `post_install` fmt hacks, `FMT_USE_CONSTEVAL` / `base.h` patches, c++17-for-fmt-only, or web-search workarounds.
5. **Before `yarn tests:ios:build` on a clean checkout:** run root `yarn` (which includes `yarn ruby:install`), then run **`yarn tests:ios:pod:install`** and wait for exit 0. Re-run the Pod install after `tests/ios/Podfile` / `Podfile.lock`, package podspec, or native dependency-resolution changes, and whenever `tests/ios/Pods` is absent. Root `yarn` does **not** create the CocoaPods xcconfig or file-list support files; the shared build invokes Detox/Xcode and does **not** provision them. CI installs the root bundle before yarn, then uses this same Pods-before-build order in `.github/workflows/tests_e2e_ios.yml`.

**Symptoms when violated:** Apple Clang 21 consteval errors compiling unpatched fmt **11.0.2**; missing `tests/ios/Pods` xcconfig or file-list support files; agents inventing Podfile/fmt workarounds instead of re-running root `yarn` / fixing prepare cache policy.

## When install or prepare fails

1. Re-run from repo root: **`yarn`** or **`yarn lerna:prepare`** (full log — do not truncate).
2. Note the **first** Nx/Lerna project that failed (e.g. `@react-native-firebase/functions:prepare`).
3. Fix **product code** in that package (TypeScript errors, missing exports, etc.).
4. Re-run **`yarn lerna:prepare`** — same command, same cwd.
5. Do **not** “verify tooling” with `yarn workspace … prepare`, `yarn bin …`, or package-scoped `yarn run build` — Yarn 4 uses **different PATH** for those invocations ([genversion trap](#genversion--prepare-paths)).

## Forbidden (always)

| Command                                                                                                                                                                          | Why                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `yarn workspace @react-native-firebase/* prepare` (and variants)                                                                                                                 | Not canonical; breaks root devDependency binary resolution                          |
| `cd packages/<pkg> && yarn prepare` / `yarn run build`                                                                                                                           | Same trap; not the postinstall / lerna code path                                    |
| `yarn google-java-format`, bare `google-java-format`, `npx google-java-format`, `google-java-format -i`                                                                          | Invented format entrypoints — **only** `yarn lint:android`                          |
| `npm install` (any cwd) / `yarn` / `yarn install` only in `tests/` for monorepo deps                                                                                             | Root `yarn` applies patches and workspace links; tests-only install is insufficient |
| Ad-hoc `./gradlew …` outside allowlisted yarn scripts (`tests:android:unit`, `tests:android:build`, `tests:android:post-e2e-coverage`, `tests:android:test:jacoco-report`, etc.) | Wrong task / cwd / report path; invents CI that does not match Codecov              |
| Ad-hoc `xcodebuild test` / CocoaPods `test_spec` / `tests/ios/testingTests` as the iOS unit gate                                                                                  | Misses LCOV merge — **only** `yarn tests:ios:unit` ([IosTest-AD-1](ios-architecture-decisions.md#iostest-ad-1)) |
| Ad-hoc `ruby packages/app/__tests__/…_test.rb` (or bare runner) as the validation gate                                                                                           | Misses SimpleCov / suite discovery — **only** `yarn tests:ios:ruby`                 |
| Ad-hoc `expo prebuild`, `xcodebuild`, or `cd test-expo && …` as the Expo iOS link gate                                                                                            | **Only** `yarn test-expo:ios:link` from repo root — not Detox / `yarn tests:*`      |
| `react-native init`, `npx @react-native-community/cli init`, `npx react-native init`                                                                                              | Not on the allowlist — seed checked-in RN CLI trees via [template gotcha](#react-native-community-template-checked-in-rn-cli-ios) |
| `yarn jet`, `npx jet`, `cd tests && yarn jet …`                                                                                                                                  | [E2e agent rule](running-e2e.md#agent-rule-read-first)                              |
| `detox test`, bare `detox`, `cd tests && detox …`                                                                                                                                | E2e agent rule                                                                      |
| bare `bundle install` at repo root                                                                                              | Use **`yarn ruby:install`** or root **`yarn`** (`postinstallDev` includes ruby:install)                                                                         |
| Ad-hoc Metro / emulator start                                                                                                                                                    | Use `yarn tests:packager:jet` (iOS/Android) or `yarn tests:macos:packager:jet` (macOS), `yarn tests:emulator:start` ([running e2e](running-e2e.md#rules)) |
| Spawn / PATH probes to “test” Jet or genversion                                                                                                                                  | Log triage only; fix product code and re-run canonical command                      |

## Known traps

<a id="known-traps"></a>

<a id="shell-sandbox-permissions"></a>

### Cursor Shell sandbox / permissions

When a Shell command returns with **no exit status** (e.g. "execution backend unavailable") under default sandbox permissions, retry the **same** canonical command with `required_permissions: ["all"]` — do **not** invent an alternate command because the sandboxed attempt failed to start.

Local e2e (`yarn tests:*:test-cover`), the packager, emulator start, native builds, and host pre-flight probes that need real devices/simulators typically need unrestricted permissions on this host. A "no exit status" result on those commands is a sandbox artifact, not evidence the run failed or is incomplete — see [running e2e § running one iteration](running-e2e.md#running-one-iteration) for checking the tee log footer before concluding anything from a missing exit code. Startup-fail markers on the tee are immediate hard infra — [startup fail-fast poll](running-e2e.md#startup-fail-fast-poll) (`TELNET` / `emulator-16` / `ReactContext is null` / serial leftover `:12007`+`5554`; idle APP_STATUS is healthy; `currentStatus` / status-query timeout is latency, not a wave-kill).

### genversion / prepare paths

- **`genversion` exists** at root `node_modules/.bin` after `yarn`.
- **`yarn lerna:prepare`** (and `yarn install` → `postinstallDev`) runs prepare via Nx with root toolchain on PATH → bare `genversion` in package `"build"` scripts **works**.
- **`yarn workspace … prepare`** or **`cd packages/foo && yarn run build`** does **not** expose root-only devDependencies → `command not found: genversion`. That is **not** corrupt `node_modules`; do **not** patch scripts with `yarn run -T genversion` unless deliberately changing repo policy on `main`.

### Jet

- **`yarn jet --help`** working or failing in `tests/` is **not** a valid e2e or install gate.
- Jet is started **internally** by `yarn tests:<platform>:test-cover`. Stale `:8090` → [pre-flight recovery](running-e2e.md#pre-flight-recovery), then re-run the same `:test-cover` command.
- Metro `EADDRINUSE` on `:8081` from `yarn tests:packager:jet-reset-cache` or `yarn tests:macos:packager:jet-reset-cache` → [packager reset-cache](running-e2e.md#packager-reset-cache-eaddrinuse) (free `:8081`, then the same yarn target). Not the `:8090` pre-flight kill. Do **not** use the mobile packager for macOS Jet (or vice versa).

### Android Java format

- There is **no** `yarn google-java-format` script. Invented `google-java-format` / `npx google-java-format` invocations are forbidden.
- **Canonical:** `yarn lint:android` (repo root) — wraps `google-java-format --set-exit-if-changed --replace` on `packages/*/android/src` and fails if the tree would change.

### Android build / unit / Jacoco

- **Do not** invent `cd tests && yarn install`, then bare `./gradlew` from an arbitrary cwd.
- Unit: **`yarn tests:android:unit`** only. Runner choice and `@Config` / `sdk` policy: [AndroidTest-AD-1](android-architecture-decisions.md#androidtest-ad-1).
- Merged coverage after e2e: **`yarn tests:android:post-e2e-coverage`** (Codecov path is `jacocoTestReport`, not e2e-only `jacocoAndroidTestReport`) — [coverage design](coverage-design.md).
- Optional explicit merge: **`yarn tests:android:test:jacoco-report`**.

### iOS XCTest (in-package)

- **Canonical:** `yarn tests:ios:unit` — discovers `packages/*/ios/*UnitTests/*.xcodeproj`, macOS destination, writes `coverage/ios-unit/lcov.info` and **merges into** `coverage/ios-native/lcov.info` ([IosTest-AD-1](ios-architecture-decisions.md#iostest-ad-1); [coverage design](coverage-design.md)).
- **Forbidden as the agent gate:** ad-hoc `xcodebuild test`, CocoaPods `test_spec`, `tests/ios/testingTests` host UI tests.

### JS lint / Bundler vendor

<a id="js-lint-bundler-vendor"></a>

- `yarn lint:js` is `eslint packages/* --max-warnings=0`. That glob covers `packages/app/__tests__/`. `scripts/version.js` is not in it.
- After `bundle install --gemfile=packages/app/__tests__/Gemfile`, Bundler follows root `.bundle/config` `BUNDLE_PATH: vendor/bundle` and drops a gitignored tree at `packages/app/__tests__/vendor/`. ESLint `globalIgnores` does not list that path, so lint reports thousands of vendor findings.
- That is local checkout noise, not a product lint failure. CI without that tree stays green.
- Do not invent a delete-vendor command as the lint gate. Do not patch `eslint.config.mjs` to hide it. Root `yarn ruby:install` or root `yarn` is the canonical install path above.


### iOS Ruby (SPM helpers)

<a id="ios-ruby-spm-helpers"></a>

- **Canonical:** `yarn tests:ios:ruby` — discovers all `packages/app/__tests__/*_test.rb`, SimpleCov → `coverage/ios-ruby/lcov.info`, Codecov flag `ios-ruby`.
- **CI home:** `tests_e2e_ios.yml` (debug + spm) only — not Jest / `tests_e2e_other.yml`.
- **Forbidden as the agent gate:** `ruby packages/app/__tests__/firebase_spm_test.rb` (or any single-suite / bare-ruby invocation). One-off debugging may use bare ruby locally; gate close / handoff evidence must cite the yarn target.
- First-time / Gemfile change: **`yarn ruby:install`** (or root `yarn`, which runs it via `postinstallDev`). Path via committed `.bundle/config`. When `bundle` is not on PATH, `yarn ruby:install` **skips with exit 0** (no setup-ruby required in lint/Jest/Android CI). CI uses `BUNDLE_FROZEN=true bundle install` **before** yarn in e2e/publish workflows; after yarn, `yarn ruby:install` is a no-op (`bundle check` succeeds). Do not `gem update cocoapods xcodeproj`.
- **Host Ruby floor:** `>= 3.3.1`. Ruby **3.3.0** cannot load lockfile `simplecov` **1.1.1** (`anonymous block parameter is also used within block`, CRuby [#20090](https://bugs.ruby-lang.org/issues/20090)). Do **not** downgrade simplecov to paper over it. With rbenv, pin a newer patch (e.g. `RBENV_VERSION=3.3.3`).
- Never `bundle install --gemfile=packages/app/__tests__/Gemfile`. That writes a gitignored vendor tree under `packages/app/__tests__/vendor/` and then `yarn lint:js` explodes. See [JS lint / Bundler vendor](#js-lint-bundler-vendor).
- Blocking when Ruby sources or `*_test.rb` touched: [validation checklist § iOS Ruby](validation-checklist.md#ios-ruby-unit-tests).

### `@react-native-community/template` (checked-in RN CLI `ios/`)

<a id="react-native-community-template-checked-in-rn-cli-ios"></a>

- **`@react-native-community/template` is not installed by root `yarn`.** It is not a `react-native` dependency, so a green install does **not** put the community template under `node_modules`.
- Seeding or refreshing a **checked-in** RN CLI `ios/` tree (fixture app under the monorepo) after yarn **cannot** assume that package exists.
- **Workaround:** one-shot pin `@react-native-community/template@<RN line>` on the fixture package, copy `ios/` + JS entry files from the template into the fixture, then **remove** the pin. Do not leave the template as a durable dependency.
- **Never** `react-native init` / `npx @react-native-community/cli init` / `npx react-native init` — not on the agent allowlist (see [Forbidden](#forbidden-always)).

### TurboModule codegen

<a id="turbomodule-codegen"></a>

- **`cd packages/<pkg> && yarn ios:codegen`** (or `yarn android:codegen`) often fails with **`unknown command 'codegen'`** after a clean `yarn` — `@react-native-community/cli` resolves from the **test app** workspace.
- Package scripts **wipe then regen** the configured `--outputPath` ([NewArch-AD-22](../new-architecture/architecture-decisions.md#newarch-ad-22--codegen-is-wipe-then-regen-on-the-configured-outputpath--accepted)). Prefer those yarn scripts when CLI resolution works.
- **Canonical (mobile toolchain from `tests/`):** use each package's `yarn android:codegen` / `yarn ios:codegen` script, which delegates to [`scripts/codegen-package.mjs`](../../scripts/codegen-package.mjs). The shared runner wipes the configured output path and invokes the pinned mobile CLI from `tests/`; do not run the CLI manually. RN 0.86 emits `ResultT` natively, so the former inject script is retired ([NewArch-AD-21](../new-architecture/architecture-decisions.md#newarch-ad-21--interim-ios-resultt-alias-without-full-codegen-regen--accepted)).
- **CI / library packages:** `yarn codegen:verify`. Library vs test-app codegen (committed trees, `includesGeneratedCode`, git-diff guard, test-app dump gitignore): [NewArch-AD-5](../new-architecture/architecture-decisions.md#newarch-ad-5--commit-generated-code--accepted). Test-app iOS CLI `--outputPath` is `ios` (project base); wipe is `ios/build/generated/ios` plus `tests/ios/Package.swift` and sibling app dumps.
- After **library** regen: commit the generated trees named in NewArch-AD-5, then `:build` + Metro reset-cache before `:test-cover`.

### fmt / Apple Clang 21 (unpatched React Native)

- Unpatched RN **0.78** ships fmt **11.0.2**. On Xcode 26 / Apple Clang 21 that fails consteval builds.
- **Canonical fix (macOS 0.78):** root `yarn` applying `tests-macos/patches/react-native+0.78.3.patch` → fmt **12.1.0**. Mobile **0.86.2** already ships fmt **12.1.0**. See [install / patch / fmt gate](#install-patch-fmt-gate-blocking).
- **Trap:** yarn exit **0** does **not** prove a macOS patch landed. If Nx cache-skips `react-native-firebase-tests-macos:prepare` (`patch-package`), fmt stays at **11.0.2**. Durable policy: [MonoTool-AD-12](../monorepo-tooling/architecture-decisions.md#monotool-ad-12--never-nx-cache-prepare-when-the-script-is-patch-package--accepted). **Always** run the fmt `rg` verification before native `:build`.
- **Never** invent Podfile `post_install` fmt hacks, `FMT_USE_CONSTEVAL`, `base.h` patches, or c++17-for-fmt-only as a substitute for a missed install/patch.

## Command constraints

<a id="command-constraints"></a>

```text
RNFB agent command policy: okf-bundle/testing/agent-command-policy.md ONLY.
E2e: okf-bundle/testing/running-e2e.md yarn tests:* ONLY.
Expo documented-path iOS link (not Detox): yarn test-expo:ios:link ONLY — never ad-hoc expo prebuild / xcodebuild / cd test-expo.
Never react-native init / npx @react-native-community/cli init — @react-native-community/template is not installed by root yarn; one-shot pin + copy ios/ + JS, then remove pin — #react-native-community-template-checked-in-rn-cli-ios.
Never: yarn workspace prepare, yarn jet, npx jet, cd packages/* && yarn prepare/build for diagnostics.
Never invent format/install: yarn google-java-format, bare/npx google-java-format, npm install, yarn install in tests/ alone — use root yarn first; Java format = yarn lint:android ONLY.
Never invent Android Gradle: ad-hoc ./gradlew outside yarn tests:android:unit / :build / :post-e2e-coverage / :test:jacoco-report; bare detox/jet/metro.
Prepare/install: yarn or yarn lerna:prepare must exit 0 before ANY other command — never parallelize with e2e/Metro/build.
Before native :build: root yarn exit 0 + verify tests/node_modules/react-native/third-party-podspecs/fmt.podspec (and tests-macos copy when building macOS) ≥ 12.1.0 — okf-bundle/testing/agent-command-policy.md#install-patch-fmt-gate-blocking. Before iOS build on a clean checkout: root yarn, then yarn tests:ios:pod:install exit 0. If fmt < 12.1.0: STOP and re-run yarn; never invent Podfile/FMT_USE_CONSTEVAL/c++17 fmt hacks.
Area harness: okf-bundle/testing/running-e2e.md#local-harness-overrides-harnessoverridesjs — copy harness.overrides.example.js to gitignored harness.overrides.js; set modules + RNFBDebug; delete overrides after run.
TurboModule contract test (NewArch-AD-17.1): packages/app/__tests__/nativeModuleContract.test.ts — yarn tests:jest -- packages/app/__tests__/nativeModuleContract.test.ts
Android JVM unit (AndroidTest-AD-1, JUnit-first; omit @Config/sdk unless proven): yarn tests:android:unit — not a substitute for platform e2e.
iOS Ruby (SPM helpers): yarn tests:ios:ruby — never ad-hoc ruby packages/app/__tests__/…_test.rb as the gate. Never bundle install --gemfile=packages/app/__tests__/Gemfile. Host Ruby >= 3.3.1 (not 3.3.0); do not downgrade simplecov.
JS lint vendor flood under packages/app/__tests__/vendor/: local Bundler tree, not product lint. Never invent delete-vendor as the lint gate. See #js-lint-bundler-vendor.
On failure: fix product code (or re-run yarn for patch miss), re-run the same canonical command.
Gate close / push: return [validation evidence package](validation-checklist.md#validation-evidence-package) and [coverage evidence package](coverage-design.md#coverage-evidence-package) when lib/native/Ruby helpers touched — required before commit or publication ([change authoring § validation evidence](change-authoring-workflow.md#validation-evidence-blocking)).
```

## Related docs

| Topic                                         | Owner                                                                                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| E2e commands, pre-flight, tiers               | [running-e2e.md](running-e2e.md)                                                                                                                    |
| Expo documented-path iOS **link** (not Detox) | This file — registry row `yarn test-expo:ios:link`; app index [packages/app](../packages/app/index.md)                                               |
| Install / patch / fmt / iOS Pods before `:build` | [§ install / patch / fmt gate](#install-patch-fmt-gate-blocking)                                                                                 |
| Test-app RN / CLI pins (`react-native-macos`) | [test-app-dependency-pins.md](test-app-dependency-pins.md)                                                                                          |
| Validation sequence                           | [validation-checklist.md](validation-checklist.md)                                                                                                  |
| Android JVM unit ADR                          | [AndroidTest-AD-1](android-architecture-decisions.md#androidtest-ad-1)                                                                              |
| iOS XCTest unit ADR                           | [IosTest-AD-1](ios-architecture-decisions.md#iostest-ad-1)                                                                                          |
| iOS Ruby unit / SimpleCov                     | [coverage design § iOS Ruby](coverage-design.md#ios-ruby-simplecov); [validation checklist § iOS Ruby](validation-checklist.md#ios-ruby-unit-tests) |
| JS lint vs local Bundler vendor               | [§ JS lint / Bundler vendor](#js-lint-bundler-vendor)                                                                                              |
| Work types and gates                          | [change-authoring-workflow.md](change-authoring-workflow.md)                                                                                        |
| Doc / commit policy                           | [documentation-policy.md](../documentation-policy.md)                                                                                               |
