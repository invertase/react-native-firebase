---
type: Reference
title: Agent command policy
description: Canonical allowlist for agent shell commands — install, prepare, validation, and e2e. Supersedes improvised diagnostics.
tags: [testing, validation, agents, workflow, yarn]
timestamp: 2026-07-26T00:00:00Z
---

# Agent command policy

Single source for **which shell commands agents may run** in this repo. E2e is a subset of this policy; [running e2e § agent rule](running-e2e.md#agent-rule-read-first) adds e2e-specific prohibitions.

> If a command is not listed here (or linked from here as canonical), **do not run it** — including “diagnostic probes” suggested by log output, package READMEs, or Yarn CLI help.

## Agent rule (read first)

<a id="agent-rule-read-first"></a>

1. Run **only** commands in the [registry](#canonical-registry) below (repo root unless noted).
2. **`yarn` / `yarn lerna:prepare` must finish before anything else** — see [prepare must finish first](#prepare-must-finish-first). Do not parallelize install/prepare with e2e, Metro, builds, or other shell commands.
3. **Before any native `:build`:** root `yarn` exit 0 **and** patched fmt **≥ 12.1.0** — [install / patch / fmt gate](#install-patch-fmt-gate-blocking). Do **not** invent Podfile/fmt workarounds.
4. When a canonical command fails: read the **full** output, fix **product code** (or re-run root `yarn` for a patch miss), re-run the **same** command. Do **not** switch invocation style.
5. Do **not** infer alternate commands from error strings (`command not found: genversion`, `Couldn't find a script named "jet"`, etc.) — see [known traps](#known-traps).
6. Subagents (Task, explore, orchestrator): same rule — paste the [handoff block](#subagent-handoff) into every RNFB task prompt.

## Canonical registry

| Intent                                                          | Command                                                                                                                                                                                                                                                                                    | Never use instead                                                                                                             |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Install / refresh deps                                          | `yarn` (repo root)                                                                                                                                                                                                                                                                         | `yarn workspace …`, `npm install`, `npm install` in a package, `yarn install` / `yarn` in `tests/` alone for root deps, skipping root `yarn` before e2e/build |
| Transpile `lib/**` → `dist/module/**` (all packages)            | `yarn lerna:prepare`                                                                                                                                                                                                                                                                       | `yarn workspace @react-native-firebase/* prepare`, `cd packages/<pkg> && yarn prepare`, `cd packages/<pkg> && yarn run build` |
| Transpile one package                                           | `yarn lerna run prepare --scope @react-native-firebase/<pkg>`                                                                                                                                                                                                                              | `yarn workspace @react-native-firebase/<pkg> prepare`                                                                         |
| After `packages/*/lib/**` edits (Metro serves `dist/module/**`) | `yarn lerna:prepare`; Metro restart when already running ([running e2e § prepare completion gate](running-e2e.md#prepare-completion-gate-blocking)) — platform `:build` only when [running e2e § Rules #3](running-e2e.md#rules) requires native/codegen/instrumentation, not for JS alone | ad-hoc `bob`, `babel`, or package-scoped prepare                                                                              |
| TS/JS validation sequence                                       | [validation checklist](validation-checklist.md)                                                                                                                                                                                                                                            | ad-hoc `tsc` in package dirs unless listed there                                                                              |
| JS lint (implementation / review gate)                          | `yarn lint:js`, `yarn lint:js --fix`                                                                                                                                                                                                                                                       | package-scoped `eslint`, `npx eslint`                                                                                         |
| Android Java format / lint                                      | `yarn lint:android`                                                                                                                                                                                                                                                                        | `yarn google-java-format`, bare `google-java-format`, `google-java-format -i`, `npx google-java-format`, any invented format script |
| Docs lint (when docs in diff)                                   | `yarn lint:markdown`, `yarn lint:spellcheck`                                                                                                                                                                                                                                               | ad-hoc prettier/eslint on single files                                                                                        |
| Android JVM unit tests                                          | `yarn tests:android:unit`                                                                                                                                                                                                                                                                  | ad-hoc `./gradlew …` outside this yarn script; bare Robolectric/JUnit IDE-only as the agent gate                              |
| iOS Ruby unit tests (SPM / CocoaPods helpers)                   | `yarn tests:ios:ruby` (after `bundle install --gemfile=packages/app/__tests__/Gemfile` when needed)                                                                                                                          | ad-hoc `ruby packages/app/__tests__/…_test.rb`, bare `ruby …/run_with_coverage.rb` without the yarn script as the agent gate |
| Android merged Jacoco (unit + e2e)                              | `yarn tests:android:post-e2e-coverage` (after e2e); `yarn tests:android:test:jacoco-report` when regenerating the merge report                                                                                            | `./gradlew jacocoAndroidTestReport` as Codecov path; inventing other jacoco yarn scripts                                      |
| E2e + coverage                                                  | [running e2e](running-e2e.md) — **only** `yarn tests:*`                                                                                                                                                                                                                                    | `jet`, `npx jet`, `yarn jet`, `detox test`, bare `detox`, `cd tests && …`, direct Metro/emulator starts                       |
| iOS Detox framework cache rebuild                               | `yarn tests:ios:detox-framework-cache:rebuild`                                                                                                                                                                                                                                             | `cd tests && yarn detox clean-framework-cache`, `cd tests && yarn detox build-framework-cache`, bare `detox …`                |
| Host pre-flight (before each `:test-cover`)                     | [running e2e § host-clear probes](running-e2e.md#host-clear-probes)                                                                                                                                                                                                                        | `pgrep`, polling `:8090`, spawn probes of Jet/Detox                                                                           |


### Prepare / transpile (detail)

`yarn lerna:prepare` runs each package's **`prepare`** script (`build` → `compile` via react-native-builder-bob). That is what produces **`dist/module/**`** consumed by Metro in debug e2e — only **release\*\* builds pre-bundle/embed JS ([running e2e § Rules #3](running-e2e.md#rules)).

- **`yarn compile`** (package script) is **not** a standalone agent entrypoint — it is invoked **inside** `prepare` via lerna. Do not run `cd packages/<pkg> && yarn compile` for handoff unless [validation checklist](validation-checklist.md) explicitly adds an exception (none today).
- **`yarn`** at repo root runs `postinstallDev` → `yarn prepare && yarn lerna:prepare`; a fresh install already transpiles. Re-run **`yarn lerna:prepare`** after `lib/**` edits without reinstalling.

<a id="prepare-must-finish-first"></a>

### Prepare must finish first (blocking)

**`yarn`**, **`yarn lerna:prepare`**, and **`yarn lerna run prepare --scope …`** are **blocking foreground** commands. Wait for the shell to return **exit code 0** before starting **any** other command — including in the same agent turn via parallel tool calls.

| Do not start until prepare exits 0        | Why                                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `yarn tests:*` (e2e, packager, build)     | Metro (debug JS) reads **`dist/module/**`**, not `lib/\*\*` — partial prepare → missing modules, stale bundles |
| `yarn tests:packager:jet-reset-cache`     | Reset after prepare, not during it                                                                             |
| `yarn tsc:compile`, Jest, `compare:types` | May read transpiled output or assume `dist/` is current                                                        |
| Another `yarn` / scoped prepare           | Overlapping Nx/Lerna runs race on `dist/`                                                                      |

**Agent rule:** one prepare invocation per message batch; wait for completion; then run the next step (Metro restart if needed → pre-flight → `:test-cover`). [Running e2e § prepare completion gate](running-e2e.md#prepare-completion-gate-blocking) is the e2e-side mirror of this rule.

**Symptoms when violated:** `Cannot find module '…/dist/module/…'`, Metro 500 on bundle, e2e failures before tests run, or green Metro `/status` while the app loads a half-written `dist/`.

<a id="install-patch-fmt-gate-blocking"></a>

### Install / patch / fmt gate (blocking before native `:build`)

**Canonical owner** for install + patch freshness before Detox native builds. E2e docs link here — do not restate this procedure elsewhere.

**Before any** `yarn tests:ios:build`, `yarn tests:android:build`, or other Detox native build path:

1. **Root `yarn` MUST have run and exited 0** in this checkout. Required on a fresh checkout, after deleting `node_modules`, after pulling patch changes, and whenever patches may be stale. Do **not** start native `:build` until that install finished successfully.
2. Root `yarn` applies **`.yarn/patches`** (jet, detox, mocha-remote) and workspace **`patch-package`** patches, including **`tests/patches/react-native+0.78.3.patch`** (bumps React Native's fmt pin to **12.1.0**). `tests` `prepare` is `patch-package` and must **not** be Nx-cache-skipped ([MonoTool-AD-12](../monorepo-tooling/architecture-decisions.md#monotool-ad-12--never-nx-cache-prepare-when-the-script-is-patch-package--accepted)).
3. **Verify** the patched React Native fmt podspec reports version **≥ 12.1.0** (Xcode 26 / Apple Clang 21-safe floor for this pin). **Yarn exit 0 alone is not sufficient** — always run the check below before native `:build` (a prepare cache-skip historically left fmt at **11.0.2** despite a green install):

```bash
rg 'spec\.version|:tag' tests/node_modules/react-native/third-party-podspecs/fmt.podspec
```

Expect `12.1.0` (or higher) on both `spec.version` and `:tag`.

4. If fmt is still **11.0.2** (or anything **< 12.1.0**): **STOP**. Re-run root `yarn` / fix patch application (including Nx `tests:prepare` cache policy — [MonoTool-AD-12](../monorepo-tooling/architecture-decisions.md#monotool-ad-12--never-nx-cache-prepare-when-the-script-is-patch-package--accepted)). Do **not** invent Podfile `post_install` fmt hacks, `FMT_USE_CONSTEVAL` / `base.h` patches, c++17-for-fmt-only, or web-search workarounds — the durable fix is the existing patch applied on install.

**Symptoms when violated:** Apple Clang 21 consteval errors compiling unpatched fmt **11.0.2**; agents inventing Podfile/fmt workarounds instead of re-running root `yarn` / fixing prepare cache policy.

## When install or prepare fails

1. Re-run from repo root: **`yarn`** or **`yarn lerna:prepare`** (full log — do not truncate).
2. Note the **first** Nx/Lerna project that failed (e.g. `@react-native-firebase/functions:prepare`).
3. Fix **product code** in that package (TypeScript errors, missing exports, etc.).
4. Re-run **`yarn lerna:prepare`** — same command, same cwd.
5. Do **not** “verify tooling” with `yarn workspace … prepare`, `yarn bin …`, or package-scoped `yarn run build` — Yarn 4 uses **different PATH** for those invocations ([genversion trap](#genversion--prepare-paths)).

## Forbidden (always)

| Command                                                          | Why                                                            |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| `yarn workspace @react-native-firebase/* prepare` (and variants) | Not canonical; breaks root devDependency binary resolution     |
| `cd packages/<pkg> && yarn prepare` / `yarn run build`           | Same trap; not the postinstall / lerna code path               |
| `yarn google-java-format`, bare `google-java-format`, `npx google-java-format`, `google-java-format -i` | Invented format entrypoints — **only** `yarn lint:android` |
| `npm install` (any cwd) / `yarn` / `yarn install` only in `tests/` for monorepo deps | Root `yarn` applies patches and workspace links; tests-only install is insufficient |
| Ad-hoc `./gradlew …` outside allowlisted yarn scripts (`tests:android:unit`, `tests:android:build`, `tests:android:post-e2e-coverage`, `tests:android:test:jacoco-report`, etc.) | Wrong task / cwd / report path; invents CI that does not match Codecov |
| Ad-hoc `ruby packages/app/__tests__/…_test.rb` (or bare runner) as the validation gate | Misses SimpleCov / suite discovery — **only** `yarn tests:ios:ruby` |
| `yarn jet`, `npx jet`, `cd tests && yarn jet …`                  | [E2e agent rule](running-e2e.md#agent-rule-read-first)         |
| `detox test`, bare `detox`, `cd tests && detox …`                | E2e agent rule                                                 |
| Ad-hoc Metro / emulator start                                    | Use `yarn tests:packager:jet`, `yarn tests:emulator:start`     |
| Spawn / PATH probes to “test” Jet or genversion                  | Log triage only; fix product code and re-run canonical command |

## Known traps

<a id="known-traps"></a>

### genversion / prepare paths

- **`genversion` exists** at root `node_modules/.bin` after `yarn`.
- **`yarn lerna:prepare`** (and `yarn install` → `postinstallDev`) runs prepare via Nx with root toolchain on PATH → bare `genversion` in package `"build"` scripts **works**.
- **`yarn workspace … prepare`** or **`cd packages/foo && yarn run build`** does **not** expose root-only devDependencies → `command not found: genversion`. That is **not** corrupt `node_modules`; do **not** patch scripts with `yarn run -T genversion` unless deliberately changing repo policy on `main`.

### Jet

- **`yarn jet --help`** working or failing in `tests/` is **not** a valid e2e or install gate.
- Jet is started **internally** by `yarn tests:<platform>:test-cover`. Stale `:8090` → [pre-flight recovery](running-e2e.md#pre-flight-recovery), then re-run the same `:test-cover` command.

### Android Java format

- There is **no** `yarn google-java-format` script. Invented `google-java-format` / `npx google-java-format` invocations are forbidden.
- **Canonical:** `yarn lint:android` (repo root) — wraps `google-java-format --set-exit-if-changed --replace` on `packages/*/android/src` and fails if the tree would change.

### Android build / unit / Jacoco

- **Do not** invent `cd tests && yarn install`, then bare `./gradlew` from an arbitrary cwd.
- Unit: **`yarn tests:android:unit`** only ([AndroidTest-AD-1](android-architecture-decisions.md#androidtest-ad-1--robolectric--mockito-for-android-jvm-unit-tests--accepted)).
- Merged coverage after e2e: **`yarn tests:android:post-e2e-coverage`** (Codecov path is `jacocoTestReport`, not e2e-only `jacocoAndroidTestReport`) — [coverage design](coverage-design.md).
- Optional explicit merge: **`yarn tests:android:test:jacoco-report`**.

### iOS Ruby (SPM helpers)

- **Canonical:** `yarn tests:ios:ruby` — discovers all `packages/app/__tests__/*_test.rb`, SimpleCov → `coverage/ios-ruby/lcov.info`, Codecov flag `ios-ruby`.
- **CI home:** `tests_e2e_ios.yml` (debug + spm) only — not Jest / `tests_e2e_other.yml`.
- **Forbidden as the agent gate:** `ruby packages/app/__tests__/firebase_spm_test.rb` (or any single-suite / bare-ruby invocation). One-off debugging may use bare ruby locally; gate close / handoff evidence must cite the yarn target.
- First-time / Gemfile change: `bundle install --gemfile=packages/app/__tests__/Gemfile` (path via committed `packages/app/__tests__/.bundle/config`). CI uses `BUNDLE_FROZEN=true` against the committed lockfile (+ checksums).
- Blocking when Ruby sources or `*_test.rb` touched: [validation checklist § iOS Ruby](validation-checklist.md#ios-ruby-unit-tests).

### TurboModule codegen

- **`cd packages/<pkg> && yarn ios:codegen`** (or `yarn android:codegen`) often fails with **`unknown command 'codegen'`** after a clean `yarn` — `@react-native-community/cli` resolves from the **test app** workspace.
- **Canonical:** [turbomodule workflow § Running codegen](../new-architecture/turbomodule-implementation-workflow.md#running-codegen-canonical) — `cd tests`, `npx @react-native-community/cli codegen --path ../packages/<pkg> …` with `--outputPath` copied from that package's `package.json` script.
- After regen: commit `android/.../generated` + `ios/generated`, then `:build` + Metro reset-cache before `:test-cover`.

### fmt / Apple Clang 21 (unpatched React Native)

- Unpatched RN ships fmt **11.0.2**. On Xcode 26 / Apple Clang 21 that fails consteval builds.
- **Canonical fix:** root `yarn` applying `tests/patches/react-native+0.78.3.patch` → fmt **12.1.0**. See [install / patch / fmt gate](#install-patch-fmt-gate-blocking).
- **Trap:** yarn exit **0** does **not** prove the patch landed. If Nx cache-skips `react-native-firebase-tests:prepare` (`patch-package`), fmt stays at **11.0.2**. Durable policy: [MonoTool-AD-12](../monorepo-tooling/architecture-decisions.md#monotool-ad-12--never-nx-cache-prepare-when-the-script-is-patch-package--accepted) (`tests` prepare `cache: false`). **Always** run the fmt `rg` verification before native `:build`.
- **Never** invent Podfile `post_install` fmt hacks, `FMT_USE_CONSTEVAL`, `base.h` patches, or c++17-for-fmt-only as a substitute for a missed install/patch.

## Subagent handoff

Paste into Task / explore / work-queue prompts:

```text
RNFB agent command policy: okf-bundle/testing/agent-command-policy.md ONLY.
E2e: okf-bundle/testing/running-e2e.md yarn tests:* ONLY.
Never: yarn workspace prepare, yarn jet, npx jet, cd packages/* && yarn prepare/build for diagnostics.
Never invent format/install: yarn google-java-format, bare/npx google-java-format, npm install, yarn install in tests/ alone — use root yarn first; Java format = yarn lint:android ONLY.
Never invent Android Gradle: ad-hoc ./gradlew outside yarn tests:android:unit / :build / :post-e2e-coverage / :test:jacoco-report; bare detox/jet/metro.
Prepare/install: yarn or yarn lerna:prepare must exit 0 before ANY other command — never parallelize with e2e/Metro/build.
Before native :build: root yarn exit 0 + verify tests/node_modules/react-native/third-party-podspecs/fmt.podspec ≥ 12.1.0 — okf-bundle/testing/agent-command-policy.md#install-patch-fmt-gate-blocking. If fmt < 12.1.0: STOP and re-run yarn; never invent Podfile/FMT_USE_CONSTEVAL/c++17 fmt hacks.
Area harness: okf-bundle/testing/running-e2e.md#local-harness-overrides-harnessoverridesjs — copy harness.overrides.example.js to gitignored harness.overrides.js; set modules + RNFBDebug; delete overrides after run.
TurboModule contract test (NewArch-AD-17.1): packages/app/__tests__/nativeModuleContract.test.ts — yarn tests:jest -- packages/app/__tests__/nativeModuleContract.test.ts
Android JVM unit (AndroidTest-AD-1): yarn tests:android:unit — not a substitute for platform e2e.
iOS Ruby (SPM helpers): yarn tests:ios:ruby — never ad-hoc ruby packages/app/__tests__/…_test.rb as the gate.
On failure: fix product code (or re-run yarn for patch miss), re-run the same canonical command.
Gate close / push: return [validation evidence package](validation-checklist.md#validation-evidence-package) and [coverage evidence package](coverage-design.md#coverage-evidence-package) when lib/native/Ruby helpers touched — required before commit or publication ([change authoring § validation evidence](change-authoring-workflow.md#validation-evidence-blocking)).
```

## Related docs

| Topic                           | Owner                                                        |
| ------------------------------- | ------------------------------------------------------------ |
| E2e commands, pre-flight, tiers | [running-e2e.md](running-e2e.md)                             |
| Install / patch / fmt before `:build` | [§ install / patch / fmt gate](#install-patch-fmt-gate-blocking) |
| Test-app RN / CLI pins (`react-native-macos`) | [test-app-dependency-pins.md](test-app-dependency-pins.md) |
| Handoff validation sequence     | [validation-checklist.md](validation-checklist.md)           |
| Android JVM unit ADR            | [android-architecture-decisions.md](android-architecture-decisions.md) |
| iOS Ruby unit / SimpleCov       | [coverage design § iOS Ruby](coverage-design.md#ios-ruby-simplecov); [validation checklist § iOS Ruby](validation-checklist.md#ios-ruby-unit-tests) |
| Work types and gates            | [change-authoring-workflow.md](change-authoring-workflow.md) |
| Doc / commit policy             | [documentation-policy.md](../documentation-policy.md)        |
