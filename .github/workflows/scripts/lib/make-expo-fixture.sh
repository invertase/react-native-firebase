#!/bin/bash
# Generates a blank Expo app that depends on @react-native-firebase/app plus
# the requested RNFB modules, with SPM on and useFrameworks: "dynamic".
#
# Usage: make-expo-fixture.sh --modules messaging[,analytics...] --out <dir>
#        (--modules "" or --modules app generates an app-only fixture)
#        make-expo-fixture.sh --modules <m>[,<m>...] --check-modules
#        (validates the modules, prints them space-separated, writes nothing)
#
# Invalid, duplicate or unpinned module names exit 2.
#
# Versions come from test-expo/package.json so the fixture never drifts from
# the documented-path example. Nothing is installed: the fixture must live
# under test-expo/ so Node resolution walks up to test-expo/node_modules
# (.yarnrc.yml sets nmHoistingLimits: workspaces, so the repo root
# node_modules does not hold `expo` or the RNFB symlinks, and its
# `react-native` is a different version).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
TEST_EXPO="${REPO_ROOT}/test-expo"

log() {
  echo "[make-expo-fixture] $*"
}
fail() {
  log "ERROR: $*" >&2
  exit 1
}
usage_error() {
  log "ERROR: $*" >&2
  log "usage: $0 --modules <m>[,<m>...] (--out <dir under test-expo/> | --check-modules)" >&2
  exit 2
}

MODULES=""
OUT=""
CHECK_ONLY=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --modules)
      [[ $# -ge 2 ]] || usage_error "$1 needs a value"
      MODULES="$2"
      shift 2
      ;;
    --out)
      [[ $# -ge 2 ]] || usage_error "$1 needs a value"
      OUT="$2"
      shift 2
      ;;
    --check-modules)
      CHECK_ONLY=1
      shift
      ;;
    *)
      usage_error "unknown argument: $1"
      ;;
  esac
done

modules=()
IFS=',' read -r -a requested <<<"$MODULES"
for module in ${requested[@]+"${requested[@]}"}; do
  module="${module// /}"
  [[ -z "$module" || "$module" == "app" ]] && continue
  [[ "$module" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || usage_error "invalid module name '${module}'"
  for seen in ${modules[@]+"${modules[@]}"}; do
    [[ "$seen" == "$module" ]] && usage_error "module '${module}' requested twice"
  done
  modules+=("$module")
done

RNFB_MODULES="${modules[*]+"${modules[*]}"}" TEST_EXPO="$TEST_EXPO" node -e '
const pkg = require(`${process.env.TEST_EXPO}/package.json`);
const missing = (process.env.RNFB_MODULES || "").split(" ").filter(Boolean)
  .map(m => `@react-native-firebase/${m}`)
  .filter(name => !(pkg.dependencies || {})[name]);
if (missing.length) {
  console.error(`[make-expo-fixture] ERROR: test-expo/package.json has no dependency pin for ${missing.join(", ")}`);
  process.exit(2);
}
' || exit 2

if [[ "$CHECK_ONLY" -eq 1 ]]; then
  [[ -z "$OUT" ]] || usage_error "--check-modules and --out are mutually exclusive"
  echo "${modules[*]+"${modules[*]}"}"
  exit 0
fi
[[ -n "$OUT" ]] || usage_error "--out <dir> is required"

case "/${OUT}/" in
  */../*) usage_error "--out must not contain a '..' component (got ${OUT})" ;;
esac
OUT="${OUT%/}"
out_parent="$OUT"
out_rest=""
while [[ ! -d "$out_parent" ]]; do
  out_rest="/$(basename "$out_parent")${out_rest}"
  out_parent="$(dirname "$out_parent")"
done
OUT="$(cd "$out_parent" && pwd -P)${out_rest}"
case "$OUT/" in
  "$(cd "$TEST_EXPO" && pwd -P)"/*/) ;;
  *) usage_error "--out must be inside ${TEST_EXPO} so packages resolve from test-expo/node_modules (got ${OUT})" ;;
esac
mkdir -p "$OUT"
if [[ -n "$(ls -A "$OUT")" ]]; then
  fail "--out ${OUT} is not empty"
fi

cp "${TEST_EXPO}/GoogleService-Info.plist" "${OUT}/GoogleService-Info.plist"

RNFB_MODULES="${modules[*]+"${modules[*]}"}" \
  TEST_EXPO="$TEST_EXPO" OUT="$OUT" node <<'NODE'
const fs = require('fs');
const path = require('path');

const testExpo = process.env.TEST_EXPO;
const out = process.env.OUT;
const modules = (process.env.RNFB_MODULES || '').split(' ').filter(Boolean);
const source = JSON.parse(fs.readFileSync(path.join(testExpo, 'package.json'), 'utf8'));

function die(message) {
  console.error(`[make-expo-fixture] ERROR: ${message}`);
  process.exit(1);
}

function pin(name) {
  const version = source.dependencies[name];
  if (!version) die(`test-expo/package.json has no dependency pin for ${name}`);
  return version;
}

const rnfbPackages = ['app', ...modules].map(m => `@react-native-firebase/${m}`);
const names = ['expo', 'react', 'react-native', 'expo-build-properties', ...rnfbPackages];
const dependencies = {};
for (const name of names) dependencies[name] = pin(name);

for (const name of names) {
  let resolved;
  try {
    resolved = require.resolve(`${name}/package.json`, { paths: [out] });
  } catch {
    die(`${name} does not resolve from ${out}; run root yarn first`);
  }
  const installed = JSON.parse(fs.readFileSync(resolved, 'utf8')).version;
  const wanted = dependencies[name];
  if (/^\d/.test(wanted) && installed !== wanted) {
    die(`${name} resolves to ${installed} at ${resolved}, test-expo pins ${wanted}`);
  }
  console.log(`[make-expo-fixture] ${name}@${installed} -> ${path.dirname(resolved)}`);
}

const plugins = [];
for (const name of rnfbPackages) {
  const pkgDir = path.dirname(require.resolve(`${name}/package.json`, { paths: [out] }));
  if (fs.existsSync(path.join(pkgDir, 'app.plugin.js'))) {
    plugins.push(name);
  } else {
    console.log(`[make-expo-fixture] ${name} ships no config plugin; not adding a plugin entry`);
  }
}
plugins.push(['expo-build-properties', { ios: { useFrameworks: 'dynamic' } }]);

const suffix = modules.length ? modules.join('-') : 'app';
const pkg = {
  name: `rnfb-expo-fixture-${suffix}`,
  version: '1.0.0',
  private: true,
  dependencies,
  expo: { autolinking: { exclude: ['@expo/ui'] } },
};
const appJson = {
  expo: {
    name: 'rnfbfixture',
    slug: 'rnfbfixture',
    version: '1.0.0',
    ios: {
      bundleIdentifier: 'io.invertase.testing',
      googleServicesFile: './GoogleService-Info.plist',
    },
    plugins,
  },
};
fs.writeFileSync(path.join(out, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
fs.writeFileSync(path.join(out, 'app.json'), `${JSON.stringify(appJson, null, 2)}\n`);
console.log(`[make-expo-fixture] plugins: ${plugins.map(p => (Array.isArray(p) ? p[0] : p)).join(', ')}`);
NODE

log "generated ${OUT} (modules: app${modules[*]+ ${modules[*]}})"
