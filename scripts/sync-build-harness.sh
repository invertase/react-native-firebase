#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
APP_DIR="${REPO_ROOT}/apps/build-harness"
LOCAL_CONFIG_PATH="${APP_DIR}/.build-harness.local.json"
IOS_PROJECT_PATH="${APP_DIR}/ios/BuildHarness.xcodeproj"
IOS_GOOGLE_SERVICES_DEST="${APP_DIR}/ios/BuildHarness/GoogleService-Info.plist"
ANDROID_GOOGLE_SERVICES_DEST="${APP_DIR}/android/app/google-services.json"
DEFAULT_IOS_GOOGLE_SERVICES_PATH="${HOME}/Downloads/GoogleService-Info.plist"
DEFAULT_ANDROID_GOOGLE_SERVICES_PATH="${HOME}/Downloads/google-services.json"
DEFAULT_ANDROID_APPLICATION_ID="com.invertase.testing"

RNFB_PACKAGE_NAMES=(
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

COMMAND="${1:-sync}"
if [[ $# -gt 0 ]]; then
  shift
fi

RUN_YARN_INSTALL=""
RUN_POD_INSTALL=""
RUN_CLEAN=0
RNFB_SOURCE=""
RNFB_VERSION=""
REACT_NATIVE_VERSION=""
REACT_VERSION=""
FIREBASE_JS_VERSION=""
FIREBASE_IOS_VERSION=""
FIREBASE_ANDROID_BOM=""
GOOGLE_SERVICES_GRADLE_VERSION=""
CRASHLYTICS_GRADLE_VERSION=""
PERF_GRADLE_VERSION=""
APP_DISTRIBUTION_GRADLE_VERSION=""
IOS_GOOGLE_SERVICES_PATH=""
ANDROID_GOOGLE_SERVICES_PATH=""
IOS_BUNDLE_ID=""
ANDROID_APPLICATION_ID=""
EXTRA_ARGS=()

REPO_FIREBASE_JS_VERSION=""
REPO_FIREBASE_IOS_VERSION=""
REPO_FIREBASE_ANDROID_BOM=""
REPO_GOOGLE_SERVICES_GRADLE_VERSION=""
REPO_CRASHLYTICS_GRADLE_VERSION=""
REPO_PERF_GRADLE_VERSION=""
REPO_APP_DISTRIBUTION_GRADLE_VERSION=""

LOCAL_RNFB_SOURCE=""
LOCAL_RNFB_VERSION=""
LOCAL_REACT_NATIVE_VERSION=""
LOCAL_REACT_VERSION=""
LOCAL_FIREBASE_JS_VERSION=""
LOCAL_FIREBASE_IOS_VERSION=""
LOCAL_FIREBASE_ANDROID_BOM=""
LOCAL_GOOGLE_SERVICES_GRADLE_VERSION=""
LOCAL_CRASHLYTICS_GRADLE_VERSION=""
LOCAL_PERF_GRADLE_VERSION=""
LOCAL_APP_DISTRIBUTION_GRADLE_VERSION=""
LOCAL_IOS_GOOGLE_SERVICES_PATH=""
LOCAL_ANDROID_GOOGLE_SERVICES_PATH=""
LOCAL_IOS_BUNDLE_ID=""
LOCAL_ANDROID_APPLICATION_ID=""
INFERRED_IOS_BUNDLE_ID=""
INFERRED_ANDROID_APPLICATION_ID=""

usage() {
  cat <<'EOF'
Usage: sync-build-harness.sh <command> [options] [-- extra react-native args]

Commands:
  doctor        Show effective defaults, local overrides, and prerequisite status.
  clean         Remove build products, Pods, and derived data for the harness app.
  sync          Update harness dependencies, copy Firebase config, patch iOS metadata, install deps.
  pod-install   Install iOS pods using the current or supplied overrides.
  build-ios     Sync the harness and run the iOS app.
  build-android Sync the harness and run the Android app.

Options:
  --rnfb-source <workspace|published>
  --rnfb-version <version>              Published RNFB version to install when using published source.
  --react-native <version>              Override app react-native version.
  --react <version>                     Override app react version.
  --firebase-js <version>               Override app firebase JS dependency.
  --firebase-ios <version>              Override iOS Firebase SDK version.
  --firebase-android-bom <version>      Override Android Firebase BOM version.
  --google-services-gradle <version>    Override Google Services Gradle plugin version.
  --crashlytics-gradle <version>        Override Crashlytics Gradle plugin version.
  --perf-gradle <version>               Override Performance Gradle plugin version.
  --app-distribution-gradle <version>   Override App Distribution Gradle plugin version.
  --ios-google-services <path>          Path to GoogleService-Info.plist.
  --android-google-services <path>      Path to google-services.json.
  --ios-bundle-id <bundle_id>           Override iOS bundle identifier.
  --android-application-id <id>         Override Android applicationId (namespace remains fixed).
  --clean                               Clean build artifacts before syncing or building.
  --yarn-install / --no-yarn-install    Control root dependency installation.
  --pod-install / --no-pod-install      Control pod install for sync / build-ios.
  -h, --help                            Show this help text.

Examples:
  yarn app:sync
  bash ./scripts/sync-build-harness.sh sync --firebase-ios 12.13.0 --firebase-android-bom 34.13.0
  bash ./scripts/sync-build-harness.sh build-ios --ios-google-services "$HOME/Downloads/GoogleService-Info.plist"
  bash ./scripts/sync-build-harness.sh build-android --rnfb-source published --rnfb-version 24.0.0
EOF
}

die() {
  echo "sync-build-harness: $*" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --)
      shift
      EXTRA_ARGS=("$@")
      break
      ;;
    --rnfb-source)
      RNFB_SOURCE="${2:?}"
      shift 2
      ;;
    --rnfb-version)
      RNFB_VERSION="${2:?}"
      shift 2
      ;;
    --react-native)
      REACT_NATIVE_VERSION="${2:?}"
      shift 2
      ;;
    --react)
      REACT_VERSION="${2:?}"
      shift 2
      ;;
    --firebase-js)
      FIREBASE_JS_VERSION="${2:?}"
      shift 2
      ;;
    --firebase-ios)
      FIREBASE_IOS_VERSION="${2:?}"
      shift 2
      ;;
    --firebase-android-bom)
      FIREBASE_ANDROID_BOM="${2:?}"
      shift 2
      ;;
    --google-services-gradle)
      GOOGLE_SERVICES_GRADLE_VERSION="${2:?}"
      shift 2
      ;;
    --crashlytics-gradle)
      CRASHLYTICS_GRADLE_VERSION="${2:?}"
      shift 2
      ;;
    --perf-gradle)
      PERF_GRADLE_VERSION="${2:?}"
      shift 2
      ;;
    --app-distribution-gradle)
      APP_DISTRIBUTION_GRADLE_VERSION="${2:?}"
      shift 2
      ;;
    --ios-google-services)
      IOS_GOOGLE_SERVICES_PATH="${2:?}"
      shift 2
      ;;
    --android-google-services)
      ANDROID_GOOGLE_SERVICES_PATH="${2:?}"
      shift 2
      ;;
    --ios-bundle-id)
      IOS_BUNDLE_ID="${2:?}"
      shift 2
      ;;
    --android-application-id)
      ANDROID_APPLICATION_ID="${2:?}"
      shift 2
      ;;
    --clean)
      RUN_CLEAN=1
      shift
      ;;
    --yarn-install)
      RUN_YARN_INSTALL=1
      shift
      ;;
    --no-yarn-install)
      RUN_YARN_INSTALL=0
      shift
      ;;
    --pod-install)
      RUN_POD_INSTALL=1
      shift
      ;;
    --no-pod-install)
      RUN_POD_INSTALL=0
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      die "unknown option: $1"
      ;;
  esac
