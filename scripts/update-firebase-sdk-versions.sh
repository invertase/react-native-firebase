#!/usr/bin/env bash
# Deterministic extraction of Firebase SDK versions from the three official
# release-notes pages
#
# Output is stable sorted KEY=value lines (LC_ALL=C) so agents and humans get the
# same ordering. Parsing rules are fixed: same HTML input bytes always yield the
# same output.
#
# Usage:
#   ./scripts/update-firebase-sdk-versions.sh
#       Fetch the three pages with curl and print versions.
#   ./scripts/update-firebase-sdk-versions.sh --offline DIR
#       Read DIR/android.html, DIR/ios.html, DIR/js.html (e.g. saved from a prior
#       run). No network; fully reproducible for a given snapshot.
#   ./scripts/update-firebase-sdk-versions.sh --save-snapshot DIR
#       Fetch and write the three HTML files to DIR, then print versions (handy
#       for freezing a release-notes snapshot in CI artifacts).
#   ./scripts/update-firebase-sdk-versions.sh --apply [same fetch options as above]
#       Phase 1: extract versions (printed as sorted KEY=value lines).
#       Phase 2: write them into packages/app/package.json, docs, Gradle files, and
#       Jest plugin snapshots; run yarn; run yarn tests:ios:pod:install.
#       If any native SDK / Android plugin / App Distribution API version changed,
#       run yarn test:full (expects full Xcode/Android/macOS toolchains; exits 1 on failure).
#       Set RNF_SDK_UPGRADE_SKIP_TEST_FULL=1 to skip the final yarn test:full (patches + yarn + pods only).

set -euo pipefail

URL_ANDROID='https://firebase.google.com/support/release-notes/android'
URL_IOS='https://firebase.google.com/support/release-notes/ios'
URL_JS='https://firebase.google.com/support/release-notes/js'

CURL=(curl -fsSL --retry 3 --connect-timeout 30)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

die() {
  echo "update-firebase-sdk-versions: $*" >&2
  exit 1
}

fetch_or_read() {
  local url_or_path="$1"
  if [[ -f "$url_or_path" ]]; then
    cat "$url_or_path"
  else
    "${CURL[@]}" "$url_or_path"
  fi
}

# Args: artifact id. HTML on stdin. Prints the version from the "Latest version" table.
android_cell_version() {
  local artifact="$1"
  ARTIFACT="$artifact" perl -0777 -ne '
    my $a = $ENV{"ARTIFACT"};
    if ($a eq "firebase-bom") {
      print $1 if /com\.google\.firebase:firebase-bom.*?<\/td>\s*<td>([^<]+)<\/td>/s;
    } elsif ($a eq "google-services") {
      print $1 if /<td>com\.google\.gms:google-services<\/td>\s*<td>([^<]+)<\/td>/;
    } else {
      my $e = quotemeta($a);
      print $1 if /<td>com\.google\.firebase:$e<\/td>\s*<td>([^<]+)<\/td>/;
    }
  '
}

android_version() {
  local html="$1"
  local artifact="$2"
  local v
  v="$(printf '%s' "$html" | android_cell_version "$artifact")"
  [[ -n "$v" ]] || die "failed to parse Android artifact: $artifact"
  printf '%s' "$v"
}

# First <a name="semver"> in the page is the latest release (Firebase ordering).
extract_ios_or_js_latest() {
  perl -ne 'if (/<a name="([0-9]+(?:\.[0-9]+){2})">/) { print $1; exit }' || true
}

OFFLINE_DIR=''
SAVE_DIR=''
DO_APPLY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --offline)
      OFFLINE_DIR="${2:?}"
      shift 2
      ;;
    --save-snapshot)
      SAVE_DIR="${2:?}"
      shift 2
      ;;
    --apply)
      DO_APPLY=true
      shift
      ;;
    -h | --help)
      sed -n '1,35p' "$0"
      exit 0
      ;;
    *)
      die "unknown option: $1"
      ;;
  esac
done

resolve_source() {
  local which="$1"
  local url="$2"
  if [[ -n "$OFFLINE_DIR" ]]; then
    echo "${OFFLINE_DIR}/${which}.html"
  else
    echo "$url"
  fi
}

ANDROID_SRC="$(resolve_source android "$URL_ANDROID")"
IOS_SRC="$(resolve_source ios "$URL_IOS")"
JS_SRC="$(resolve_source js "$URL_JS")"

if [[ -n "$OFFLINE_DIR" ]]; then
  [[ -f "$ANDROID_SRC" ]] || die "missing $ANDROID_SRC"
  [[ -f "$IOS_SRC" ]] || die "missing $IOS_SRC"
  [[ -f "$JS_SRC" ]] || die "missing $JS_SRC"
