#!/usr/bin/env bash
# Release mellifera lease resources AND clear matching local e2e processes.
# Process clear is mellifera-agnostic (release-e2e-resources.sh); lease update is mellifera API.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MELLIFERA_URL="${MELLIFERA_URL:-http://127.0.0.1:8790}"
SESSION_ID="${MELLIFERA_SESSION_ID:?MELLIFERA_SESSION_ID required}"
SESSION_TOKEN="${MELLIFERA_SESSION_TOKEN:?MELLIFERA_SESSION_TOKEN required}"
ENV_FILE="${1:-${TMPDIR:-/tmp}/rnfb-mellifera-last.env}"
PORTS_FILE="${REPO_ROOT}/tests/mellifera.env.json"

shift || true
RESOURCES=("$@")
if [[ ${#RESOURCES[@]} -eq 0 ]]; then
  echo "usage: mellifera-release-resources.sh [env-file] resourceId ..." >&2
  echo "  example: mellifera-release-resources.sh /tmp/x.env jet:macos platform:macos" >&2
  exit 1
fi

# Map resource ids → release-e2e --only categories (best-effort).
ONLY_CATS=()
for rid in "${RESOURCES[@]}"; do
  case "$rid" in
    metro:*) ONLY_CATS+=(metro) ;;
    jet:*) ONLY_CATS+=(jet jet-control) ;;
    firebase:*) ONLY_CATS+=(emulators) ;;
    platform:android) ONLY_CATS+=(android-apps) ;;
    platform:ios) ONLY_CATS+=(ios-sims) ;;
    platform:macos) ONLY_CATS+=(macos-app) ;;
  esac
done

if [[ ${#ONLY_CATS[@]} -gt 0 ]]; then
  # unique
  ONLY_JOINED=$(printf '%s\n' "${ONLY_CATS[@]}" | awk 'NF && !u[$0]++' | paste -sd, -)
  echo "[release-resources] clearing local processes --only ${ONLY_JOINED}"
  # ios-sims is devices-gated in release-e2e-resources.sh — pass --devices when
  # platform:ios → ios-sims is in play (platform:android maps to android-apps only).
  EXTRA=()
  if [[ ",${ONLY_JOINED}," == *",ios-sims,"* ]]; then
    EXTRA+=(--devices)
  fi
  bash "${REPO_ROOT}/scripts/e2e/release-e2e-resources.sh" --only "$ONLY_JOINED" "${EXTRA[@]+"${EXTRA[@]}"}" || true
fi

JSON_RESOURCES="$(printf '%s\n' "${RESOURCES[@]}" | node -e "
  const lines=require('fs').readFileSync(0,'utf8').trim().split(/\\n/).filter(Boolean);
  console.log(JSON.stringify(lines));
")"

SESSION_JSON="$(curl -sf -X POST "${MELLIFERA_URL}/v1/sessions/${SESSION_ID}/release-resources" \
  -H 'Content-Type: application/json' \
  -d "{\"token\":\"${SESSION_TOKEN}\",\"resources\":${JSON_RESOURCES}}")"

node "${REPO_ROOT}/scripts/e2e/mellifera-refresh-session-env.js" \
  "$SESSION_JSON" "$ENV_FILE" "$PORTS_FILE" "$SESSION_TOKEN"

echo "[release-resources] released lease resources: ${RESOURCES[*]}"