done

if [[ ! -d "${APP_DIR}" ]]; then
  die "app directory not found at ${APP_DIR}"
fi

read_repo_defaults() {
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
    node - "${REPO_ROOT}" <<'NODE'
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

  [[ -n "${REPO_FIREBASE_JS_VERSION}" ]] || die "failed to read firebase JS version from packages/app/package.json"
  [[ -n "${REPO_FIREBASE_IOS_VERSION}" ]] || die "failed to read firebase iOS version from packages/app/package.json"
  [[ -n "${REPO_FIREBASE_ANDROID_BOM}" ]] || die "failed to read firebase Android BOM from packages/app/package.json"
  [[ -n "${REPO_GOOGLE_SERVICES_GRADLE_VERSION}" ]] || die "failed to read Google Services Gradle version from packages/app/package.json"
  [[ -n "${REPO_CRASHLYTICS_GRADLE_VERSION}" ]] || die "failed to read Crashlytics Gradle version from packages/app/package.json"
  [[ -n "${REPO_PERF_GRADLE_VERSION}" ]] || die "failed to read Perf Gradle version from packages/app/package.json"
  [[ -n "${REPO_APP_DISTRIBUTION_GRADLE_VERSION}" ]] || die "failed to read App Distribution Gradle version from packages/app/package.json"
}

