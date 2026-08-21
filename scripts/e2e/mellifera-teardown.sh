#!/usr/bin/env bash
# Clear local e2e processes for the current reservation/env, then release mellifera session if possible.
# Prefer: bash scripts/e2e/release-e2e-resources.sh for process clear alone.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MELLIFERA_URL="${MELLIFERA_URL:-http://127.0.0.1:8790}"

echo "[teardown] $(date -u +%Y-%m-%dT%H:%M:%SZ)"

bash "${REPO_ROOT}/scripts/e2e/release-e2e-resources.sh" --devices || true

if curl -sf "${MELLIFERA_URL}/health" >/dev/null 2>&1; then
  if [[ -f "${REPO_ROOT}/tests/mellifera.env.json" ]]; then
    sid=$(node -e "try{console.log(require('${REPO_ROOT}/tests/mellifera.env.json').sessionId||'')}catch(e){}" 2>/dev/null || true)
    tok=$(node -e "try{const e=require('fs').readFileSync('${TMPDIR:-/tmp}/rnfb-mellifera-last.env','utf8');const m=e.match(/MELLIFERA_SESSION_TOKEN=\"([^\"]+)\"/);console.log(m?m[1]:'')}catch(e){}" 2>/dev/null || true)
    if [[ -n "${sid:-}" && -n "${tok:-}" ]]; then
      curl -sf -X POST "${MELLIFERA_URL}/v1/sessions/${sid}/release" \
        -H 'Content-Type: application/json' \
        -d "{\"token\":\"${tok}\"}" >/dev/null 2>&1 || true
      echo "[teardown] released mellifera session ${sid}"
    fi
  fi
fi

rm -f /tmp/rnfb-mellifera-*.env "${REPO_ROOT}/tests/mellifera.env.json" 2>/dev/null || true
rm -f "${REPO_ROOT}/tests/mellifera-platform/"*.env 2>/dev/null || true

# No post-delete check here: release-e2e-resources.sh above already verifies CLEAR
# internally (with forceful retry rounds) against the reservation that was still on
# disk at that point. Checking again now would fall back to serial defaults (the
# mellifera.env.json reservation is already gone) and can report false BUSY/CLEAR
# for a completely different platform's ports.
echo "[teardown] done"
