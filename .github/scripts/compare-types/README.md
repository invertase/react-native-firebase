# Type Comparison Script

Detects API drift between the [firebase-js-sdk](https://github.com/firebase/firebase-js-sdk) and the corresponding `@react-native-firebase/*` packages.

For each registered package it compares the **modular** public API exported by the firebase-js-sdk against the **modular** public API exported by the built RN Firebase package, then classifies every difference as one of:

| Category | Meaning |
|---|---|
| **Missing in RN Firebase** | Export exists in firebase-js-sdk but not in the RN package |
| **Extra in RN Firebase** | Export exists in the RN package but not in the firebase-js-sdk |
| **Different shape** | Same name, but the type signature or interface members differ |

Every difference must have an entry in the package's `config.ts` explaining why it exists. The script exits with code 1, failing CI, if either:

- A difference is **undocumented** — add it to `config.ts` with a reason, or fix the RN Firebase types to match.
- A config entry is **stale** — the API now matches the firebase-js-sdk, so the entry should be removed from `config.ts`.

## Prerequisites

The RN Firebase package(s) must be built before running the script, because the script reads from the compiled `dist/typescript/lib/` files:

```sh
yarn
```

## Running

From the repo root:

```sh
yarn compare:types
```

Or directly from this directory:

```sh
yarn install   # first time only
yarn compare
```

### Sample output

```
📦 remote-config

  Extra in RN Firebase (12):
  ~ ConfigValues  — RN Firebase-specific type alias ...
  ~ fetch         — Legacy fetch API, prefer fetchConfig ...
  ...

  Different shape (5):
  ~ getAll        — Returns ConfigValues instead of Record<string, Value> ...
     sdk: (RemoteConfig) => Record<string, Value>
     rn:  (RemoteConfig) => ConfigValues
  ...

  ✓ All 17 difference(s) are documented in config.ts
```

```
📦 storage

  Stale config entries (1):
  ✗ uploadString [STALE]  — now matches the firebase-js-sdk; remove from config.ts

  ✗ 1 stale config entry/entries — remove them from config.ts
```

`~` (yellow) = documented difference — CI passes.
`✗` (red) = undocumented difference or stale config entry — CI fails.

---

## How it works

```
src/
  index.ts      Entry point. Iterates packages, calls parse → compare → report.
  parse.ts      Uses ts-morph to read .d.ts files and extract typed export shapes
                without needing to resolve external imports (reads type text as-written).
  compare.ts    Diffs two export maps and classifies each difference.
                Cross-references against the package config to split documented
                from undocumented differences, and detects stale config entries
                whose APIs now match the SDK.
  report.ts     Formats results to the terminal with colour coding.
  registry.ts   Package registry. Add new packages here.
  types.ts      TypeScript types for the config schema and internal data structures.

packages/
  <package-name>/
    firebase-sdk.d.ts   Snapshot of the firebase-js-sdk public types for this package.
    config.ts           Documented known differences for this package.
```

### Type shapes

For each export, the parser extracts a normalised **shape**:

- **function** — ordered list of parameter types + return type (parameter names are ignored)
- **interface** — set of `{ name, type, optional }` member descriptors (order-independent)
- **typeAlias** — the raw type text (e.g. `'a' | 'b' | 'c'`)
- **variable** — the type text

Shapes are compared as normalised strings. Semantically equivalent types that are textually different (e.g. `Promise<null>` vs `Promise<void>`, `ConfigValues` vs `Record<string, Value>`) will be flagged — this is intentional, so the config forces an explicit acknowledgement of every divergence.

---

## Adding a new package

### 1. Get the firebase-js-sdk public types

Copy the public type declarations for the package from the firebase-js-sdk release into a new file:

```
packages/<package-name>/firebase-sdk.d.ts
```

The file should contain only the **modular** (tree-shakeable) public exports — interfaces, type aliases, and `declare function` declarations. Strip internal/private types.

> In the future this step will be automated: a CI job will clone the firebase-js-sdk, run `yarn && yarn build`, and extract the generated `.d.ts` files automatically.

### 2. Identify the RN Firebase modular files

Find the built modular type files for the RN Firebase package. They are usually at:

```
packages/<package-name>/dist/typescript/lib/types/[modular | PACKAGE_NAME].d.ts   ← type definitions
packages/<package-name>/dist/typescript/lib/[modular | PACKAGE_NAME].d.ts          ← function declarations
```

Check the package's `package.json` `types` field to confirm the dist location.

Also note any **support files** — files that are re-exported from the modular files and need to be in the ts-morph project for re-export resolution (e.g. `statics.d.ts`, `types/internal.d.ts`). Their exports are not compared directly.

### 3. Create the config file

Create `packages/<package-name>/config.ts` with a `PackageConfig` object:

```typescript
import type { PackageConfig } from '../../src/types';

const config: PackageConfig = {
  // Rename mapping: sdkName → rnName (when an export has been renamed)
  nameMapping: {
    // 'SomeType': 'RNSomeType',
  },

  // Exports present in firebase-sdk but intentionally absent from RN Firebase
  missingInRN: [
    {
      name: 'someWebOnlyFunction',
      reason: 'Uses the Web Crypto API which is not available in React Native.',
    },
  ],

  // Exports present in RN Firebase but not in firebase-sdk
  extraInRN: [
    {
      name: 'someNativeHelper',
      reason: 'RN-specific helper with no web equivalent.',
    },
  ],

  // Exports present in both but with different type signatures
  differentShape: [
    {
      name: 'someFunction',
      reason: 'Returns Promise<null> instead of Promise<void> because the native module resolves with null.',
    },
  ],
};

export default config;
```

Leave any section as an empty array (or omit it) if there are no differences in that category.

### 4. Register the package

Add an entry to [`src/registry.ts`](src/registry.ts):

```typescript
import newPackageConfig from '../packages/<package-name>/config';

// inside the packages array:
{
  name: '<package-name>',
  firebaseSdkTypesPaths: [
    path.join(SCRIPT_DIR, 'packages', '<package-name>', 'firebase-sdk.d.ts'),
  ],
  rnFirebaseModularFiles: [
    path.join(rnDist('<package-name>'), 'types', 'modular.d.ts'),
    path.join(rnDist('<package-name>'), 'modular.d.ts'),
  ],
  rnFirebaseSupportFiles: [
    // add any .d.ts files needed to resolve re-exports (not compared directly)
    path.join(rnDist('<package-name>'), 'statics.d.ts'),
  ],
  config: newPackageConfig,
},
```

### 5. Verify

Build the package and run the script. Any undocumented differences will be printed in red — add them to `config.ts` with a reason, or fix the RN Firebase types to match the SDK.

```sh
# from repo root
yarn
yarn compare:types
```

---

## Updating a package's firebase-sdk snapshot

When a new firebase-js-sdk version ships with type changes:

1. Copy the updated public types from `node_modules/@firebase/<package>/dist/index.d.ts` (or the equivalent built output) into `packages/<package-name>/firebase-sdk.d.ts`.
2. Run `yarn compare:types`.
3. Any newly introduced differences will be flagged as undocumented. Either:
   - Update the RN Firebase types to match, or
   - Add a new entry to `config.ts` explaining why the difference is intentional.
4. Any config entries that the SDK change has now made redundant will be flagged as **stale**. Remove them from `config.ts`.

## Resolving a known difference in RN Firebase

When the RN Firebase types are updated to match the firebase-js-sdk for a previously documented difference:

1. Update the RN Firebase types and rebuild the package.
2. Run `yarn compare:types`.
3. The resolved entry will be flagged as **stale** (`✗ [STALE]`). Remove it from `config.ts`.