fi

if [[ -n "$SAVE_DIR" ]]; then
  mkdir -p "$SAVE_DIR"
  "${CURL[@]}" "$URL_ANDROID" >"${SAVE_DIR}/android.html"
  "${CURL[@]}" "$URL_IOS" >"${SAVE_DIR}/ios.html"
  "${CURL[@]}" "$URL_JS" >"${SAVE_DIR}/js.html"
  ANDROID_SRC="${SAVE_DIR}/android.html"
  IOS_SRC="${SAVE_DIR}/ios.html"
  JS_SRC="${SAVE_DIR}/js.html"
fi

ANDROID_HTML="$(fetch_or_read "$ANDROID_SRC")"
IOS_HTML="$(fetch_or_read "$IOS_SRC")"
JS_HTML="$(fetch_or_read "$JS_SRC")"

FIREBASE_ANDROID_BOM="$(android_version "$ANDROID_HTML" 'firebase-bom')"
FIREBASE_ANDROID_APPDISTRIBUTION_API="$(android_version "$ANDROID_HTML" 'firebase-appdistribution-api')"
FIREBASE_ANDROID_APPDISTRIBUTION_LIB="$(android_version "$ANDROID_HTML" 'firebase-appdistribution')"
FIREBASE_ANDROID_APPDISTRIBUTION_GRADLE="$(android_version "$ANDROID_HTML" 'firebase-appdistribution-gradle')"
FIREBASE_ANDROID_CRASHLYTICS_GRADLE="$(android_version "$ANDROID_HTML" 'firebase-crashlytics-gradle')"
FIREBASE_ANDROID_PERF_PLUGIN="$(android_version "$ANDROID_HTML" 'perf-plugin')"
FIREBASE_ANDROID_GOOGLE_SERVICES="$(android_version "$ANDROID_HTML" 'google-services')"
FIREBASE_IOS_SDK="$(extract_ios_or_js_latest <<<"$IOS_HTML")"
FIREBASE_JS_SDK="$(extract_ios_or_js_latest <<<"$JS_HTML")"

[[ -n "$FIREBASE_IOS_SDK" ]] || die "failed to parse iOS latest version"
[[ -n "$FIREBASE_JS_SDK" ]] || die "failed to parse JS latest version"

print_sorted_versions() {
  {
    echo "firebase_android_appdistribution_api=${FIREBASE_ANDROID_APPDISTRIBUTION_API}"
    echo "firebase_android_appdistribution_gradle=${FIREBASE_ANDROID_APPDISTRIBUTION_GRADLE}"
    echo "firebase_android_appdistribution=${FIREBASE_ANDROID_APPDISTRIBUTION_LIB}"
    echo "firebase_android_bom=${FIREBASE_ANDROID_BOM}"
    echo "firebase_android_crashlytics_gradle=${FIREBASE_ANDROID_CRASHLYTICS_GRADLE}"
    echo "firebase_android_google_services=${FIREBASE_ANDROID_GOOGLE_SERVICES}"
    echo "firebase_android_perf_plugin=${FIREBASE_ANDROID_PERF_PLUGIN}"
    echo "firebase_ios_sdk=${FIREBASE_IOS_SDK}"
    echo "firebase_js_sdk=${FIREBASE_JS_SDK}"
  } | LC_ALL=C sort
}

print_sorted_versions

if [[ "$DO_APPLY" != true ]]; then
  exit 0
fi

command -v node >/dev/null || die "node is required for --apply"
command -v perl >/dev/null || die "perl is required for --apply"

cd "$REPO_ROOT"

read_old_native_versions() {
  node <<'NODE'
const fs = require('fs');
const j = JSON.parse(fs.readFileSync('packages/app/package.json', 'utf8'));
const a = j.sdkVersions.android;
process.stdout.write(
  [
    j.sdkVersions.ios.firebase,
    a.firebase,
    a.firebaseCrashlyticsGradle,
    a.firebasePerfGradle,
    a.gmsGoogleServicesGradle,
    a.firebaseAppDistributionGradle,
  ].join('\t'),
);
NODE
}

OLD_TSV="$(read_old_native_versions)"
[[ -n "$OLD_TSV" ]] || die "could not read current native versions from packages/app/package.json"
IFS=$'\t' read -r OLD_IOS OLD_BOM OLD_CRASH OLD_PERF OLD_GMS OLD_APPDIST_G <<<"$OLD_TSV" ||
  die "could not parse sdkVersions TSV from packages/app/package.json"

OLD_APPDIST_API="$(
  perl -ne "print \$1 and exit if /firebase-appdistribution-api:([^']+)/" \
    packages/app-distribution/android/build.gradle
)"

