# Firestore rules and indexes (cloud + emulator)

Configuration lives in this directory (`firebase.json` points here). The Firebase emulator started by `yarn tests:emulator:start` uses these same files for **`(default)`** only.

## Databases

| Database | Rules file | Indexes file | Used by |
|----------|------------|--------------|---------|
| `(default)` | `firestore.rules` | `firestore.indexes.json` | Standard Firestore e2e (emulator + cloud) |
| `pipelines-e2e` | `firestore.pipelines-e2e.rules` | `firestore.pipelines-e2e.indexes.json` | `Pipeline.e2e.js` (Enterprise cloud only) |

`firebase.json` uses the **multi-database array** format:

```json
"firestore": [
  { "database": "(default)", "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
  { "database": "pipelines-e2e", "rules": "firestore.pipelines-e2e.rules", "indexes": "firestore.pipelines-e2e.indexes.json" }
]
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

## Deploy to cloud

```bash
cd .github/workflows/scripts
./deploy-firestore.sh
```

Uses `firebase deploy --only firestore` (not `firestore:indexes` / `firestore:rules` sub-targets — those can silently no-op with multi-database config).

**Vector indexes** belong in `firestore.pipelines-e2e.indexes.json` under `vectorConfig`, not in security rules.

## pipelines-e2e notes

- Enterprise database on project `react-native-firebase-testing` (location `eur3`).
- Pipeline Detox tests do **not** call `connectFirestoreEmulator` for this database — they hit cloud.
- `firestore.pipelines-e2e.rules` is intentionally permissive for shared CI/local testing.

Full context: [okf-bundle Firebase testing project doc](../../../okf-bundle/testing/firebase-testing-project.md).