load_local_config() {
  if [[ ! -f "${LOCAL_CONFIG_PATH}" ]]; then
    return
  fi

  while IFS='=' read -r key value; do
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
    node - "${LOCAL_CONFIG_PATH}" <<'NODE'
const fs = require('fs');
const configPath = process.argv[2];
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
for (const [key, value] of Object.entries(config)) {
  if (value !== undefined && value !== null && value !== '') {
    console.log(`${key}=${value}`);
  }
}
NODE
  )
}

detect_ios_bundle_id() {
  local plist_path="$1"
  if [[ -f "${plist_path}" && "$(uname)" == "Darwin" ]]; then
    /usr/libexec/PlistBuddy -c "Print BUNDLE_ID" "${plist_path}" 2>/dev/null || true
  fi
}

detect_android_application_id() {
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

resolve_effective_config() {
  read_repo_defaults
  load_local_config

  if [[ -z "${RNFB_SOURCE}" ]]; then
    RNFB_SOURCE="${LOCAL_RNFB_SOURCE:-workspace}"
  fi
  if [[ -n "${RNFB_VERSION}" && "${RNFB_SOURCE}" == "workspace" ]]; then
    RNFB_SOURCE="published"
  fi
  if [[ -z "${RNFB_VERSION}" ]]; then
    RNFB_VERSION="${LOCAL_RNFB_VERSION}"
  fi

  if [[ -z "${REACT_NATIVE_VERSION}" ]]; then
    REACT_NATIVE_VERSION="${LOCAL_REACT_NATIVE_VERSION}"
  fi
  if [[ -z "${REACT_VERSION}" ]]; then
    REACT_VERSION="${LOCAL_REACT_VERSION}"
  fi

  if [[ -z "${FIREBASE_JS_VERSION}" ]]; then
    FIREBASE_JS_VERSION="${LOCAL_FIREBASE_JS_VERSION:-${REPO_FIREBASE_JS_VERSION}}"
  fi
  if [[ -z "${FIREBASE_IOS_VERSION}" ]]; then
    FIREBASE_IOS_VERSION="${LOCAL_FIREBASE_IOS_VERSION:-${REPO_FIREBASE_IOS_VERSION}}"
  fi
  if [[ -z "${FIREBASE_ANDROID_BOM}" ]]; then
    FIREBASE_ANDROID_BOM="${LOCAL_FIREBASE_ANDROID_BOM:-${REPO_FIREBASE_ANDROID_BOM}}"
  fi
  if [[ -z "${GOOGLE_SERVICES_GRADLE_VERSION}" ]]; then
    GOOGLE_SERVICES_GRADLE_VERSION="${LOCAL_GOOGLE_SERVICES_GRADLE_VERSION:-${REPO_GOOGLE_SERVICES_GRADLE_VERSION}}"
  fi
  if [[ -z "${CRASHLYTICS_GRADLE_VERSION}" ]]; then
    CRASHLYTICS_GRADLE_VERSION="${LOCAL_CRASHLYTICS_GRADLE_VERSION:-${REPO_CRASHLYTICS_GRADLE_VERSION}}"
  fi
  if [[ -z "${PERF_GRADLE_VERSION}" ]]; then
    PERF_GRADLE_VERSION="${LOCAL_PERF_GRADLE_VERSION:-${REPO_PERF_GRADLE_VERSION}}"
  fi
  if [[ -z "${APP_DISTRIBUTION_GRADLE_VERSION}" ]]; then
    APP_DISTRIBUTION_GRADLE_VERSION="${LOCAL_APP_DISTRIBUTION_GRADLE_VERSION:-${REPO_APP_DISTRIBUTION_GRADLE_VERSION}}"
  fi

  if [[ -z "${IOS_GOOGLE_SERVICES_PATH}" ]]; then
    IOS_GOOGLE_SERVICES_PATH="${LOCAL_IOS_GOOGLE_SERVICES_PATH:-${DEFAULT_IOS_GOOGLE_SERVICES_PATH}}"
  fi
  if [[ -z "${ANDROID_GOOGLE_SERVICES_PATH}" ]]; then
    ANDROID_GOOGLE_SERVICES_PATH="${LOCAL_ANDROID_GOOGLE_SERVICES_PATH:-${DEFAULT_ANDROID_GOOGLE_SERVICES_PATH}}"
  fi

  if [[ -z "${IOS_BUNDLE_ID}" ]]; then
    INFERRED_IOS_BUNDLE_ID="$(detect_ios_bundle_id "${IOS_GOOGLE_SERVICES_PATH}")"
    IOS_BUNDLE_ID="${LOCAL_IOS_BUNDLE_ID:-${INFERRED_IOS_BUNDLE_ID}}"
  fi
  if [[ -z "${IOS_BUNDLE_ID}" ]]; then
    IOS_BUNDLE_ID="io.invertase.react-native-demo"
  fi

  if [[ -z "${ANDROID_APPLICATION_ID}" ]]; then
    if ! INFERRED_ANDROID_APPLICATION_ID="$(detect_android_application_id "${ANDROID_GOOGLE_SERVICES_PATH}")"; then
      die "unable to parse Android applicationId from ${ANDROID_GOOGLE_SERVICES_PATH}"
    fi
    ANDROID_APPLICATION_ID="${LOCAL_ANDROID_APPLICATION_ID:-${INFERRED_ANDROID_APPLICATION_ID}}"
  fi
  if [[ -z "${ANDROID_APPLICATION_ID}" ]]; then
    ANDROID_APPLICATION_ID="${DEFAULT_ANDROID_APPLICATION_ID}"
  fi

  if [[ -z "${RUN_YARN_INSTALL}" ]]; then
    RUN_YARN_INSTALL=1
  fi
  if [[ -z "${RUN_POD_INSTALL}" ]]; then
    case "${COMMAND}" in
      sync | pod-install | build-ios)
        RUN_POD_INSTALL=1
        ;;
      *)
        RUN_POD_INSTALL=0
        ;;
    esac
  fi

  if [[ "${RNFB_SOURCE}" != "workspace" && "${RNFB_SOURCE}" != "published" ]]; then
    die "--rnfb-source must be 'workspace' or 'published'"
  fi
  if [[ "${RNFB_SOURCE}" == "published" && -z "${RNFB_VERSION}" ]]; then
    die "--rnfb-version is required when --rnfb-source published is used"
  fi
}

