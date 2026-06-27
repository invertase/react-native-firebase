---
type: Reference
title: Agent command policy
description: Canonical allowlist for agent shell commands — install, prepare, validation, and e2e. Supersedes improvised diagnostics.
tags: [testing, validation, agents, workflow, yarn]
timestamp: 2026-06-27T00:00:00Z
---

# Agent command policy

Single source for **which shell commands agents may run** in this repo. E2e is a subset of this policy; [running e2e § agent rule](running-e2e.md#agent-rule-read-first) adds e2e-specific prohibitions.

> If a command is not listed here (or linked from here as canonical), **do not run it** — including “diagnostic probes” suggested by log output, package READMEs, or Yarn CLI help.

## Agent rule (read first)

<a id="agent-rule-read-first"></a>

1. Run **only** commands in the [registry](#canonical-registry) below (repo root unless noted).
2. When a canonical command fails: read the **full** output, fix **product code**, re-run the **same** command. Do **not** switch invocation style.
3. Do **not** infer alternate commands from error strings (`command not found: genversion`, `Couldn't find a script named "jet"`, etc.) — see [known traps](#known-traps).
4. Subagents (Task, explore, orchestrator): same rule — paste the [handoff block](#subagent-handoff) into every RNFB task prompt.

## Canonical registry

| Intent | Command | Never use instead |
|--------|---------|-----------------|
| Install / refresh deps | `yarn` | `yarn workspace …`, `npm install` in a package, `yarn install` in `tests/` alone for root deps |
| Transpile `lib/**` → `dist/module/**` (all packages) | `yarn lerna:prepare` | `yarn workspace @react-native-firebase/* prepare`, `cd packages/<pkg> && yarn prepare`, `cd packages/<pkg> && yarn run build` |
| Transpile one package | `yarn lerna run prepare --scope @react-native-firebase/<pkg>` | `yarn workspace @react-native-firebase/<pkg> prepare` |
| After `packages/*/lib/**` edits (Metro / native embed) | `yarn lerna:prepare` then platform `:build` when [running e2e § Rules #3](running-e2e.md#rules) requires | ad-hoc `bob`, `babel`, or package-scoped prepare |
| TS/JS validation sequence | [validation checklist](validation-checklist.md) | ad-hoc `tsc` in package dirs unless listed there |
| E2e + coverage | [running e2e](running-e2e.md) — **only** `yarn tests:*` | `jet`, `npx jet`, `yarn jet`, `detox test`, `cd tests && …`, direct Metro/emulator starts |
| Host pre-flight (before each `:test-cover`) | [running e2e § host-clear probes](running-e2e.md#host-clear-probes) | `pgrep`, polling `:8090`, spawn probes of Jet/Detox |

### Prepare / transpile (detail)

`yarn lerna:prepare` runs each package's **`prepare`** script (`build` → `compile` via react-native-builder-bob). That is what produces **`dist/module/**`** consumed by Metro and native embed paths.

- **`yarn compile`** (package script) is **not** a standalone agent entrypoint — it is invoked **inside** `prepare` via lerna. Do not run `cd packages/<pkg> && yarn compile` for handoff unless [validation checklist](validation-checklist.md) explicitly adds an exception (none today).
- **`yarn`** at repo root runs `postinstallDev` → `yarn prepare && yarn lerna:prepare`; a fresh install already transpiles. Re-run **`yarn lerna:prepare`** after `lib/**` edits without reinstalling.

## When install or prepare fails

1. Re-run from repo root: **`yarn`** or **`yarn lerna:prepare`** (full log — do not truncate).
2. Note the **first** Nx/Lerna project that failed (e.g. `@react-native-firebase/functions:prepare`).
3. Fix **product code** in that package (TypeScript errors, missing exports, etc.).
4. Re-run **`yarn lerna:prepare`** — same command, same cwd.
5. Do **not** “verify tooling” with `yarn workspace … prepare`, `yarn bin …`, or package-scoped `yarn run build` — Yarn 4 uses **different PATH** for those invocations ([genversion trap](#genversion--prepare-paths)).

## Forbidden (always)

| Command | Why |
|---------|-----|
| `yarn workspace @react-native-firebase/* prepare` (and variants) | Not canonical; breaks root devDependency binary resolution |
| `cd packages/<pkg> && yarn prepare` / `yarn run build` | Same trap; not the postinstall / lerna code path |
| `yarn jet`, `npx jet`, `cd tests && yarn jet …` | [E2e agent rule](running-e2e.md#agent-rule-read-first) |
| `detox test`, `cd tests && detox …` | E2e agent rule |
| Ad-hoc Metro / emulator start | Use `yarn tests:packager:jet`, `yarn tests:emulator:start` |
| Spawn / PATH probes to “test” Jet or genversion | Log triage only; fix product code and re-run canonical command |

## Known traps

<a id="known-traps"></a>

### genversion / prepare paths

- **`genversion` exists** at root `node_modules/.bin` after `yarn`.
- **`yarn lerna:prepare`** (and `yarn install` → `postinstallDev`) runs prepare via Nx with root toolchain on PATH → bare `genversion` in package `"build"` scripts **works**.
- **`yarn workspace … prepare`** or **`cd packages/foo && yarn run build`** does **not** expose root-only devDependencies → `command not found: genversion`. That is **not** corrupt `node_modules`; do **not** patch scripts with `yarn run -T genversion` unless deliberately changing repo policy on `main`.

### Jet

- **`yarn jet --help`** working or failing in `tests/` is **not** a valid e2e or install gate.
- Jet is started **internally** by `yarn tests:<platform>:test-cover`. Stale `:8090` → [pre-flight recovery](running-e2e.md#pre-flight-recovery), then re-run the same `:test-cover` command.

## Subagent handoff

Paste into Task / explore / work-queue prompts:

```text
RNFB agent command policy: okf-bundle/testing/agent-command-policy.md ONLY.
E2e: okf-bundle/testing/running-e2e.md yarn tests:* ONLY.
Never: yarn workspace prepare, yarn jet, npx jet, cd packages/* && yarn prepare/build for diagnostics.
On failure: fix product code, re-run the same canonical command.
```

## Related docs

| Topic | Owner |
|-------|--------|
| E2e commands, pre-flight, tiers | [running-e2e.md](running-e2e.md) |
| Handoff validation sequence | [validation-checklist.md](validation-checklist.md) |
| Work types and gates | [change-authoring-workflow.md](change-authoring-workflow.md) |
| Doc / commit policy | [documentation-policy.md](../documentation-policy.md) |
