#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# shellcheck source=firebase-cli.sh
source "$SCRIPT_DIR/firebase-cli.sh"

PROJECT="${FIREBASE_PROJECT:-react-native-firebase-testing}"

"${FIREBASE_CMD[@]}" use "$PROJECT"

echo "Pulling Firestore indexes from cloud project: ${PROJECT}"
"${FIREBASE_CMD[@]}" firestore:indexes --project "$PROJECT" --database "(default)" > firestore.indexes.json
"${FIREBASE_CMD[@]}" firestore:indexes --project "$PROJECT" --database pipelines-e2e > firestore.pipelines-e2e.indexes.json

echo "Wrote:"
echo "  firestore.indexes.json ($(wc -l < firestore.indexes.json | tr -d ' ') lines)"
echo "  firestore.pipelines-e2e.indexes.json ($(wc -l < firestore.pipelines-e2e.indexes.json | tr -d ' ') lines)"