write_local_config() {
  node - "${LOCAL_CONFIG_PATH}" <<'NODE'
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
  env.INFERRED_IOS_BUNDLE_ID || 'io.invertase.react-native-demo',
);
assignIfDifferent(
  'androidApplicationId',
  env.ANDROID_APPLICATION_ID,
  env.INFERRED_ANDROID_APPLICATION_ID || env.DEFAULT_ANDROID_APPLICATION_ID,
);

fs.writeFileSync(outputPath, JSON.stringify(config, null, 2) + '\n');
NODE
}

ensure_google_services_files() {
  [[ -f "${IOS_GOOGLE_SERVICES_PATH}" ]] || die "missing iOS GoogleService file at ${IOS_GOOGLE_SERVICES_PATH}"
  [[ -f "${ANDROID_GOOGLE_SERVICES_PATH}" ]] || die "missing Android google-services.json at ${ANDROID_GOOGLE_SERVICES_PATH}"

  cp "${IOS_GOOGLE_SERVICES_PATH}" "${IOS_GOOGLE_SERVICES_DEST}"
  cp "${ANDROID_GOOGLE_SERVICES_PATH}" "${ANDROID_GOOGLE_SERVICES_DEST}"
}

apply_ios_project_config() {
  (
    cd "${APP_DIR}"
    bundle check >/dev/null 2>&1 || bundle install
    bundle exec ruby - "${IOS_PROJECT_PATH}" "${IOS_BUNDLE_ID}" <<'RUBY'
require 'xcodeproj'

project_path = ARGV.fetch(0)
bundle_id = ARGV.fetch(1)
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |item| item.name == 'BuildHarness' }
abort('Unable to locate BuildHarness target') unless target

group = project.main_group.find_subpath('BuildHarness', true)
file_ref = group.files.find { |file| file.path == 'GoogleService-Info.plist' } || group.new_file('GoogleService-Info.plist')

unless target.resources_build_phase.files_references.any? { |reference| reference.path == 'GoogleService-Info.plist' }
  target.resources_build_phase.add_file_reference(file_ref, true)
end

target.build_configurations.each do |config|
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = bundle_id
end

project.save
RUBY
  )
}

