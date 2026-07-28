#!/usr/bin/env bash
set -euo pipefail

# Post-deploy verification for pipelines-e2e composite/search indexes.
# Fails non-zero when expected index definitions are absent from cloud export.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# shellcheck source=firebase-cli.sh
source "$SCRIPT_DIR/firebase-cli.sh"

PROJECT="${FIREBASE_PROJECT:-react-native-firebase-testing}"
DATABASE="${FIRESTORE_VERIFY_DATABASE:-pipelines-e2e}"
TMP_INDEXES="$(mktemp)"
trap 'rm -f "$TMP_INDEXES"' EXIT

MIN_FIREBASE_TOOLS_VERSION="${MIN_FIREBASE_TOOLS_VERSION:-15.17.0}"

version_ge() {
  local installed="$1"
  local required="$2"
  if [ "$(printf '%s\n' "$required" "$installed" | sort -V | head -n1)" != "$required" ]; then
    return 1
  fi
  return 0
}

INSTALLED_VERSION="$("${FIREBASE_CMD[@]}" --version | tr -d '\r')"
if ! version_ge "$INSTALLED_VERSION" "$MIN_FIREBASE_TOOLS_VERSION"; then
  echo "❌ firebase-tools ${INSTALLED_VERSION} is below required ${MIN_FIREBASE_TOOLS_VERSION} (search index deploy)." >&2
  exit 1
fi

echo "Verifying Firestore indexes for project=${PROJECT} database=${DATABASE} (firebase-tools ${INSTALLED_VERSION})"

"${FIREBASE_CMD[@]}" use "$PROJECT" >/dev/null
"${FIREBASE_CMD[@]}" firestore:indexes --project "$PROJECT" --database "$DATABASE" >"$TMP_INDEXES"

# B2: full-text search composite on search-text/menu (not find-nearest vector index).
if ! python3 - "$TMP_INDEXES" <<'PY'
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
indexes = data.get("indexes") or []

def has_search_menu_index(indexes):
    for entry in indexes:
        if entry.get("collectionGroup") != "search-text":
            continue
        for field in entry.get("fields") or []:
            if field.get("fieldPath") != "menu":
                continue
            sc = field.get("searchConfig") or {}
            specs = ((sc.get("textSpec") or {}).get("indexSpecs") or [])
            for spec in specs:
                if spec.get("indexType") == "TOKENIZED" and spec.get("matchType") == "MATCH_GLOBALLY":
                    return True
    return False

if not has_search_menu_index(indexes):
    print("Missing expected search-text/menu TOKENIZED MATCH_GLOBALLY searchConfig index in cloud export.", file=sys.stderr)
    print("Triage: firebase-tools version, firestore.pipelines-e2e.indexes.json schema, index BUILDING state.", file=sys.stderr)
    sys.exit(1)
print("OK: search-text/menu search index present in cloud export.")
PY
then
  exit 1
fi

# Optional: warn when vector find-nearest index missing (separate from search spine).
if ! python3 - "$TMP_INDEXES" <<'PY'
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
for entry in data.get("indexes") or []:
    if entry.get("collectionGroup") == "find-nearest":
        for field in entry.get("fields") or []:
            if field.get("fieldPath") == "embedding" and field.get("vectorConfig"):
                print("OK: find-nearest vector index present.")
                sys.exit(0)
print("WARN: find-nearest vector index not found in cloud export (may still be BUILDING).", file=sys.stderr)
PY
then
  :
fi

echo "Firestore index verification passed."
