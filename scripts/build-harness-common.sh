#!/usr/bin/env bash

HARNESS_DEFAULT_IOS_GOOGLE_SERVICES_PATH="${HOME}/Downloads/GoogleService-Info.plist"
HARNESS_DEFAULT_ANDROID_GOOGLE_SERVICES_PATH="${HOME}/Downloads/google-services.json"
HARNESS_DEFAULT_IOS_BUNDLE_ID="io.invertase.react-native-demo"
HARNESS_DEFAULT_ANDROID_APPLICATION_ID="com.invertase.testing"

HARNESS_RNFB_PACKAGE_NAMES=(
  ai
  analytics
  app
  app-check
  app-distribution
  auth
  crashlytics
  database
  firestore
  functions
  in-app-messaging
  installations
  messaging
  ml
  perf
  remote-config
  storage
)

harness_die() {
  echo "build-harness: $*" >&2
  exit 1
}

harness_read_repo_defaults() {
  local repo_root="$1"

  while IFS='=' read -r key value; do
    case "${key}" in
      firebaseJs) REPO_FIREBASE_JS_VERSION="${value}" ;;
      firebaseIos) REPO_FIREBASE_IOS_VERSION="${value}" ;;
      firebaseAndroidBom) REPO_FIREBASE_ANDROID_BOM="${value}" ;;
      googleServicesGradle) REPO_GOOGLE_SERVICES_GRADLE_VERSION="${value}" ;;
      crashlyticsGradle) REPO_CRASHLYTICS_GRADLE_VERSION="${value}" ;;
      perfGradle) REPO_PERF_GRADLE_VERSION="${value}" ;;
      appDistributionGradle) REPO_APP_DISTRIBUTION_GRADLE_VERSION="${value}" ;;
    esac
  done < <(
    node - "${repo_root}" <<'NODE'
const fs = require('fs');
const path = require('path');
const repoRoot = process.argv[2];
const pkg = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'packages', 'app', 'package.json'), 'utf8'),
);
const android = pkg.sdkVersions.android;
console.log(`firebaseJs=${pkg.dependencies.firebase}`);
console.log(`firebaseIos=${pkg.sdkVersions.ios.firebase}`);
console.log(`firebaseAndroidBom=${android.firebase}`);
console.log(`googleServicesGradle=${android.gmsGoogleServicesGradle}`);
console.log(`crashlyticsGradle=${android.firebaseCrashlyticsGradle}`);
console.log(`perfGradle=${android.firebasePerfGradle}`);
console.log(`appDistributionGradle=${android.firebaseAppDistributionGradle}`);
NODE
  )

  [[ -n "${REPO_FIREBASE_JS_VERSION:-}" ]] || harness_die "failed to read firebase JS version from packages/app/package.json"
  [[ -n "${REPO_FIREBASE_IOS_VERSION:-}" ]] || harness_die "failed to read firebase iOS version from packages/app/package.json"
  [[ -n "${REPO_FIREBASE_ANDROID_BOM:-}" ]] || harness_die "failed to read firebase Android BOM from packages/app/package.json"
  [[ -n "${REPO_GOOGLE_SERVICES_GRADLE_VERSION:-}" ]] || harness_die "failed to read Google Services Gradle version from packages/app/package.json"
  [[ -n "${REPO_CRASHLYTICS_GRADLE_VERSION:-}" ]] || harness_die "failed to read Crashlytics Gradle version from packages/app/package.json"
  [[ -n "${REPO_PERF_GRADLE_VERSION:-}" ]] || harness_die "failed to read Perf Gradle version from packages/app/package.json"
  [[ -n "${REPO_APP_DISTRIBUTION_GRADLE_VERSION:-}" ]] || harness_die "failed to read App Distribution Gradle version from packages/app/package.json"
}

