#!/usr/bin/env bash
# Install root Gemfile gems when Bundler is available.
# Skips cleanly (exit 0) when `bundle` is not on PATH — JS-only checkouts and
# CI jobs without setup-ruby must not fail postinstallDev.

set -euo pipefail

if ! command -v bundle >/dev/null 2>&1; then
  echo "ruby:install: bundle not on PATH — skipping root Gemfile install"
  exit 0
fi

bundle check || bundle install
