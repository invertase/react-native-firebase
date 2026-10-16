---
type: Reference
title: Documentation site maintenance
description: Canonical maintenance for docs.page (docs.json) and TypeDoc (reference.rnfirebase.io), including legacy redirect audits and the docs.page link check in CI.
tags: [okf, documentation, typedoc, docs-page, redirects]
timestamp: 2026-07-02T00:00:00Z
---

# Documentation site maintenance

Single source for **user-facing documentation site** maintenance: [docs.page](https://docs.page) content under `docs/` plus `docs.json`, and the TypeDoc reference site at [reference.rnfirebase.io](https://reference.rnfirebase.io).

**Policy:** [OKF documentation and commit policy](documentation-policy.md).

## Two sites, two configs

| Site | Config | Output / host |
|------|--------|---------------|
| User docs (rnfirebase.io) | `docs.json` + `docs/**` | docs.page |
| API reference | `typedoc.json` (+ per-package `packages/*/typedoc.json`) | `yarn reference:api` → `reference/`; published at reference.rnfirebase.io |

## Legacy reference redirects

Pre–docs.page API pages lived under `/reference/...` on the old Gatsby site (`website/public/reference/**`). `docs.json` **`redirects`** maps those paths to the current TypeDoc URLs so bookmarks and external links keep working.

Redirect keys are **path-only** (no leading slash), e.g. `reference/auth/user`.

### TypeDoc URL patterns (structure router)

When mapping or auditing redirects, generated paths follow these patterns (base: `https://reference.rnfirebase.io/`):

| Kind | Pattern |
|------|---------|
| Module index | `_react-native-firebase/{package}.html` |
| Auth types | `_react-native-firebase/auth/FirebaseAuthTypes/{Type}.html` |
| Auth functions | `_react-native-firebase/auth/{functionName}.html` |
| Package types namespace | `_react-native-firebase/{package}/types/{package}/{Type}.html` |
| Firestore modular exports | `_react-native-firebase/firestore/modular/{Export}.html` |
| Storage types | `_react-native-firebase/storage/{Type}.html` |
| Module listing | `modules.html` |

Names are **PascalCase** and may differ from legacy lowercase paths (e.g. `oidcprovider` → `OAuthProvider`, `settings` → `FirestoreSettings`, `reference` → `StorageReference` / `DatabaseReference`).

Removed packages (e.g. Dynamic Links) have no TypeDoc module — fall back to `modules.html` or the closest surviving type.

## Redirect audit (required when TypeDoc config changes)

**Trigger:** any edit to `typedoc.json`, `packages/*/typedoc.json`, or TypeDoc-related scripts/options that can change reference **URL structure** — including:

- `router`, `entryPoints`, `entryPointStrategy`, `out`
- `navigation`, `categorizeByGroup`, `sortEntryPoints`, `groupOrder`
- package renames, module removal, or export surface moves that change generated page paths

**Not required** for JSDoc-only edits that do not change TypeDoc options or exported symbols.

### Audit steps

1. **Regenerate locally:** `yarn reference:api` (after `yarn tsc:compile:consumer` if needed).
2. **Verify existing redirects:** every target URL in `docs.json` → `redirects` must return HTTP 200 on the published site (or on local `reference/` output if pre-deploy). Fix broken mappings before merge.
3. **Scan for new orphans:** compare legacy paths under `website/public/reference/**` (or inbound `/reference/...` links in the repo) against current `redirects` keys. Add entries for any legacy path not yet covered.
4. **Spot-check renames:** module/type renames often change TypeDoc filenames — update redirect values, not only keys.
5. **Document durable renames** in this file or package OKF docs when non-obvious (e.g. analytics refund event type renamed to `RefundEventParameters`).

### Handoff checklist (redirect-affecting TypeDoc changes)

- [ ] `yarn reference:api` succeeds
- [ ] All `docs.json` redirect targets verified (200)
- [ ] New legacy paths identified and redirected or explicitly deferred with rationale
- [ ] Markdown/spellcheck/link check when `docs/**` changed — [validation checklist § lint and formatting](testing/validation-checklist.md#lint-and-formatting) (`yarn lint:markdown` / `yarn lint:spellcheck` / `yarn lint:docs-links` glob `docs/**` only; OKF-only diffs do not run those). **Missing `lint:docs-links` evidence when `docs/**` was touched is serious** ([change authoring § work types](testing/change-authoring-workflow.md#work-types))

**Validation commands:** [validation checklist § API reference](testing/validation-checklist.md#api-reference-and-type-parity), [§ lint and formatting](testing/validation-checklist.md#lint-and-formatting).

## Docs.page link check (CI)

<a id="docs-page-link-check-ci"></a>

`yarn lint:docs-links` runs `@docs.page/cli` `check` (pinned in root `package.json`, **≥ 2.2.0** for per-host severity overrides) and is a step in `.github/workflows/docs.yml`, wrapped in `nick-fields/retry` to absorb transient external failures (5xx, timeouts); a real breakage fails every attempt. The yarn script is `docs check .` — CLI defaults plus the `docs.json` `check` block; no severity flags on the command line. Fresh CLI publishes younger than the repo `npmMinimalAgeGate` (7d) must be listed in `.yarnrc.yml` `npmPreapprovedPackages`.

**Severity:** external **404**, **5xx**, DNS, and timeout failures are **errors**. Bot-gated HTTP statuses (**401 / 403 / 405 / 429**) are **warnings** so CI stays green while still surfacing hosts that refuse automated clients (npmjs, Stack Overflow, and similar). Do **not** add `--external-links warn` or `--ignore-external-hosts` — that would hide TypeDoc rot on `reference.rnfirebase.io`.

**Host overrides:** `docs.json` `check.severityOverrideHosts` pins `rnfirebase.io` to **error**. Matching includes subdomains, so `reference.rnfirebase.io` is covered, and the override applies to every failure — bot-gate statuses included — so a rate-limited or broken TypeDoc link cannot downgrade to a warning. Do not add `warn` overrides for first-party hosts; add an `error` entry when another first-party host must never downgrade.

What agents must fix vs may leave: [validation checklist § docs.page link check](testing/validation-checklist.md#docs-page-link-check).

## docs.json edits (non-TypeDoc)

When adding user docs pages only (sidebar, tabs, content under `docs/`):

- Add sidebar entries in `docs.json` when new pages ship.
- Run markdown/spellcheck/link check per [validation checklist](testing/validation-checklist.md#lint-and-formatting): `yarn lint:markdown`, `yarn lint:spellcheck`, `yarn lint:docs-links`.
- Redirect audit **not** required unless `redirects` or TypeDoc config also changed.

## Colocated TypeDoc reminder

`typedoc.json` is parsed as **JSONC** by TypeDoc (comments and trailing commas allowed). A short comment at the top of that file points here — see [TypeDoc configuration options](#typedoc-configuration-comments).

## TypeDoc configuration comments

TypeDoc accepts configuration from several formats ([TypeDoc configuration docs](https://typedoc.org/documents/Options.Configuration.html)):

| Format | File names | Comments |
|--------|------------|----------|
| **JSONC (recommended here)** | `typedoc.json`, `typedoc.jsonc` | `//` and `/* */` — **`typedoc.json` is parsed as JSONC**, same as `tsconfig.json` |
| JavaScript | `typedoc.config.mjs`, `.cjs`, `.js` | Block comments + `@type` JSDoc on exports |
| Embedded | `package.json` / `tsconfig.json` → `typedocOptions` | Strict JSON only — no comments |

**Recommendation:** keep `typedoc.json` and add JSONC comments for maintainer warnings (redirect audit trigger). Use `typedoc.config.mjs` only if config logic must be programmatic.

**Note:** strict JSON validators (e.g. `python -m json.tool`) reject comments — use TypeDoc or editor JSONC support to validate config, not generic JSON parsers.
