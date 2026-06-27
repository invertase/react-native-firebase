---
type: Reference
title: Other platform Firestore — Lite SDK
description: Platform backend split and lite-unsupported API list for macOS/Other vs native iOS/Android Firestore.
tags: [firestore, macos, other, lite, web]
timestamp: 2026-06-27T00:00:00Z
---

# Other platform Firestore — Lite SDK

Product and web-bridge rules for **macOS / Other** Firestore. User-facing summary: [`docs/platforms.mdx`](../../../docs/platforms.mdx) § Firestore.

**Policy:** [OKF documentation and commit policy](../../documentation-policy.md). **Current namespace-removal status:** [work queue](../../namespace-api-removal-work-queue.md) (ephemeral gates only there).

## Platform split

| Context | Backend | JS entry |
|---------|---------|----------|
| **iOS / Android** | Native Firebase Firestore SDK | `FirebaseFirestoreModule` → native modules |
| **macOS / Other** | **firebase-js-sdk Firestore Lite only** | `packages/app/lib/internal/web/firebaseFirestore.ts` → `firebase/firestore/lite` |

`isOther` = `Platform.OS !== 'ios' && Platform.OS !== 'android'`.

Pipelines on Other use **`firebase/firestore/lite/pipelines`** (side-effect import in the same shared module file) — not full `firebase/firestore`.

**There is no full `firebase/firestore` product surface on Other/macOS.** Do not import or wire full Firestore SDK paths into the web bridge for bundle, named-query, offline, or listener APIs.

## Unsupported on Other (lite limitation)

Web bridge methods must **reject** with `Not supported in the lite SDK.` (matching long-standing behavior on `main`):

- `loadBundle` / modular `loadBundle()`
- `namedQuery` and named-query collection paths
- Offline & persistence helpers: `clearPersistence`, `clearIndexedDbPersistence`, `disableNetwork`, `enableNetwork`, `waitForPendingWrites` (where lite has no equivalent)
- `onSnapshot` on collection/document references
- `GetOptions.source` / cache-only reads where lite cannot serve them
- `addSnapshotsInSync` / `removeSnapshotsInSync`

If an API is a lite limitation, it is **unsupported on Other** — not implemented by pulling in full `firebase/firestore`.

## Supported on Other

Modular public APIs that Firestore Lite provides must work on Other, including: `getFirestore`, `doc`, `collection`, `getDoc`, `getDocs`, `setDoc`, `updateDoc`, `deleteDoc`, `writeBatch`, `runTransaction`, query constraints (`where`, `or`, `and`, …), aggregates (`getCountFromServer`, …), `connectFirestoreEmulator`, `terminate`, statics (`Bytes`, `FieldPath`, `FieldValue`, `Timestamp`, …), `setLogLevel`, and pipelines (`pipeline()` on lite instances).

## Web bridge files

| File | Role |
|------|------|
| `packages/app/lib/internal/web/firebaseFirestore.ts` | Lite (+ lite pipelines import) only |
| `packages/firestore/lib/web/RNFBFirestoreModule.ts` | Lite instance cache; stub unsupported methods |
| `packages/firestore/lib/web/pipelines/` | Pipeline execute via JS SDK on Other |

**Do not add** a parallel full-SDK module (e.g. `firebaseFirestoreBundle.ts`) or import `firebase/firestore` into the Other bridge.

## E2e (Other vs native)

| Platform | Expectation |
|----------|-------------|
| **macOS / Other** | Lite-supported specs must pass. Lite-unsupported specs: `Platform.other` skip **or** assert message contains `Not supported in the lite SDK` (see `packages/firestore/e2e/firestore.e2e.js`). Do not expect native iOS/Android error codes on Other. |
| **iOS / Android** | Native SDK — bundle, named-query, persistence, and listener specs apply. |

Commands, pre-flight, harness narrowing, and validation tiers: [running e2e](../../testing/running-e2e.md) and [namespace API removal workflow](../../namespace-api-removal-workflow.md) § module area harness — not restated here.

## Related

- [Pipeline platform parity](pipeline-platform-parity.md) — pipeline-specific macOS-js drift (separate from core Firestore lite policy)
- [Namespace API removal workflow](../../namespace-api-removal-workflow.md) — per-module removal checklist and gotchas