native_changed=false
[[ "$OLD_IOS" != "$FIREBASE_IOS_SDK" ]] && native_changed=true
[[ "$OLD_BOM" != "$FIREBASE_ANDROID_BOM" ]] && native_changed=true
[[ "$OLD_CRASH" != "$FIREBASE_ANDROID_CRASHLYTICS_GRADLE" ]] && native_changed=true
[[ "$OLD_PERF" != "$FIREBASE_ANDROID_PERF_PLUGIN" ]] && native_changed=true
[[ "$OLD_GMS" != "$FIREBASE_ANDROID_GOOGLE_SERVICES" ]] && native_changed=true
[[ "$OLD_APPDIST_G" != "$FIREBASE_ANDROID_APPDISTRIBUTION_GRADLE" ]] && native_changed=true
[[ "$OLD_APPDIST_API" != "$FIREBASE_ANDROID_APPDISTRIBUTION_API" ]] && native_changed=true

export FIREBASE_JS_SDK FIREBASE_IOS_SDK FIREBASE_ANDROID_BOM \
  FIREBASE_ANDROID_APPDISTRIBUTION_API FIREBASE_ANDROID_APPDISTRIBUTION_LIB \
  FIREBASE_ANDROID_APPDISTRIBUTION_GRADLE FIREBASE_ANDROID_CRASHLYTICS_GRADLE \
  FIREBASE_ANDROID_PERF_PLUGIN FIREBASE_ANDROID_GOOGLE_SERVICES

echo "update-firebase-sdk-versions: applying versions under $REPO_ROOT" >&2

node <<'NODE'
const fs = require('fs');
const path = 'packages/app/package.json';
const j = JSON.parse(fs.readFileSync(path, 'utf8'));
const e = process.env;
j.dependencies.firebase = e.FIREBASE_JS_SDK;
j.sdkVersions.ios.firebase = e.FIREBASE_IOS_SDK;
j.sdkVersions.android.firebase = e.FIREBASE_ANDROID_BOM;
j.sdkVersions.android.firebaseCrashlyticsGradle = e.FIREBASE_ANDROID_CRASHLYTICS_GRADLE;
j.sdkVersions.android.firebasePerfGradle = e.FIREBASE_ANDROID_PERF_PLUGIN;
j.sdkVersions.android.gmsGoogleServicesGradle = e.FIREBASE_ANDROID_GOOGLE_SERVICES;
j.sdkVersions.android.firebaseAppDistributionGradle = e.FIREBASE_ANDROID_APPDISTRIBUTION_GRADLE;
fs.writeFileSync(path, JSON.stringify(j, null, 2) + '\n');
NODE

