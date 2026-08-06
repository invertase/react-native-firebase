# Firestore rules and indexes (cloud + emulator)

Configuration lives in this directory. **Emulator and cloud deploy use different Firebase config files** because the local Firestore emulator does not support the multi-database `firebase.json` array format ([firebase-tools#9742](https://github.com/firebase/firebase-tools/issues/9742)): it ignores rules and defaults to allowing all reads/writes.

| File | Purpose |
|------|---------|
| `firebase.json` | **Emulator + CI** — single-database `(default)` Firestore config |
| `firebase.deploy.json` | **Cloud deploy only** — multi-database `(default)` + `pipelines-e2e` |

## Databases

| Database | Rules file | Indexes file | Used by |
|----------|------------|--------------|---------|
| `(default)` | `firestore.rules` | `firestore.indexes.json` | Standard Firestore e2e (emulator + cloud) |
| `pipelines-e2e` | `firestore.pipelines-e2e.rules` | `firestore.pipelines-e2e.indexes.json` | `Pipeline.e2e.js` (Enterprise cloud only) |

`firebase.deploy.json` uses the **multi-database array** format:

```json
"firestore": [
  { "database": "(default)", "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
  { "database": "pipelines-e2e", "rules": "firestore.pipelines-e2e.rules", "indexes": "firestore.pipelines-e2e.indexes.json" }
]
```

`firebase.json` keeps the **legacy single-object** format required by the emulator:

```json
"firestore": {
  "rules": "firestore.rules",
  "indexes": "firestore.indexes.json"
}
```

## Pull current cloud state

```bash
cd .github/workflows/scripts
./sync-firestore-indexes.sh
```

Or manually:

```bash
firebase firestore:indexes --project react-native-firebase-testing --database "(default)" > firestore.indexes.json
firebase firestore:indexes --project react-native-firebase-testing --database pipelines-e2e > firestore.pipelines-e2e.indexes.json
```

There is no `firebase firestore:rules` pull command; edit the `.rules` files in-repo and deploy.


## Index deploy verify cycle

Canonical workflow (CLI ≥ 15.17.0 for search indexes): sync → edit JSON → `./deploy-firestore.sh` (runs `verify-firestore-indexes.sh`) → sync again → confirm cloud pull matches intent. Full policy and tooling surfaces: [okf-bundle Firebase testing project doc](../../../okf-bundle/testing/firebase-testing-project.md#index-change-workflow-sync--edit--deploy--verify).

## Deploy to cloud

```bash
cd .github/workflows/scripts
./deploy-firestore.sh
```

Uses `firebase deploy --only firestore --config firebase.deploy.json` (not `firestore:indexes` / `firestore:rules` sub-targets — those can silently no-op with multi-database config).

**Vector indexes** belong in `firestore.pipelines-e2e.indexes.json` under `vectorConfig`, not in security rules.

## pipelines-e2e notes

- Enterprise database on project `react-native-firebase-testing` (location `eur3`).
- Pipeline Detox tests do **not** call `connectFirestoreEmulator` for this database — they hit cloud.
- `firestore.pipelines-e2e.rules` is intentionally permissive for shared CI/local testing.

Full context: [okf-bundle Firebase testing project doc](../../../okf-bundle/testing/firebase-testing-project.md).
