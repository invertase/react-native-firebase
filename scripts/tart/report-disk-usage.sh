#!/usr/bin/env bash
# Host: report disk usage for Tart images and RNFB cache paths (host + optional VM).
set -euo pipefail

# shellcheck source=lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

TART_HOME="${HOME}/.tart"

echo "=== host df ==="
df -h "${HOME}" "${TART_HOME}" 2>/dev/null || df -h "${HOME}"

echo ""
echo "=== ~/.tart ==="
if [[ -d "$TART_HOME" ]]; then
  du -sh "$TART_HOME" 2>/dev/null || true
  du -sh "$TART_HOME"/* 2>/dev/null | sort -hr | head -20 || true
else
  echo "(no ~/.tart directory)"
fi

echo ""
echo "=== tart list ==="
if command -v tart >/dev/null 2>&1; then
  tart list || true
else
  echo "(tart not installed)"
fi

for vm in "$RNFB_TART_GOLDEN_VM" "$RNFB_TART_WARMED_VM"; do
  if command -v tart >/dev/null 2>&1 && tart list 2>/dev/null | grep -q "$vm"; then
    echo ""
    echo "=== VM ${vm} (via SSH) ==="
    if rnfb_tart_ssh "$vm" "df -h /; du -sh ~/.yarn-rnfb-cache ~/Library/Detox ~/\.cache/firebase ~/.metro ~/.ccache ~/Library/Caches/CocoaPods 2>/dev/null" 2>/dev/null; then
      :
    else
      echo "(VM not running or SSH unavailable — start with tart run ${vm})"
    fi
  fi
done
