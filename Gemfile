# frozen_string_literal: true

source 'https://rubygems.org'

# Pinned CocoaPods + Xcodeproj for `yarn tests:ios:pod:install` /
# `yarn tests:macos:pod:install` (`bundle exec pod install`) and for
# firebase_spm.rb shape-check monkeypatches (`yarn tests:ios:ruby`).
# Exact versions — CI/Tart must `BUNDLE_FROZEN=true bundle install`, never
# `gem update cocoapods xcodeproj`.
gem 'cocoapods', '1.17.0'
gem 'xcodeproj', '1.28.1'

# Coverage for `yarn tests:ios:ruby` (see packages/app/__tests__/run_with_coverage.rb).
# Do not pin minitest here — it comes in via cocoapods/activesupport. The
# runner uses `bundle exec` so that copy is used (not a second asdf/system
# minitest).
#
# Supply-chain notes (Bundler 2.6.x host):
# - Commit Gemfile.lock (with CHECKSUMS via `bundle lock --add-checksums`).
# - CI uses `BUNDLE_FROZEN=true bundle install` so lock drift fails the job
#   (Bundler 2.6 deprecates `--frozen` and would persist it into .bundle/config).
# - Do NOT put Bundler-native `cooldown:` here — that needs Bundler 4.0.13+.
#   Dependabot cooldown for directory `/` lives in `.github/dependabot.yml`.
gem 'simplecov', '~> 1.0'
gem 'simplecov-lcov', '~> 0.9'

# Lint for packages/app Ruby helpers + __tests__ (yarn lint:ruby / tests:ios:ruby).
gem 'rubocop', '~> 1.75'