harness_load_local_config() {
  local local_config_path="$1"

  if [[ ! -f "${local_config_path}" ]]; then
    return
  fi

  while IFS=$'\t' read -r key value; do
    case "${key}" in
      rnfbSource) LOCAL_RNFB_SOURCE="${value}" ;;
      rnfbVersion) LOCAL_RNFB_VERSION="${value}" ;;
      reactNativeVersion) LOCAL_REACT_NATIVE_VERSION="${value}" ;;
      reactVersion) LOCAL_REACT_VERSION="${value}" ;;
      firebaseJsVersion) LOCAL_FIREBASE_JS_VERSION="${value}" ;;
      firebaseIosVersion) LOCAL_FIREBASE_IOS_VERSION="${value}" ;;
      firebaseAndroidBom) LOCAL_FIREBASE_ANDROID_BOM="${value}" ;;
      googleServicesGradleVersion) LOCAL_GOOGLE_SERVICES_GRADLE_VERSION="${value}" ;;
      crashlyticsGradleVersion) LOCAL_CRASHLYTICS_GRADLE_VERSION="${value}" ;;
      perfGradleVersion) LOCAL_PERF_GRADLE_VERSION="${value}" ;;
      appDistributionGradleVersion) LOCAL_APP_DISTRIBUTION_GRADLE_VERSION="${value}" ;;
      iosGoogleServicesPath) LOCAL_IOS_GOOGLE_SERVICES_PATH="${value}" ;;
      androidGoogleServicesPath) LOCAL_ANDROID_GOOGLE_SERVICES_PATH="${value}" ;;
      iosBundleId) LOCAL_IOS_BUNDLE_ID="${value}" ;;
      androidApplicationId) LOCAL_ANDROID_APPLICATION_ID="${value}" ;;
    esac
  done < <(
    node - "${local_config_path}" <<'NODE'
const fs = require('fs');
const configPath = process.argv[2];
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
for (const [key, value] of Object.entries(config)) {
  if (value !== undefined && value !== null && value !== '') {
    console.log(`${key}\t${value}`);
  }
}
NODE
  )
}

harness_detect_ios_bundle_id() {
  local plist_path="$1"
  if [[ -f "${plist_path}" && "$(uname)" == "Darwin" ]]; then
    /usr/libexec/PlistBuddy -c "Print BUNDLE_ID" "${plist_path}" 2>/dev/null || true
  fi
}

harness_detect_android_application_id() {
  local json_path="$1"
  if [[ ! -f "${json_path}" ]]; then
    return
  fi

  node - "${json_path}" <<'NODE'
const fs = require('fs');
const configPath = process.argv[2];
try {
  const json = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const packages = (json.client || [])
    .map(client => client.client_info?.android_client_info?.package_name)
    .filter(Boolean);

  const preferred = packages.find(name => name === 'com.invertase.testing');
  process.stdout.write(preferred || packages[0] || '');
} catch (error) {
  console.error(`Invalid google-services.json at ${configPath}: ${error.message}`);
  process.exit(1);
}
NODE
}

