---
type: Reference
title: Documentation site maintenance
description: Canonical maintenance for docs.page (docs.json) and TypeDoc (reference.rnfirebase.io), including legacy redirect audits.
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
- [ ] `yarn lint:markdown` / `yarn lint:spellcheck` if `docs/**` or OKF changed

**Validation commands:** [validation checklist § API reference](testing/validation-checklist.md#api-reference-and-type-parity), [§ lint and formatting](testing/validation-checklist.md#lint-and-formatting).

## docs.json edits (non-TypeDoc)

When adding user docs pages only (sidebar, tabs, content under `docs/`):

- Add sidebar entries in `docs.json` when new pages ship.
- Run markdown/spellcheck per [validation checklist](testing/validation-checklist.md#lint-and-formatting).
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