patch_gradle_classpaths() {
  local file="$1"
  local tmp
  tmp="$(mktemp "${TMPDIR:-/tmp}/rnfb-sdk-perl.XXXXXX")"
  cat >"$tmp" <<'PERL_PATCH'
s{(classpath 'com\.google\.gms:google-services:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_GOOGLE_SERVICES}}ge;
s{(classpath 'com\.google\.firebase:perf-plugin:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_PERF_PLUGIN}}ge;
s{(classpath 'com\.google\.firebase:firebase-crashlytics-gradle:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_CRASHLYTICS_GRADLE}}ge;
s{(classpath 'com\.google\.firebase:firebase-appdistribution-gradle:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_APPDISTRIBUTION_GRADLE}}ge;
PERL_PATCH
  perl -i -0777 -pe "do q{$tmp}" "$file"
  rm -f "$tmp"
}

patch_gradle_classpaths tests/android/build.gradle

tmp_ad="$(mktemp "${TMPDIR:-/tmp}/rnfb-sdk-perl.XXXXXX")"
cat >"$tmp_ad" <<'PERL_PATCH'
s{(firebase-appdistribution-api:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_APPDISTRIBUTION_API}}ge;
s{(firebase-appdistribution:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_APPDISTRIBUTION_LIB}}ge;
PERL_PATCH
perl -i -0777 -pe "do q{$tmp_ad}" packages/app-distribution/android/build.gradle
rm -f "$tmp_ad"

# Docs (user-facing snippets mirror tests/android/build.gradle and package.json overrides).
tmp_doc="$(mktemp "${TMPDIR:-/tmp}/rnfb-sdk-perl.XXXXXX")"
cat >"$tmp_doc" <<'PERL_PATCH'
s{(classpath 'com\.google\.gms:google-services:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_GOOGLE_SERVICES}}ge;
s{(bom\s*:\s*")([^"]+)(")}{$1.$ENV{FIREBASE_ANDROID_BOM}.$3}ge;
s{(\$FirebaseSDKVersion = ')([^']+)(')}{$1.$ENV{FIREBASE_IOS_SDK}.$3}ge;
s{(FIREBASE_SDK_VERSION=)([0-9.]+)}{$1.$ENV{FIREBASE_IOS_SDK}}ge;
PERL_PATCH
perl -i -pe "do q{$tmp_doc}" docs/index.md
rm -f "$tmp_doc"

tmp_adoc="$(mktemp "${TMPDIR:-/tmp}/rnfb-sdk-perl.XXXXXX")"
cat >"$tmp_adoc" <<'PERL_PATCH'
s{(classpath 'com\.google\.firebase:firebase-appdistribution-gradle:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_APPDISTRIBUTION_GRADLE}}ge;
PERL_PATCH
perl -i -pe "do q{$tmp_adoc}" docs/app-distribution/usage/index.md
rm -f "$tmp_adoc"

tmp_perf="$(mktemp "${TMPDIR:-/tmp}/rnfb-sdk-perl.XXXXXX")"
cat >"$tmp_perf" <<'PERL_PATCH'
s{(classpath 'com\.google\.firebase:perf-plugin:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_PERF_PLUGIN}}ge;
PERL_PATCH
perl -i -pe "do q{$tmp_perf}" docs/perf/usage/index.md
rm -f "$tmp_perf"

tmp_crash="$(mktemp "${TMPDIR:-/tmp}/rnfb-sdk-perl.XXXXXX")"
cat >"$tmp_crash" <<'PERL_PATCH'
s{(classpath 'com\.google\.firebase:firebase-crashlytics-gradle:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_CRASHLYTICS_GRADLE}}ge;
PERL_PATCH
perl -i -pe "do q{$tmp_crash}" docs/crashlytics/android-setup.md
rm -f "$tmp_crash"

# Jest snapshots for Expo / config plugins (classpath lines must match sdkVersions).
tmp_snap_c="$(mktemp "${TMPDIR:-/tmp}/rnfb-sdk-perl.XXXXXX")"
cat >"$tmp_snap_c" <<'PERL_PATCH'
s{(firebase-crashlytics-gradle:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_CRASHLYTICS_GRADLE}}ge;
PERL_PATCH
perl -i -pe "do q{$tmp_snap_c}" packages/crashlytics/plugin/__tests__/__snapshots__/androidPlugin.test.ts.snap
rm -f "$tmp_snap_c"

tmp_snap_app="$(mktemp "${TMPDIR:-/tmp}/rnfb-sdk-perl.XXXXXX")"
cat >"$tmp_snap_app" <<'PERL_PATCH'
s{(com\.google\.gms:google-services:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_GOOGLE_SERVICES}}ge;
PERL_PATCH
perl -i -pe "do q{$tmp_snap_app}" packages/app/plugin/__tests__/__snapshots__/androidPlugin.test.ts.snap
rm -f "$tmp_snap_app"

tmp_snap_dist="$(mktemp "${TMPDIR:-/tmp}/rnfb-sdk-perl.XXXXXX")"
cat >"$tmp_snap_dist" <<'PERL_PATCH'
s{(firebase-appdistribution-gradle:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_APPDISTRIBUTION_GRADLE}}ge;
PERL_PATCH
perl -i -pe "do q{$tmp_snap_dist}" packages/app-distribution/plugin/__tests__/__snapshots__/androidPlugin.test.ts.snap
rm -f "$tmp_snap_dist"

tmp_snap_p="$(mktemp "${TMPDIR:-/tmp}/rnfb-sdk-perl.XXXXXX")"
cat >"$tmp_snap_p" <<'PERL_PATCH'
s{(perf-plugin:)([^']+)}{$1.$ENV{FIREBASE_ANDROID_PERF_PLUGIN}}ge;
PERL_PATCH
perl -i -pe "do q{$tmp_snap_p}" packages/perf/plugin/__tests__/__snapshots__/androidPlugin.test.ts.snap
rm -f "$tmp_snap_p"

echo "update-firebase-sdk-versions: running yarn (refresh yarn.lock, workspace prepare)" >&2
yarn

echo "update-firebase-sdk-versions: running yarn tests:ios:pod:install" >&2
yarn tests:ios:pod:install

if [[ "$native_changed" == true ]]; then
  if [[ -n "${RNF_SDK_UPGRADE_SKIP_TEST_FULL:-}" ]]; then
    echo "update-firebase-sdk-versions: skipping yarn test:full (RNF_SDK_UPGRADE_SKIP_TEST_FULL is set)" >&2
  else
    echo "update-firebase-sdk-versions: native SDK / Gradle / App Distribution API changed; running yarn test:full" >&2
    yarn test:full
  fi
else
  echo "update-firebase-sdk-versions: no native version changes (JS-only or already current); skipping yarn test:full" >&2
fi
