#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FORWARDED_ARGS=()

for argument in "$@"; do
  case "$argument" in
    -PinternalKtlintGitFilter=*)
      FORWARDED_ARGS+=("-PrnfbKtlintGitFilter=${argument#*=}")
      ;;
    *)
      FORWARDED_ARGS+=("$argument")
      ;;
  esac
done

cd "$ROOT_DIR/tests/android"
exec ./gradlew "${FORWARDED_ARGS[@]}"
