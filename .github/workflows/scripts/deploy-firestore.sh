#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# shellcheck source=firebase-cli.sh
source "$SCRIPT_DIR/firebase-cli.sh"

PROJECT="${FIREBASE_PROJECT:-react-native-firebase-testing}"

echo "Deploying Firestore rules and indexes to project: ${PROJECT}"
echo "  (default)        -> firestore.rules + firestore.indexes.json"
echo "  pipelines-e2e    -> firestore.pipelines-e2e.rules + firestore.pipelines-e2e.indexes.json"
echo ""
echo "Tip: run ./sync-firestore-indexes.sh first if cloud may have indexes not in repo."
echo ""

"${FIREBASE_CMD[@]}" use "$PROJECT"
# Use full firestore target (not firestore:rules / firestore:indexes) when firebase.json
# uses the multi-database array — sub-targets can silently no-op.
"${FIREBASE_CMD[@]}" deploy --only firestore