update_harness_package_json() {
  export BUILD_HARNESS_APP_PACKAGE_JSON="${APP_DIR}/package.json"
  export BUILD_HARNESS_RNFB_SOURCE="${RNFB_SOURCE}"
  export BUILD_HARNESS_RNFB_VERSION="${RNFB_VERSION}"
  export BUILD_HARNESS_REACT_NATIVE_VERSION="${REACT_NATIVE_VERSION}"
  export BUILD_HARNESS_REACT_VERSION="${REACT_VERSION}"
  export BUILD_HARNESS_FIREBASE_JS_VERSION="${FIREBASE_JS_VERSION}"

  node <<'NODE'
const fs = require('fs');

const packageJsonPath = process.env.BUILD_HARNESS_APP_PACKAGE_JSON;
const source = process.env.BUILD_HARNESS_RNFB_SOURCE;
const rnfbVersion = process.env.BUILD_HARNESS_RNFB_VERSION;
const reactNativeVersion = process.env.BUILD_HARNESS_REACT_NATIVE_VERSION;
const reactVersion = process.env.BUILD_HARNESS_REACT_VERSION;
const firebaseJsVersion = process.env.BUILD_HARNESS_FIREBASE_JS_VERSION;

const rnfbPackages = [
  'ai',
  'analytics',
  'app',
  'app-check',
  'app-distribution',
  'auth',
  'crashlytics',
  'database',
  'firestore',
  'functions',
  'in-app-messaging',
  'installations',
  'messaging',
  'ml',
  'perf',
  'remote-config',
  'storage',
];

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
  pkg.devDependencies['@react-native/babel-preset'] = reactNativeVersion;
  pkg.devDependencies['@react-native/eslint-config'] = reactNativeVersion;
  pkg.devDependencies['@react-native/metro-config'] = reactNativeVersion;
  pkg.devDependencies['@react-native/typescript-config'] = reactNativeVersion;
}

if (reactVersion) {
  pkg.dependencies.react = reactVersion;
  pkg.devDependencies['react-test-renderer'] = reactVersion;
}

fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
NODE
}

install_dependencies() {
  if [[ "${RUN_YARN_INSTALL}" != "1" ]]; then
    return
  fi

  (
    cd "${REPO_ROOT}"
    yarn
    if [[ "${RNFB_SOURCE}" == "workspace" ]]; then
      yarn lerna:prepare
    fi
  )
}

pod_install() {
  export_build_env
  (
    cd "${APP_DIR}"
    bundle check >/dev/null 2>&1 || bundle install
    cd ios
    bundle exec pod install
  )
}

export_build_env() {
  export RNFB_FIREBASE_IOS_SDK="${FIREBASE_IOS_VERSION}"
  export FIREBASE_SDK_VERSION="${FIREBASE_IOS_VERSION}"
  export RNFB_FIREBASE_ANDROID_BOM="${FIREBASE_ANDROID_BOM}"
  export RNFB_GOOGLE_SERVICES_GRADLE="${GOOGLE_SERVICES_GRADLE_VERSION}"
  export RNFB_CRASHLYTICS_GRADLE="${CRASHLYTICS_GRADLE_VERSION}"
  export RNFB_PERF_GRADLE="${PERF_GRADLE_VERSION}"
  export RNFB_APP_DISTRIBUTION_GRADLE="${APP_DISTRIBUTION_GRADLE_VERSION}"
  export RNFB_BUILD_HARNESS_ANDROID_APPLICATION_ID="${ANDROID_APPLICATION_ID}"
}

clean_harness() {
  rm -rf \
    "${APP_DIR}/android/.gradle" \
    "${APP_DIR}/android/app/build" \
    "${APP_DIR}/android/build" \
    "${APP_DIR}/ios/Pods" \
    "${APP_DIR}/ios/build" \
    "${APP_DIR}/ios/Podfile.lock"

  if [[ "$(uname)" == "Darwin" ]]; then
    rm -rf "${HOME}/Library/Developer/Xcode/DerivedData"/BuildHarness-*
  fi
}

