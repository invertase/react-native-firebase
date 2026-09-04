#!/usr/bin/env bash
# Install a content-pinned npm release globally (privileged CI workflows).
# Integrity is hardcoded from registry dist.integrity at pin time — never fetch at runtime.
set -euo pipefail

NPM_VERSION="12.0.2"
# npm view npm@12.0.2 dist.integrity (recorded at pin time)
NPM_INTEGRITY="sha512-uIXokLlBj6FpNUTQX1PmT5pz7BlIN9QlixX+zdaSNHsd0qUXsbDLr50xzY6Sw7cJVr0uzHKDOle0swmPW/p5Qw=="
NPM_TGZ_URL="https://registry.npmjs.org/npm/-/npm-${NPM_VERSION}.tgz"

# engines: ^22.22.2 || ^24.15.0 || >=26.0.0 — setup-node "24" must resolve >=24.15
node --version
npm --version

TMP_DIR="$(mktemp -d)"
cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

TGZ="${TMP_DIR}/npm-${NPM_VERSION}.tgz"
curl -fsSL -o "$TGZ" "$NPM_TGZ_URL"

NPM_INTEGRITY="$NPM_INTEGRITY" node -e '
const crypto = require("crypto");
const fs = require("fs");
const expected = process.env.NPM_INTEGRITY;
const dash = expected.indexOf("-");
if (dash < 0) {
  console.error("invalid integrity (expected algo-base64)");
  process.exit(1);
}
const algo = expected.slice(0, dash);
const b64 = expected.slice(dash + 1);
const actual = crypto.createHash(algo).update(fs.readFileSync(process.argv[1])).digest("base64");
if (actual !== b64) {
  console.error("npm tarball integrity mismatch");
  console.error("expected:", expected);
  console.error("actual:  ", `${algo}-${actual}`);
  process.exit(1);
}
console.log("npm tarball integrity ok:", expected);
' "$TGZ"

npm install -g "$TGZ"

if [[ "$(npm --version)" != "$NPM_VERSION" ]]; then
  echo "npm on PATH is $(npm --version), expected ${NPM_VERSION}" >&2
  exit 1
fi

GLOBAL_ROOT="$(npm root -g)"
INSTALLED_VERSION="$(
  NPM_GLOBAL_ROOT="$GLOBAL_ROOT" node -p \
    "require(require('path').join(process.env.NPM_GLOBAL_ROOT, 'npm/package.json')).version"
)"
if [[ "$INSTALLED_VERSION" != "$NPM_VERSION" ]]; then
  echo "global npm package.json version is ${INSTALLED_VERSION}, expected ${NPM_VERSION}" >&2
  exit 1
fi

NPM_BIN="$(command -v npm)"
PREFIX_BIN="$(npm prefix -g)/bin/npm"
if [[ -e "$PREFIX_BIN" ]]; then
  NPM_REAL="$(node -p "require('fs').realpathSync(process.argv[1])" "$NPM_BIN")"
  PREFIX_REAL="$(node -p "require('fs').realpathSync(process.argv[1])" "$PREFIX_BIN")"
  if [[ "$NPM_REAL" != "$PREFIX_REAL" ]]; then
    echo "npm on PATH (${NPM_BIN} -> ${NPM_REAL}) is not the global prefix npm (${PREFIX_BIN} -> ${PREFIX_REAL})" >&2
    exit 1
  fi
fi

echo "pinned npm ${NPM_VERSION} on PATH: ${NPM_BIN}"
