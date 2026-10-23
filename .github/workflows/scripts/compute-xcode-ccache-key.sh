#!/usr/bin/env bash
# Content hash for ccache-action keys without actions/hashFiles.
# hashFiles re-runs on Post-cache and can exceed the 120s limit on dirty CI trees
# (DerivedData, SPM checkouts under packages/*/ios). git ls-files only sees tracked
# sources, so Post can reuse the step output with no filesystem walk.
set -euo pipefail

usage() {
  echo "usage: $0 <rn-bare|expo|e2e-ios|e2e-macos>" >&2
  exit 2
}

[[ $# -eq 1 ]] || usage

case "$1" in
  rn-bare)
    PATHSPECS=(
      yarn.lock
      ':(glob)test-rn-bare/*'
      ':(glob)test-rn-bare/ios/*'
      ':(glob)test-rn-bare/ios/testrnbare/**'
      ':(glob)test-rn-bare/ios/*.xcodeproj/**'
      ':(glob)packages/app/*'
      ':(glob)packages/app/ios/RNFB*/**'
      ':(glob)packages/app/ios/generated/**'
      ':(glob)packages/app/plugin/**'
      ':(exclude,glob)packages/app/ios/**/build/**'
    )
    ;;
  expo)
    PATHSPECS=(
      yarn.lock
      ':(glob)test-expo/*'
      ':(glob)test-expo/app/**'
      ':(glob)test-expo/src/**'
      ':(glob)test-expo/assets/**'
      ':(glob)packages/app/*'
      ':(glob)packages/app/ios/RNFB*/**'
      ':(glob)packages/app/ios/generated/**'
      ':(glob)packages/app/plugin/**'
      ':(exclude,glob)packages/app/ios/**/build/**'
    )
    ;;
  e2e-ios)
    PATHSPECS=(
      yarn.lock
      ':(glob)packages/*/*.podspec'
      ':(glob)packages/*/package.json'
      ':(glob)packages/*/ios/RNFB*/**'
      ':(glob)packages/*/ios/generated/**'
      ':(glob)packages/app/plugin/**'
      tests/ios/Podfile.lock
      ':(exclude,glob)packages/*/ios/**/build/**'
    )
    ;;
  e2e-macos)
    PATHSPECS=(
      yarn.lock
      ':(glob)packages/*/*.podspec'
      ':(glob)packages/*/package.json'
      ':(glob)packages/*/ios/RNFB*/**'
      ':(glob)packages/*/ios/generated/**'
      ':(glob)packages/app/plugin/**'
      tests-macos/macos/Podfile.lock
      ':(exclude,glob)packages/*/ios/**/build/**'
    )
    ;;
  *)
    usage
    ;;
esac

# Stable order; each line is "<sha>  <path>" so renames invalidate.
{
  git ls-files -z -- "${PATHSPECS[@]}" \
    | sort -z \
    | while IFS= read -r -d '' f; do
        shasum -a 256 -- "$f"
      done
} | shasum -a 256 | awk '{print $1}'
