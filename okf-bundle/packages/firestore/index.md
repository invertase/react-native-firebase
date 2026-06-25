# @react-native-firebase/firestore

Firestore Pipelines (`pipelines` entry) and native bridge behavior.

**Policy:** [OKF documentation and commit policy](../../documentation-policy.md).

## Documents

* [Coverage work queue](pipeline-coverage-work-queue.md) — ephemeral live tracker
* [Implementation workflow](pipeline-implementation-workflow.md) — compare-types gap → baseline → implement → review → docs → commit
* [Serialization testing](serialization-testing.md) — required Jest/e2e checks per expression export
* [Platform parity](pipeline-platform-parity.md) — drift registry, remediation, iOS unsupported map
* [SDK support audit](pipeline-sdk-support-audit.md) — guard reconciliation, runtime verification
* [Implementation design](pipelines.md) — architecture, serialization, coercion, e2e coverage, emulator setup

## Related repository files

* [`packages/firestore/lib/pipelines/`](../../../packages/firestore/lib/pipelines/) — TS builders/helpers
* [`packages/firestore/e2e/Pipeline.e2e.js`](../../../packages/firestore/e2e/Pipeline.e2e.js) — cross-platform e2e; primary native coverage driver
* [`packages/firestore/ios/RNFBFirestore/RNFBFirestorePipelineNodeBuilder.swift`](../../../packages/firestore/ios/RNFBFirestore/RNFBFirestorePipelineNodeBuilder.swift) — iOS expression coercion/bridge
* [`firestore.pipelines-e2e.rules`](../../../.github/workflows/scripts/firestore.pipelines-e2e.rules) — cloud rules for `pipelines-e2e`; not emulator
* [`firestore.pipelines-e2e.indexes.json`](../../../.github/workflows/scripts/firestore.pipelines-e2e.indexes.json) — cloud indexes incl. vector
* [`sync-firestore-indexes.sh`](../../../.github/workflows/scripts/sync-firestore-indexes.sh) — pull cloud indexes
* [`deploy-firestore.sh`](../../../.github/workflows/scripts/deploy-firestore.sh) — deploy rules/indexes
* [Firebase testing project](../../../okf-bundle/testing/firebase-testing-project.md) — cloud/emulator map
* [Firestore scripts README](../../../.github/workflows/scripts/README-firestore.md) — operator cheat sheet
