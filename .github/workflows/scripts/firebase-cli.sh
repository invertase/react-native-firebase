#!/usr/bin/env bash
# Resolve firebase-tools for scripts in this directory.
# Source from sibling scripts: source "$(dirname "${BASH_SOURCE[0]}")/firebase-cli.sh"
#
# Preference order:
#   1. repo root node_modules/.bin/firebase (yarn install at repo root)
#   2. functions/node_modules/.bin/firebase (yarn in functions/)
#   3. yarn firebase (same as start-firebase-emulator.bat)
#   4. global firebase on PATH
#   5. npx firebase-tools

_firebase_scripts_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_firebase_repo_root="$(cd "$_firebase_scripts_dir/../../.." && pwd)"

if [ -x "$_firebase_repo_root/node_modules/.bin/firebase" ]; then
  FIREBASE_CMD=("$_firebase_repo_root/node_modules/.bin/firebase")
elif [ -x "$_firebase_scripts_dir/functions/node_modules/.bin/firebase" ]; then
  FIREBASE_CMD=("$_firebase_scripts_dir/functions/node_modules/.bin/firebase")
elif command -v yarn >/dev/null 2>&1; then
  FIREBASE_CMD=(yarn firebase)
elif command -v firebase >/dev/null 2>&1; then
  FIREBASE_CMD=(firebase)
elif command -v npx >/dev/null 2>&1; then
  FIREBASE_CMD=(npx --yes firebase-tools)
else
  echo "❌ Firebase-tools CLI is missing. Run 'yarn' at the repo root, or install firebase-tools globally." >&2
  exit 1
fi