harness_print_ruby_prereq_status() {
  local app_dir="$1"
  local gemfile_lock_path="${app_dir}/Gemfile.lock"
  local ruby_path=""
  local ruby_version=""
  local bundle_path=""
  local bundle_version=""
  local required_bundler_version=""

  if command -v ruby >/dev/null 2>&1; then
    ruby_path="$(command -v ruby)"
    ruby_version="$(ruby --version 2>/dev/null | awk '{print $2}')"
    if [[ "${ruby_path}" == "${HOME}"/.rbenv/shims/* ]]; then
      echo "  ruby: ok (${ruby_version} via rbenv)"
    elif [[ "${ruby_path}" == "/usr/bin/ruby" || "${ruby_path}" == /System/* ]]; then
      echo "  ruby: ok (${ruby_version} via system Ruby; user-managed Ruby like rbenv recommended)"
    else
      echo "  ruby: ok (${ruby_version} at ${ruby_path})"
    fi
  else
    echo "  ruby: missing"
    return
  fi

  if command -v bundle >/dev/null 2>&1; then
    bundle_path="$(command -v bundle)"
    bundle_version="$(bundle --version 2>/dev/null | awk '{print $3}')"
  fi

  if [[ -f "${gemfile_lock_path}" ]]; then
    required_bundler_version="$(
      awk '
        /^BUNDLED WITH$/ {
          getline
          gsub(/^[[:space:]]+/, "", $0)
          print $0
        }
      ' "${gemfile_lock_path}"
    )"
  fi

  if [[ -z "${bundle_path}" || -z "${bundle_version}" ]]; then
    if [[ -n "${required_bundler_version}" ]]; then
      echo "  bundle: missing (need ${required_bundler_version} from ${gemfile_lock_path})"
    else
      echo "  bundle: missing"
    fi
    return
  fi

  if [[ -n "${required_bundler_version}" && "${bundle_version}" != "${required_bundler_version}" ]]; then
    echo "  bundle: mismatch (have ${bundle_version}, need ${required_bundler_version} from ${gemfile_lock_path})"
  else
    if [[ "${bundle_path}" == "${HOME}"/.rbenv/shims/* ]]; then
      echo "  bundle: ok (${bundle_version} via rbenv)"
    else
      echo "  bundle: ok (${bundle_version})"
    fi
  fi
}

harness_write_local_config() {
  local local_config_path="$1"

  node - "${local_config_path}" <<'NODE'
const fs = require('fs');
const outputPath = process.argv[2];
const env = process.env;
const config = {};
const assignIfDifferent = (key, value, baseline) => {
  if (value && value !== baseline) {
    config[key] = value;
  }
};

if (env.RNFB_SOURCE === 'published') {
  config.rnfbSource = env.RNFB_SOURCE;
}
if (env.RNFB_VERSION) {
  config.rnfbVersion = env.RNFB_VERSION;
}
if (env.REACT_NATIVE_VERSION) {
  config.reactNativeVersion = env.REACT_NATIVE_VERSION;
}
if (env.REACT_VERSION) {
  config.reactVersion = env.REACT_VERSION;
}

assignIfDifferent('firebaseJsVersion', env.FIREBASE_JS_VERSION, env.REPO_FIREBASE_JS_VERSION);
assignIfDifferent('firebaseIosVersion', env.FIREBASE_IOS_VERSION, env.REPO_FIREBASE_IOS_VERSION);
assignIfDifferent('firebaseAndroidBom', env.FIREBASE_ANDROID_BOM, env.REPO_FIREBASE_ANDROID_BOM);
assignIfDifferent(
  'googleServicesGradleVersion',
  env.GOOGLE_SERVICES_GRADLE_VERSION,
  env.REPO_GOOGLE_SERVICES_GRADLE_VERSION,
);
assignIfDifferent(
  'crashlyticsGradleVersion',
  env.CRASHLYTICS_GRADLE_VERSION,
  env.REPO_CRASHLYTICS_GRADLE_VERSION,
);
assignIfDifferent('perfGradleVersion', env.PERF_GRADLE_VERSION, env.REPO_PERF_GRADLE_VERSION);
assignIfDifferent(
  'appDistributionGradleVersion',
  env.APP_DISTRIBUTION_GRADLE_VERSION,
  env.REPO_APP_DISTRIBUTION_GRADLE_VERSION,
);
assignIfDifferent(
  'iosGoogleServicesPath',
  env.IOS_GOOGLE_SERVICES_PATH,
  env.DEFAULT_IOS_GOOGLE_SERVICES_PATH,
);
assignIfDifferent(
  'androidGoogleServicesPath',
  env.ANDROID_GOOGLE_SERVICES_PATH,
  env.DEFAULT_ANDROID_GOOGLE_SERVICES_PATH,
);
assignIfDifferent(
  'iosBundleId',
  env.IOS_BUNDLE_ID,
  env.INFERRED_IOS_BUNDLE_ID || env.DEFAULT_IOS_BUNDLE_ID,
);
assignIfDifferent(
  'androidApplicationId',
  env.ANDROID_APPLICATION_ID,
  env.INFERRED_ANDROID_APPLICATION_ID || env.DEFAULT_ANDROID_APPLICATION_ID,
);

fs.writeFileSync(outputPath, JSON.stringify(config, null, 2) + '\n');
NODE
}

harness_copy_google_services_files() {
  local ios_source="$1"
  local ios_dest="$2"
  local android_source="$3"
  local android_dest="$4"

  [[ -f "${ios_source}" ]] || harness_die "missing iOS GoogleService file at ${ios_source}"
  [[ -f "${android_source}" ]] || harness_die "missing Android google-services.json at ${android_source}"

  cp "${ios_source}" "${ios_dest}"
  cp "${android_source}" "${android_dest}"
}

harness_update_package_json() {
  local package_json_path="$1"

  export BUILD_HARNESS_APP_PACKAGE_JSON="${package_json_path}"
  export BUILD_HARNESS_RNFB_SOURCE="${RNFB_SOURCE}"
  export BUILD_HARNESS_RNFB_VERSION="${RNFB_VERSION}"
  export BUILD_HARNESS_REACT_NATIVE_VERSION="${REACT_NATIVE_VERSION}"
  export BUILD_HARNESS_REACT_VERSION="${REACT_VERSION}"
  export BUILD_HARNESS_FIREBASE_JS_VERSION="${FIREBASE_JS_VERSION}"
  export BUILD_HARNESS_RNFB_PACKAGES="$(IFS=,; echo "${HARNESS_RNFB_PACKAGE_NAMES[*]}")"

  node <<'NODE'
const fs = require('fs');

const packageJsonPath = process.env.BUILD_HARNESS_APP_PACKAGE_JSON;
const source = process.env.BUILD_HARNESS_RNFB_SOURCE;
const rnfbVersion = process.env.BUILD_HARNESS_RNFB_VERSION;
const reactNativeVersion = process.env.BUILD_HARNESS_REACT_NATIVE_VERSION;
const reactVersion = process.env.BUILD_HARNESS_REACT_VERSION;
const firebaseJsVersion = process.env.BUILD_HARNESS_FIREBASE_JS_VERSION;
const rnfbPackages = (process.env.BUILD_HARNESS_RNFB_PACKAGES || '')
  .split(',')
  .filter(Boolean);

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const rnfbSpec = source === 'workspace' ? 'workspace:*' : rnfbVersion;
if (!rnfbSpec) {
  throw new Error('Published RNFB mode requires an explicit version.');
}

for (const packageName of rnfbPackages) {
  pkg.dependencies[`@react-native-firebase/${packageName}`] = rnfbSpec;
}

if (firebaseJsVersion) {
  pkg.dependencies.firebase = firebaseJsVersion;
}

if (reactNativeVersion) {
  pkg.dependencies['react-native'] = reactNativeVersion;
  if (pkg.devDependencies?.['@react-native/babel-preset']) {
    pkg.devDependencies['@react-native/babel-preset'] = reactNativeVersion;
  }
  if (pkg.devDependencies?.['@react-native/eslint-config']) {
    pkg.devDependencies['@react-native/eslint-config'] = reactNativeVersion;
  }
  if (pkg.devDependencies?.['@react-native/metro-config']) {
    pkg.devDependencies['@react-native/metro-config'] = reactNativeVersion;
  }
  if (pkg.devDependencies?.['@react-native/typescript-config']) {
    pkg.devDependencies['@react-native/typescript-config'] = reactNativeVersion;
  }
}

if (reactVersion) {
  pkg.dependencies.react = reactVersion;
  if (pkg.devDependencies?.['react-test-renderer']) {
    pkg.devDependencies['react-test-renderer'] = reactVersion;
  }
}

fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
NODE
}

harness_run_root_yarn_install() {
  local repo_root="$1"
  local install_log

  install_log="$(mktemp)"

  set +e
  (
    cd "${repo_root}"
    yarn 2>&1 | tee "${install_log}"
  )
  local yarn_exit_code=${PIPESTATUS[0]}
  set -e

  if [[ "${yarn_exit_code}" -ne 0 ]]; then
    if grep -qE "patches/@firebase\\+rules-unit-testing\\+|patches/react-native-macos\\+" "${install_log}"; then
      echo "build-harness: continuing after known tests workspace patch-package failures during yarn install" >&2
    else
      rm -f "${install_log}"
      harness_die "yarn install failed"
    fi
  fi

  rm -f "${install_log}"
}
