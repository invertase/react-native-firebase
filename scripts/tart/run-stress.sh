#!/usr/bin/env bash
# Host: run N ephemeral iterations sequentially.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

WORKTREE=""
COUNT=1
BUILD_MODE="debug"
EXTRA_ARGS=()

usage() {
  cat <<EOF
usage: $0 --worktree PATH [--count N] [--mode debug|release] [run-ephemeral.sh args...]
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --worktree) WORKTREE="$2"; shift 2 ;;
    --count) COUNT="$2"; shift 2 ;;
    --mode) BUILD_MODE="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) EXTRA_ARGS+=("$1"); shift ;;
  esac
done

if [[ -z "$WORKTREE" ]]; then
  usage >&2
  exit 1
fi

failures=0
for (( i=0; i<COUNT; i++ )); do
  echo "[stress] iteration ${i}/${COUNT} mode=${BUILD_MODE}"
  if ! bash "${SCRIPT_DIR}/run-ephemeral.sh" \
    --worktree "$WORKTREE" \
    --mode "$BUILD_MODE" \
    --iteration "$i" \
    "${EXTRA_ARGS[@]}"; then
    failures=$((failures + 1))
    echo "[stress] iteration ${i} FAILED (failures=${failures})"
  fi
done

echo "[stress] complete failures=${failures}/${COUNT}"
[[ "$failures" -eq 0 ]]
