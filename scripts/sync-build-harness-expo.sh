#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
source "${SCRIPT_DIR}/build-harness-common.sh"

APP_DIR="${REPO_ROOT}/apps/build-harness-expo"
LOCAL_CONFIG_PATH="${APP_DIR}/.build-harness.local.json"
IOS_GOOGLE_SERVICES_DEST="${APP_DIR}/GoogleService-Info.plist"
ANDROID_GOOGLE_SERVICES_DEST="${APP_DIR}/google-services.json"
DEFAULT_IOS_GOOGLE_SERVICES_PATH="${HARNESS_DEFAULT_IOS_GOOGLE_SERVICES_PATH}"
DEFAULT_ANDROID_GOOGLE_SERVICES_PATH="${HARNESS_DEFAULT_ANDROID_GOOGLE_SERVICES_PATH}"
DEFAULT_IOS_BUNDLE_ID="${HARNESS_DEFAULT_IOS_BUNDLE_ID}"
DEFAULT_ANDROID_APPLICATION_ID="${HARNESS_DEFAULT_ANDROID_APPLICATION_ID}"

COMMAND="${1:-sync}"
if [[ $# -gt 0 ]]; then
  shift
fi

RUN_YARN_INSTALL=""
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
Usage: sync-build-harness-expo.sh <command> [options] [-- extra expo args]

Commands:
  doctor        Show effective defaults, local overrides, and prerequisite status.
  clean         Remove generated native projects and local build artifacts for the Expo harness.
  sync          Update harness dependencies, copy Firebase config, and validate Expo config.
  start         Start the Expo bundler with the workspace plugin resolution path configured.
  build-ios     Sync the harness, run expo prebuild for iOS, then build with expo run:ios.
  build-android Sync the harness, run expo prebuild for Android, then build with expo run:android.

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
  --ios-bundle-id <bundle_id>           Override Expo iOS bundle identifier.
  --android-application-id <id>         Override Expo Android package/applicationId.
  --clean                               Clean generated native projects before syncing or building.
  --yarn-install / --no-yarn-install    Control root dependency installation.
  -h, --help                            Show this help text.

Examples:
  yarn app:expo:sync
  bash ./scripts/sync-build-harness-expo.sh sync --firebase-ios 12.13.0 --firebase-android-bom 34.13.0
  bash ./scripts/sync-build-harness-expo.sh build-ios --ios-google-services "$HOME/Downloads/GoogleService-Info.plist"
  bash ./scripts/sync-build-harness-expo.sh build-android --rnfb-source published --rnfb-version 24.0.0
EOF
}

die() {
  harness_die "$@"
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
  harness_read_repo_defaults "${REPO_ROOT}"
}

load_local_config() {
  harness_load_local_config "${LOCAL_CONFIG_PATH}"
}

detect_ios_bundle_id() {
  harness_detect_ios_bundle_id "$1"
}

detect_android_application_id() {
  harness_detect_android_application_id "$1"
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
    IOS_BUNDLE_ID="${DEFAULT_IOS_BUNDLE_ID}"
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

  if [[ "${RNFB_SOURCE}" != "workspace" && "${RNFB_SOURCE}" != "published" ]]; then
    die "--rnfb-source must be 'workspace' or 'published'"
  fi
  if [[ "${RNFB_SOURCE}" == "published" && -z "${RNFB_VERSION}" ]]; then
    die "--rnfb-version is required when --rnfb-source published is used"
  fi
}

write_local_config() {
  harness_write_local_config "${LOCAL_CONFIG_PATH}"
}

ensure_google_services_files() {
  harness_copy_google_services_files \
    "${IOS_GOOGLE_SERVICES_PATH}" \
    "${IOS_GOOGLE_SERVICES_DEST}" \
    "${ANDROID_GOOGLE_SERVICES_PATH}" \
    "${ANDROID_GOOGLE_SERVICES_DEST}"
}

update_harness_package_json() {
  harness_update_package_json "${APP_DIR}/package.json"
}

install_dependencies() {
  if [[ "${RUN_YARN_INSTALL}" != "1" ]]; then
    return
  fi

  (
    harness_run_root_yarn_install "${REPO_ROOT}"
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
  export RNFB_BUILD_HARNESS_IOS_BUNDLE_ID="${IOS_BUNDLE_ID}"
  export RNFB_BUILD_HARNESS_ANDROID_APPLICATION_ID="${ANDROID_APPLICATION_ID}"
}

export_expo_cli_env() {
  export NODE_PATH="${APP_DIR}/node_modules${NODE_PATH:+:${NODE_PATH}}"
}

run_with_extra_args() {
  if [[ ${#EXTRA_ARGS[@]} -gt 0 ]]; then
    "$@" "${EXTRA_ARGS[@]}"
  else
    "$@"
  fi
}

validate_expo_config() {
  export_expo_cli_env
  (
    cd "${APP_DIR}"
    yarn expo config --json >/dev/null
  )
}

clean_harness() {
  rm -rf \
    "${APP_DIR}/.expo" \
    "${APP_DIR}/android" \
    "${APP_DIR}/ios" \
    "${APP_DIR}/dist" \
    "${APP_DIR}/web-build"
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
  export DEFAULT_IOS_BUNDLE_ID
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
  export_build_env
  validate_expo_config
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
  for command_name in node yarn; do
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

prebuild_ios() {
  export_expo_cli_env
  (
    cd "${APP_DIR}"
    run_with_extra_args yarn expo prebuild --clean --platform ios
  )
}

prebuild_android() {
  export_expo_cli_env
  (
    cd "${APP_DIR}"
    run_with_extra_args yarn expo prebuild --clean --platform android
  )
}

start_expo() {
  resolve_effective_config
  export_build_env
  export_expo_cli_env
  (
    cd "${APP_DIR}"
    run_with_extra_args yarn expo start --clear
  )
}

build_ios() {
  prepare_harness
  prebuild_ios
  (
    cd "${APP_DIR}"
    run_with_extra_args yarn expo run:ios
  )
}

build_android() {
  prepare_harness
  prebuild_android
  (
    cd "${APP_DIR}"
    run_with_extra_args yarn expo run:android
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
  start)
    start_expo
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