prepare_harness() {
  resolve_effective_config
  export RNFB_SOURCE
  export RNFB_VERSION
  export REACT_NATIVE_VERSION
  export REACT_VERSION
  export FIREBASE_JS_VERSION
  export FIREBASE_IOS_VERSION
  export FIREBASE_ANDROID_BOM
  export GOOGLE_SERVICES_GRADLE_VERSION
  export CRASHLYTICS_GRADLE_VERSION
  export PERF_GRADLE_VERSION
  export APP_DISTRIBUTION_GRADLE_VERSION
  export IOS_GOOGLE_SERVICES_PATH
  export ANDROID_GOOGLE_SERVICES_PATH
  export IOS_BUNDLE_ID
  export ANDROID_APPLICATION_ID
  export REPO_FIREBASE_JS_VERSION
  export REPO_FIREBASE_IOS_VERSION
  export REPO_FIREBASE_ANDROID_BOM
  export REPO_GOOGLE_SERVICES_GRADLE_VERSION
  export REPO_CRASHLYTICS_GRADLE_VERSION
  export REPO_PERF_GRADLE_VERSION
  export REPO_APP_DISTRIBUTION_GRADLE_VERSION
  export DEFAULT_IOS_GOOGLE_SERVICES_PATH
  export DEFAULT_ANDROID_GOOGLE_SERVICES_PATH
  export DEFAULT_ANDROID_APPLICATION_ID
  export INFERRED_IOS_BUNDLE_ID
  export INFERRED_ANDROID_APPLICATION_ID

  if [[ "${RUN_CLEAN}" == "1" ]]; then
    clean_harness
  fi

  update_harness_package_json
  write_local_config
  install_dependencies
  ensure_google_services_files
  if [[ "$(uname)" == "Darwin" ]]; then
    apply_ios_project_config
  fi

  if [[ "${RUN_POD_INSTALL}" == "1" ]]; then
    pod_install
  fi
}

doctor() {
  resolve_effective_config

  echo "Repo root: ${REPO_ROOT}"
  echo "Harness app: ${APP_DIR}"
  echo "Local config: ${LOCAL_CONFIG_PATH}"
  echo
  echo "Source defaults:"
  echo "  RNFB source: ${RNFB_SOURCE}"
  echo "  RNFB version override: ${RNFB_VERSION:-workspace packages}"
  echo "  Firebase JS: ${FIREBASE_JS_VERSION}"
  echo "  Firebase iOS SDK: ${FIREBASE_IOS_VERSION}"
  echo "  Firebase Android BOM: ${FIREBASE_ANDROID_BOM}"
  echo "  Google Services Gradle: ${GOOGLE_SERVICES_GRADLE_VERSION}"
  echo "  Crashlytics Gradle: ${CRASHLYTICS_GRADLE_VERSION}"
  echo "  Perf Gradle: ${PERF_GRADLE_VERSION}"
  echo "  App Distribution Gradle: ${APP_DISTRIBUTION_GRADLE_VERSION}"
  echo "  iOS bundle ID: ${IOS_BUNDLE_ID}"
  echo "  Android applicationId: ${ANDROID_APPLICATION_ID}"
  echo "  iOS GoogleService path: ${IOS_GOOGLE_SERVICES_PATH}"
  echo "  Android GoogleService path: ${ANDROID_GOOGLE_SERVICES_PATH}"
  echo
  echo "Prerequisites:"
  for command_name in node yarn ruby; do
    if command -v "${command_name}" >/dev/null 2>&1; then
      echo "  ${command_name}: ok"
    else
      echo "  ${command_name}: missing"
    fi
  done
  if [[ "$(uname)" == "Darwin" ]]; then
    if command -v pod >/dev/null 2>&1; then
      echo "  pod: ok"
    else
      echo "  pod: missing"
    fi
  fi
  echo
  echo "Config files:"
  [[ -f "${IOS_GOOGLE_SERVICES_PATH}" ]] && echo "  iOS plist: present" || echo "  iOS plist: missing"
  [[ -f "${ANDROID_GOOGLE_SERVICES_PATH}" ]] && echo "  Android json: present" || echo "  Android json: missing"
}

build_ios() {
  prepare_harness
  export_build_env
  (
    cd "${APP_DIR}"
    yarn react-native run-ios "${EXTRA_ARGS[@]}"
  )
}

build_android() {
  prepare_harness
  export_build_env
  (
    cd "${APP_DIR}"
    yarn react-native run-android "${EXTRA_ARGS[@]}"
  )
}

case "${COMMAND}" in
  doctor)
    doctor
    ;;
  clean)
    clean_harness
    ;;
  sync)
    prepare_harness
    ;;
  pod-install)
    prepare_harness
    ;;
  build-ios)
    build_ios
    ;;
  build-android)
    build_android
    ;;
  *)
    usage
    die "unknown command: ${COMMAND}"
    ;;
esac
