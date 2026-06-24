# @react-native-firebase/firestore

Knowledge for Firestore Pipelines (modular `pipelines` entry) and native bridge behaviour.

## Documents

* [Pipeline implementation workflow](pipeline-implementation-workflow.md) — compare-types gap analysis, baseline/review coverage, subagent implement/review, commit (start here for each export)
* [Serialization testing](serialization-testing.md) — required Jest/e2e serialization checks per expression export
* [Pipelines implementation design](pipelines.md) — architecture, JS→native serialization, integer/boolean coercion, e2e coverage strategy, emulator setup

## Related repository files

* [`packages/firestore/lib/pipelines/`](../../../packages/firestore/lib/pipelines/) — TypeScript pipeline builders and expression helpers
* [`packages/firestore/e2e/Pipeline.e2e.js`](../../../packages/firestore/e2e/Pipeline.e2e.js) — cross-platform pipeline e2e (primary native coverage driver)
* [`packages/firestore/ios/RNFBFirestore/RNFBFirestorePipelineNodeBuilder.swift`](../../../packages/firestore/ios/RNFBFirestore/RNFBFirestorePipelineNodeBuilder.swift) — iOS expression coercion and bridge construction
* [`firestore.pipelines-e2e.rules`](../../../.github/workflows/scripts/firestore.pipelines-e2e.rules) — cloud security rules for `pipelines-e2e` (permissive; not loaded by emulator)
* [`firestore.pipelines-e2e.indexes.json`](../../../.github/workflows/scripts/firestore.pipelines-e2e.indexes.json) — cloud indexes for pipeline e2e (incl. vector)
* [`sync-firestore-indexes.sh`](../../../.github/workflows/scripts/sync-firestore-indexes.sh) — pull cloud indexes into repo
* [`deploy-firestore.sh`](../../../.github/workflows/scripts/deploy-firestore.sh) — deploy rules + indexes to `react-native-firebase-testing`
* [Firebase testing project and emulator setup](../../../okf-bundle/testing/firebase-testing-project.md) — full cloud vs emulator map
* [Firestore scripts README](../../../.github/workflows/scripts/README-firestore.md) — operator cheat sheet
