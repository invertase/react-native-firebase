#!/usr/bin/env bash
# Temporarily lets an apps/ harness (e.g. build-harness-expo) resolve its own
# react-native/@react-native/codegen/@types/react versions for local
# testing, without ever risking a commit of the root package.json pin.
#
# The root package.json "resolutions" field force-pins these three packages
# repo-wide (see scripts/check-root-rn-pin.mjs and CI's `yarn lint`, which
# fails if that pin drifts). That pin is what blocks an apps/ harness whose
# own package.json legitimately needs a newer react-native than
# packages/*, tests/, and apps/build-harness use. Removing the pin entirely
# (not bumping it) lets every workspace resolve its own declared version
# independently -- confirmed via `yarn why react-native` per workspace.
#
# Usage:
#   scripts/dev-harness-versions.sh on       # remove the pin locally, reinstall, mark
#                                             # package.json/yarn.lock skip-worktree so
#                                             # git can never see or commit the change
#   scripts/dev-harness-versions.sh off      # restore the committed pin, reinstall,
#                                             # clear skip-worktree
#   scripts/dev-harness-versions.sh status   # show whether "on" is currently active

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

TRACKED_FILES=(package.json yarn.lock)

is_skip_worktree_active() {
  git ls-files -v -- package.json | grep -q '^S '
}

case "${1:-}" in
  on)
    if is_skip_worktree_active; then
      echo "[dev-harness-versions] already on (package.json is skip-worktree)." >&2
      exit 0
    fi

    node -e "
      const fs = require('fs');
      const path = 'package.json';
      const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
      for (const key of ['react-native', '@react-native/codegen', '@types/react']) {
        delete pkg.resolutions[key];
      }
      fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
    "

    for f in "${TRACKED_FILES[@]}"; do
      git update-index --skip-worktree "${f}"
    done

    echo "[dev-harness-versions] removed root react-native/@react-native/codegen/@types/react pin, reinstalling..."
    yarn install

    echo
    echo "[dev-harness-versions] ON. package.json and yarn.lock are now hidden from git"
    echo "(skip-worktree) so they cannot show up in 'git status'/'git diff' or be"
    echo "committed by 'git add -A' / 'git commit -a'. Run this script's 'off'"
    echo "command before you're done, then reinstall as needed."
    ;;

  off)
    if ! is_skip_worktree_active; then
      echo "[dev-harness-versions] already off (no skip-worktree active)." >&2
    fi

    for f in "${TRACKED_FILES[@]}"; do
      git update-index --no-skip-worktree "${f}" 2>/dev/null || true
    done
    git checkout -- "${TRACKED_FILES[@]}"

    echo "[dev-harness-versions] restored committed package.json/yarn.lock, reinstalling..."
    yarn install

    echo "[dev-harness-versions] OFF. Root pin restored; git tracking is back to normal."
    ;;

  status)
    if is_skip_worktree_active; then
      echo "[dev-harness-versions] ON (package.json/yarn.lock are skip-worktree)."
    else
      echo "[dev-harness-versions] OFF (normal git tracking)."
    fi
    ;;

  *)
    echo "Usage: $(basename "$0") on|off|status" >&2
    exit 1
    ;;
esac
