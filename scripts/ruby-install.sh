#!/usr/bin/env bash
# Install root Gemfile gems when a usable Bundler is available.
# Skips cleanly (exit 0, one line naming why) when `bundle` is not on PATH, when
# the `ruby` on PATH is older than the repo's Ruby floor, or when `bundle`
# cannot run (for example macOS's system Ruby 2.6 `/usr/bin/bundle`, which
# cannot load the lockfile's Bundler). JS-only checkouts and CI jobs without
# setup-ruby must not fail postinstallDev.

set -euo pipefail

# Ruby 3.3.0 cannot load the lockfile's simplecov (CRuby #20090).
MIN_RUBY_VERSION="3.3.1"
SETUP_DOC="CONTRIBUTING.md#ruby-for-ios-and-macos-work"

skip() {
  echo "ruby:install: $1 — skipping root Gemfile install (iOS/macOS work needs Ruby >= ${MIN_RUBY_VERSION} with bundler; ${SETUP_DOC})"
  exit 0
}

# Exit 0 when dotted version $1 is at least $2.
version_at_least() {
  local IFS=.
  local -a have want
  read -r -a have <<<"$1"
  read -r -a want <<<"$2"
  local i h w
  for i in 0 1 2; do
    h="${have[i]:-0}"
    w="${want[i]:-0}"
    h="${h%%[!0-9]*}"
    w="${w%%[!0-9]*}"
    ((10#${h:-0} > 10#${w:-0})) && return 0
    ((10#${h:-0} < 10#${w:-0})) && return 1
  done
  return 0
}

if ! command -v bundle >/dev/null 2>&1; then
  echo "ruby:install: bundle not on PATH — skipping root Gemfile install"
  exit 0
fi

if ! command -v ruby >/dev/null 2>&1; then
  skip "bundle is on PATH but ruby is not"
fi

ruby_version="$(ruby -e 'print RUBY_VERSION' 2>/dev/null || true)"
if [[ ! "$ruby_version" =~ ^[0-9]+\.[0-9]+ ]]; then
  skip "could not read the version of $(command -v ruby)"
fi
if ! version_at_least "$ruby_version" "$MIN_RUBY_VERSION"; then
  skip "ruby ${ruby_version} at $(command -v ruby) is older than ${MIN_RUBY_VERSION}"
fi

if ! bundle --version >/dev/null 2>&1; then
  skip "$(command -v bundle) cannot run with this Gemfile.lock (bundle --version failed)"
fi

bundle check || bundle install
