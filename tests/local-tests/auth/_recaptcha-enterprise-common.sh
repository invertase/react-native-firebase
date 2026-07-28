#!/bin/bash
#
# Shared helpers for firebase-recaptcha-enterprise-doctor.sh (internal — do not run directly).
#
# Keep the documentation map in sync with:
#   okf-bundle/recaptcha-enterprise-test-setup.md § Documentation map
#   docs/auth/phone-auth.mdx § Project bootstrap → Documentation map
#
# Run: firebase-recaptcha-enterprise-doctor.sh --docs

if [ -n "${RECAPTCHA_ENTERPRISE_COMMON_SOURCED:-}" ]; then
  return 0 2>/dev/null || exit 0
fi
RECAPTCHA_ENTERPRISE_COMMON_SOURCED=1

RECAPTCHA_ENTERPRISE_API="recaptchaenterprise.googleapis.com"
IDENTITY_TOOLKIT_API="identitytoolkit.googleapis.com"

recaptcha_print_doc_references() {
  cat <<'EOF'
Documentation map — sources pieced together for RNFB reCAPTCHA Enterprise bootstrap
(also in okf-bundle/recaptcha-enterprise-test-setup.md and docs/auth/phone-auth.mdx).

Runbook / design (this repo)
  okf-bundle/recaptcha-enterprise-test-setup.md
  okf-bundle/recaptcha-enterprise-design.md

Phase B — Enable APIs + Identity Platform service identity + IAM
  Enable reCAPTCHA Enterprise API:
    https://cloud.google.com/recaptcha/docs/prepare-environment#enable-api
  Operator IAM (recaptchaenterprise.admin / .agent, serviceusage.serviceUsageAdmin):
    https://cloud.google.com/recaptcha/docs/prepare-environment#configure-roles-and-permissions
  Identity Platform Google-managed service account + roles/identitytoolkit.serviceAgent:
    https://cloud.google.com/identity-platform/docs/recaptcha-enterprise#create_a_service_account
  Prepare environment overview:
    https://cloud.google.com/recaptcha/docs/prepare-environment

Phase B2 — SMS defense AUDIT (Identity Toolkit REST / firebase-admin updateProjectConfig)
  Identity Platform reCAPTCHA Enterprise (phone + email bot protection):
    https://cloud.google.com/identity-platform/docs/recaptcha-enterprise
  SMS toll-fraud protection (SMS defense):
    https://cloud.google.com/identity-platform/docs/recaptcha-tfp
  phoneEnforcementState enum (OFF | AUDIT | ENFORCE):
    https://cloud.google.com/identity-platform/docs/reference/rest/v2/projects.tenants#recaptchaproviderenforcementstate
  firebase-admin projectConfigManager().updateProjectConfig():
    https://firebase.google.com/docs/reference/admin/node/firebase-admin.auth.projectconfigmanager
  initializeRecaptchaConfig (client pre-warm — RNFB Auth export):
    https://firebase.google.com/docs/reference/js/auth#initializerecaptchaconfig

Phase C — Firebase apps, Phone auth, fictional test numbers
  Register Android/iOS apps (Console → Project settings):
    https://console.firebase.google.com/project/_/settings/general
  Enable Phone sign-in provider:
    https://console.firebase.google.com/project/_/authentication/providers
  Android phone auth + Play Integrity fallback chain:
    https://firebase.google.com/docs/auth/android/phone-auth
  iOS phone auth + APNs silent push fallback chain:
    https://firebase.google.com/docs/auth/ios/phone-auth
  Fictional test phone numbers (Firebase docs):
    https://firebase.google.com/docs/auth/web/phone-auth#test-with-fictional-phone-numbers
  Identity Platform test phone numbers:
    https://cloud.google.com/identity-platform/docs/test-phone-numbers

Phase D — Native google-services.json / GoogleService-Info.plist (recaptchaSiteKey)
  firebase apps:sdkconfig (CLI — replaces manual Console download):
    https://firebase.google.com/docs/cli  (see “Management of Firebase Apps” → apps:sdkconfig)
  firebase apps:sdkconfig implementation (multi-client Android quirk):
    https://github.com/firebase/firebase-tools/pull/1515
  App Check Web reCAPTCHA Enterprise (Console path exists for Web only):
    https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider
  Android App Check recaptcha provider (native SDK — reads FirebaseApp recaptchaSiteKey):
    https://firebase.google.com/docs/reference/android/com/google/firebase/appcheck/recaptcha/RecaptchaAppCheckProviderFactory
  iOS App Check FIRRecaptchaProvider:
    https://firebase.google.com/docs/reference/ios/firebaseappcheck/api/reference/Classes/FIRRecaptchaProvider
  Note: native mobile App Check reCAPTCHA Enterprise in Console may be absent; recaptchaSiteKey
  in plist/json comes from Identity Platform provisioning + sdkconfig redownload (see test-setup
  § Console: Web vs mobile).

App Check enforcement (optional — shared test project)
  https://firebase.google.com/docs/app-check/enable-enforcement

Troubleshooting + known pitfalls
  Identity Platform reCAPTCHA troubleshooting (SMS defense stuck OFF):
    https://cloud.google.com/identity-platform/docs/recaptcha-troubleshooting
  SMS defense stays enabled after disable (Console/API quirk):
    https://github.com/firebase/flutterfire/issues/18171
    https://github.com/firebase/firebase-ios-sdk/issues/15345

Billing / quotas
  reCAPTCHA Enterprise free tier (10k assessments/month/org):
    https://cloud.google.com/recaptcha/docs/billing-information

RNFB feature design references
  FlutterFire mobile App Check recaptcha rollout:
    https://github.com/firebase/flutterfire/pull/18261
  firebase-js-sdk Auth + App Check Enterprise coexistence (12.15+):
    https://github.com/firebase/firebase-js-sdk/pull/9991
EOF
}

recaptcha_script_dir() {
  cd "$(dirname "${BASH_SOURCE[1]:-${BASH_SOURCE[0]}}")" && pwd
}

recaptcha_repo_root() {
  if [ -n "${REPO_ROOT:-}" ]; then
    echo "${REPO_ROOT}"
    return 0
  fi
  local script_dir
  script_dir="$(recaptcha_script_dir)"
  echo "$(cd "${script_dir}/../../.." && pwd)"
}

recaptcha_usage() {
  cat <<'EOF'
Usage: firebase-recaptcha-enterprise-doctor.sh [OPTIONS]

Verify or fix reCAPTCHA Enterprise + Identity Platform setup for native Firebase Auth / App Check.

Options:
  --project-id ID       GCP / Firebase project (default: react-native-firebase-testing)
  --android-dir DIR     Android app module directory (google-services.json target)
  --ios-dir DIR         iOS app directory (GoogleService-Info.plist target)
  --repo-root DIR       Monorepo root (for node_modules firebase-tools; auto-detected)
  --verify-only         Run checks only; never apply fixes (default when stdin is not a TTY)
  --interactive         Prompt before each automated fix (default on TTY)
  --fix, -y             Apply all automated fixes without prompting
  --docs                Print documentation URL map (sources for each bootstrap phase)
  --help                Show this help

Environment variables: PROJECT_ID, ANDROID_DIR, IOS_DIR, REPO_ROOT

Full documentation map: firebase-recaptcha-enterprise-doctor.sh --docs
Also: okf-bundle/recaptcha-enterprise-test-setup.md § Documentation map

Automated fixes cover: GCP API enablement, Identity Platform IAM, AUDIT mode, native config
download via firebase apps:sdkconfig. Console-only steps (register Firebase apps, fictional test
phone) are printed with links.

Firebase CLI resolution order: $FIREBASE_CLI, repo node_modules/.bin/firebase, firebase on
PATH, then npx --yes firebase-tools (works without a prior yarn install).
EOF
}

recaptcha_parse_args() {
  PROJECT_ID="${PROJECT_ID:-react-native-firebase-testing}"
  local repo_root
  repo_root="$(recaptcha_repo_root)"
  ANDROID_DIR="${ANDROID_DIR:-${repo_root}/tests/android/app}"
  IOS_DIR="${IOS_DIR:-${repo_root}/tests/ios}"
  REPO_ROOT="${REPO_ROOT:-${repo_root}}"
  MODE="interactive"
  if [ ! -t 0 ]; then
    MODE="verify"
  fi

  while [ $# -gt 0 ]; do
    case "$1" in
      --project-id)
        PROJECT_ID="$2"
        shift 2
        ;;
      --android-dir)
        ANDROID_DIR="$2"
        shift 2
        ;;
      --ios-dir)
        IOS_DIR="$2"
        shift 2
        ;;
      --repo-root)
        REPO_ROOT="$2"
        shift 2
        ;;
      --verify-only)
        MODE="verify"
        shift
        ;;
      --interactive)
        MODE="interactive"
        shift
        ;;
      --fix | -y)
        MODE="fix"
        shift
        ;;
      --help | -h)
        recaptcha_usage
        exit 0
        ;;
      --docs)
        recaptcha_print_doc_references
        exit 0
        ;;
      *)
        echo "Unknown option: $1" >&2
        recaptcha_usage >&2
        exit 2
        ;;
    esac
  done

  recaptcha_resolve_paths
  recaptcha_resolve_identifiers
}

recaptcha_resolve_paths() {
  ANDROID_DIR="$(cd "${ANDROID_DIR}" 2>/dev/null && pwd || echo "${ANDROID_DIR}")"
  IOS_DIR="$(cd "${IOS_DIR}" 2>/dev/null && pwd || echo "${IOS_DIR}")"

  if [ -f "${ANDROID_DIR}/google-services.json" ]; then
    ANDROID_CONFIG="${ANDROID_DIR}/google-services.json"
  elif [ -f "${ANDROID_DIR}/app/google-services.json" ]; then
    ANDROID_CONFIG="${ANDROID_DIR}/app/google-services.json"
  elif [ -d "${ANDROID_DIR}/app" ]; then
    ANDROID_CONFIG="${ANDROID_DIR}/app/google-services.json"
  else
    ANDROID_CONFIG="${ANDROID_DIR}/google-services.json"
  fi

  if [ -f "${IOS_DIR}/GoogleService-Info.plist" ]; then
    IOS_PLIST="${IOS_DIR}/GoogleService-Info.plist"
  else
    IOS_PLIST="${IOS_DIR}/GoogleService-Info.plist"
  fi
}

recaptcha_read_android_package_from_gradle() {
  local gradle="${ANDROID_DIR}/build.gradle"
  local gradle_kts="${ANDROID_DIR}/build.gradle.kts"
  local file=""
  if [ -f "${gradle}" ]; then
    file="${gradle}"
  elif [ -f "${gradle_kts}" ]; then
    file="${gradle_kts}"
  elif [ -f "${ANDROID_DIR}/app/build.gradle" ]; then
    file="${ANDROID_DIR}/app/build.gradle"
  elif [ -f "${ANDROID_DIR}/app/build.gradle.kts" ]; then
    file="${ANDROID_DIR}/app/build.gradle.kts"
  fi
  if [ -n "${file}" ]; then
    grep -E "applicationId\s*[= ]" "${file}" | head -1 | sed -E "s/.*applicationId\s*[= ]*['\"]?([^'\" ]+)['\"]?.*/\1/"
  fi
}

recaptcha_read_android_package_from_json() {
  if [ -f "${ANDROID_CONFIG}" ] && command -v jq >/dev/null 2>&1; then
    jq -r '[.client[]?.client_info.android_client_info.package_name] | map(select(. != null)) | .[0] // empty' \
      "${ANDROID_CONFIG}" 2>/dev/null
  fi
}

recaptcha_read_ios_bundle_from_plist() {
  if [ -f "${IOS_PLIST}" ] && /usr/libexec/PlistBuddy -c 'Print :BUNDLE_ID' "${IOS_PLIST}" >/dev/null 2>&1; then
    /usr/libexec/PlistBuddy -c 'Print :BUNDLE_ID' "${IOS_PLIST}" 2>/dev/null
  fi
}

recaptcha_read_app_id_from_json() {
  if [ -f "${ANDROID_CONFIG}" ] && command -v jq >/dev/null 2>&1; then
    jq -r '[.client[]?.client_info.mobilesdk_app_id] | map(select(. != null)) | .[0] // empty' \
      "${ANDROID_CONFIG}" 2>/dev/null
  fi
}

recaptcha_read_app_id_from_plist() {
  if [ -f "${IOS_PLIST}" ] && /usr/libexec/PlistBuddy -c 'Print :GOOGLE_APP_ID' "${IOS_PLIST}" >/dev/null 2>&1; then
    /usr/libexec/PlistBuddy -c 'Print :GOOGLE_APP_ID' "${IOS_PLIST}" 2>/dev/null
  fi
}

recaptcha_resolve_identifiers() {
  ANDROID_PACKAGE="${ANDROID_PACKAGE:-$(recaptcha_read_android_package_from_json)}"
  if [ -z "${ANDROID_PACKAGE}" ]; then
    ANDROID_PACKAGE="$(recaptcha_read_android_package_from_gradle || true)"
  fi
  IOS_BUNDLE_ID="${IOS_BUNDLE_ID:-$(recaptcha_read_ios_bundle_from_plist)}"
  if [ -z "${IOS_BUNDLE_ID}" ] && [ -n "${ANDROID_PACKAGE}" ]; then
    IOS_BUNDLE_ID="${ANDROID_PACKAGE}"
  fi

  ANDROID_APP_ID="${ANDROID_APP_ID:-$(recaptcha_read_app_id_from_json)}"
  IOS_APP_ID="${IOS_APP_ID:-$(recaptcha_read_app_id_from_plist)}"
}

recaptcha_firebase_cmd() {
  FIREBASE_CMD=()
  if [ -n "${FIREBASE_CLI:-}" ]; then
    FIREBASE_CMD=("${FIREBASE_CLI}")
    return 0
  fi
  if [ -x "${REPO_ROOT}/node_modules/.bin/firebase" ]; then
    FIREBASE_CMD=("${REPO_ROOT}/node_modules/.bin/firebase")
    return 0
  fi
  if command -v firebase >/dev/null 2>&1; then
    FIREBASE_CMD=(firebase)
    return 0
  fi
  FIREBASE_CMD=(npx --yes firebase-tools)
}

recaptcha_run_firebase() {
  recaptcha_firebase_cmd
  "${FIREBASE_CMD[@]}" "$@"
}

recaptcha_firebase_authenticated() {
  recaptcha_run_firebase projects:list --json >/dev/null 2>&1
}

recaptcha_require_gcloud() {
  if ! command -v gcloud >/dev/null 2>&1; then
    echo "FAIL gcloud not in PATH (install google-cloud-sdk)"
    return 1
  fi
  if ! gcloud auth print-access-token >/dev/null 2>&1; then
    echo "FAIL gcloud not authenticated"
    echo "     Fix: gcloud auth login && gcloud config set project ${PROJECT_ID}"
    return 1
  fi
  return 0
}

recaptcha_api_enabled() {
  local api_name="$1"
  gcloud services list --enabled --project="${PROJECT_ID}" \
    --filter="config.name:${api_name}" \
    --format="value(config.name)" 2>/dev/null | grep -qx "${api_name}"
}

recaptcha_iam_member_has_role() {
  local member="$1"
  local role="$2"
  gcloud projects get-iam-policy "${PROJECT_ID}" \
    --flatten="bindings[].members" \
    --filter="bindings.members:${member} AND bindings.role:${role}" \
    --format="value(bindings.role)" 2>/dev/null | grep -qx "${role}"
}

recaptcha_operator_account() {
  gcloud config get-value account 2>/dev/null | sed '/^(unset)$/d' || true
}

recaptcha_operator_iam_member() {
  local account="${1:-$(recaptcha_operator_account)}"
  if [ -z "${account}" ] || [ "${account}" = "(unset)" ]; then
    return 1
  fi
  if [[ "${account}" == *@*.iam.gserviceaccount.com ]]; then
    echo "serviceAccount:${account}"
  else
    echo "user:${account}"
  fi
}

recaptcha_operator_has_project_role() {
  local role="$1"
  local member
  member="$(recaptcha_operator_iam_member)" || return 1
  recaptcha_iam_member_has_role "${member}" "${role}"
}

recaptcha_operator_can_set_iam_policy() {
  # Cloud Resource Manager testIamPermissions — required before self-granting operator roles.
  # Operator role docs: https://cloud.google.com/recaptcha/docs/prepare-environment#configure-roles-and-permissions
  if ! recaptcha_require_gcloud; then
    return 1
  fi
  if ! command -v jq >/dev/null 2>&1; then
    return 1
  fi
  local response granted
  response="$(curl -s -X POST \
    "https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT_ID}:testIamPermissions" \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json" \
    -d '{"permissions":["resourcemanager.projects.setIamPolicy"]}')"
  granted="$(echo "${response}" | jq -r '.permissions[]? // empty' 2>/dev/null | head -1)"
  [ "${granted}" = "resourcemanager.projects.setIamPolicy" ]
}

recaptcha_grant_operator_project_role() {
  local role="$1"
  local account member
  if ! recaptcha_operator_can_set_iam_policy; then
    echo "FAIL cannot grant ${role} — operator lacks resourcemanager.projects.setIamPolicy on ${PROJECT_ID}"
    return 1
  fi
  account="$(recaptcha_operator_account)"
  member="$(recaptcha_operator_iam_member "${account}")" || return 1
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="${member}" \
    --role="${role}" \
    --condition=None \
    --quiet
  echo "OK  granted ${role} to ${account}"
}

recaptcha_fetch_firebase_apps() {
  local platform="$1"
  local access_token
  access_token="$(gcloud auth print-access-token)"
  curl -s \
    -H "Authorization: Bearer ${access_token}" \
    -H "X-Goog-User-Project: ${PROJECT_ID}" \
    "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}/${platform}Apps"
}

recaptcha_resolve_app_ids_from_api() {
  if ! recaptcha_require_gcloud; then
    return 1
  fi
  if [ -z "${ANDROID_PACKAGE}" ] && [ -z "${IOS_BUNDLE_ID}" ]; then
    return 1
  fi
  if ! command -v jq >/dev/null 2>&1; then
    return 1
  fi

  if [ -z "${ANDROID_APP_ID}" ] && [ -n "${ANDROID_PACKAGE}" ]; then
    local android_apps
    android_apps="$(recaptcha_fetch_firebase_apps android)"
    ANDROID_APP_ID="$(echo "${android_apps}" | jq -r --arg pkg "${ANDROID_PACKAGE}" \
      '[.apps[]? | select(.packageName == $pkg)] | .[0].appId // empty')"
  fi

  if [ -z "${IOS_APP_ID}" ] && [ -n "${IOS_BUNDLE_ID}" ]; then
    local ios_apps
    ios_apps="$(recaptcha_fetch_firebase_apps ios)"
    IOS_APP_ID="$(echo "${ios_apps}" | jq -r --arg bundle "${IOS_BUNDLE_ID}" \
      '[.apps[]? | select(.bundleId == $bundle)] | .[0].appId // empty')"
  fi
}

recaptcha_offer_fix() {
  local prompt="$1"
  case "${MODE}" in
    verify)
      return 1
      ;;
    fix)
      echo ">> ${prompt}"
      return 0
      ;;
    interactive)
      if [ ! -t 0 ]; then
        return 1
      fi
      read -r -p "${prompt} [y/N] " answer
      case "${answer}" in
        [yY] | [yY][eE][sS]) return 0 ;;
        *) return 1 ;;
      esac
      ;;
  esac
}

recaptcha_run_prerequisites() {
  # Phase B — https://cloud.google.com/recaptcha/docs/prepare-environment#enable-api
  #          https://cloud.google.com/identity-platform/docs/recaptcha-enterprise#create_a_service_account
  echo "Setting up reCAPTCHA Enterprise prerequisites on ${PROJECT_ID}"
  echo "Operator needs: roles/serviceusage.serviceUsageAdmin, project IAM admin for binding."
  echo ""

  echo "=== Enable APIs ==="
  gcloud services enable recaptchaenterprise.googleapis.com identitytoolkit.googleapis.com \
    --project="${PROJECT_ID}"

  echo ""
  echo "=== Identity Platform Google-managed service identity ==="
  if gcloud beta services identity create \
    --service=identitytoolkit.googleapis.com \
    --project="${PROJECT_ID}" 2>/dev/null; then
    echo "Created identitytoolkit service identity (or it already existed)."
  else
    echo "Note: identity create returned non-zero — identity may already exist; continuing."
  fi

  local project_number identity_sa
  project_number="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
  identity_sa="service-${project_number}@gcp-sa-identitytoolkit.iam.gserviceaccount.com"

  echo ""
  echo "=== Grant roles/identitytoolkit.serviceAgent to ${identity_sa} ==="
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${identity_sa}" \
    --role="roles/identitytoolkit.serviceAgent" \
    --condition=None \
    --quiet

  echo "OK  Phase B prerequisites applied"
}

recaptcha_run_audit() {
  # Phase B2 — https://cloud.google.com/identity-platform/docs/recaptcha-enterprise
  echo "Setting phone SMS defense to AUDIT in project ${PROJECT_ID}"
  echo "Wait ~1–2 minutes (recaptchaKeys provisioning may take longer)."

  curl -s -X PATCH \
    "https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config?updateMask=recaptchaConfig" \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json" \
    -H "X-Goog-User-Project: ${PROJECT_ID}" \
    -d '{
      "recaptchaConfig": {
        "phoneEnforcementState": "AUDIT",
        "useSmsTollFraudProtection": true
      }
    }' | jq '.recaptchaConfig | {phoneEnforcementState, useSmsTollFraudProtection}'

  echo ""
  echo "Current recaptchaConfig:"
  curl -s \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "X-Goog-User-Project: ${PROJECT_ID}" \
    "https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config" \
    | jq '.recaptchaConfig | {phoneEnforcementState, useSmsTollFraudProtection, recaptchaKeys: (.recaptchaKeys // [] | map({provider, keyName}))}'
}

recaptcha_download_native_configs() {
  # firebase apps:sdkconfig — https://firebase.google.com/docs/cli
  # Android returns all project clients; we filter to one app (firebase-tools#1515).
  if ! command -v jq >/dev/null 2>&1; then
    echo "FAIL jq not in PATH"
    return 1
  fi
  if [ -z "${ANDROID_APP_ID}" ] || [ -z "${IOS_APP_ID}" ]; then
    recaptcha_resolve_app_ids_from_api || true
  fi
  if [ -z "${ANDROID_APP_ID}" ] || [ -z "${IOS_APP_ID}" ]; then
    echo "FAIL cannot download configs — resolve ANDROID_APP_ID / IOS_APP_ID (register apps in Firebase Console)"
    echo "     https://console.firebase.google.com/project/${PROJECT_ID}/settings/general"
    return 1
  fi
  if ! recaptcha_firebase_authenticated; then
    echo "FAIL firebase not authenticated"
    echo "     Fix: npx --yes firebase-tools login   (or: firebase login)"
    return 1
  fi

  local tmp_dir
  tmp_dir="$(mktemp -d)"
  # shellcheck disable=SC2064
  trap "rm -rf '${tmp_dir}'" RETURN

  echo "Downloading iOS plist → ${IOS_PLIST}"
  recaptcha_run_firebase apps:sdkconfig IOS "${IOS_APP_ID}" \
    --project "${PROJECT_ID}" \
    -o "${tmp_dir}/GoogleService-Info.plist"

  mkdir -p "$(dirname "${IOS_PLIST}")"
  cp "${tmp_dir}/GoogleService-Info.plist" "${IOS_PLIST}"

  echo "Downloading Android json → ${ANDROID_CONFIG} (filtering to ${ANDROID_APP_ID})"
  recaptcha_run_firebase apps:sdkconfig ANDROID "${ANDROID_APP_ID}" \
    --project "${PROJECT_ID}" \
    -o "${tmp_dir}/google-services-full.json"

  local client_count
  client_count="$(jq --arg id "${ANDROID_APP_ID}" \
    '[.client[] | select(.client_info.mobilesdk_app_id == $id)] | length' \
    "${tmp_dir}/google-services-full.json")"
  if [ "${client_count}" -ne 1 ]; then
    echo "FAIL expected one Android client for ${ANDROID_APP_ID} (found ${client_count})"
    return 1
  fi

  jq --arg id "${ANDROID_APP_ID}" '{
    project_info: .project_info,
    client: [.client[] | select(.client_info.mobilesdk_app_id == $id)],
    configuration_version: .configuration_version
  }' "${tmp_dir}/google-services-full.json" >"${tmp_dir}/google-services.json"

  if [ -n "${ANDROID_PACKAGE}" ]; then
    local package_name
    package_name="$(jq -r '.client[0].client_info.android_client_info.package_name' \
      "${tmp_dir}/google-services.json")"
    if [ "${package_name}" != "${ANDROID_PACKAGE}" ]; then
      echo "WARN android package in json (${package_name}) differs from detected (${ANDROID_PACKAGE})"
    fi
  fi

  mkdir -p "$(dirname "${ANDROID_CONFIG}")"
  cp "${tmp_dir}/google-services.json" "${ANDROID_CONFIG}"
  recaptcha_resolve_identifiers
  return 0
}

recaptcha_android_site_key_value() {
  if [ ! -f "${ANDROID_CONFIG}" ] || ! command -v jq >/dev/null 2>&1; then
    return 0
  fi
  jq -r '[.. | objects | (.recaptchaSiteKey // .recaptcha_site_key // empty) |
    select(type == "string" and length > 0)] | first // empty' "${ANDROID_CONFIG}" 2>/dev/null
}

recaptcha_ios_site_key_value() {
  if [ ! -f "${IOS_PLIST}" ]; then
    return 0
  fi
  if /usr/libexec/PlistBuddy -c 'Print :RECAPTCHA_SITE_KEY' "${IOS_PLIST}" >/dev/null 2>&1; then
    /usr/libexec/PlistBuddy -c 'Print :RECAPTCHA_SITE_KEY' "${IOS_PLIST}" 2>/dev/null
    return 0
  fi
  if grep -q '<key>RECAPTCHA_SITE_KEY</key>' "${IOS_PLIST}" 2>/dev/null; then
    sed -n '/<key>RECAPTCHA_SITE_KEY<\/key>/{n;s/.*<string>\(.*\)<\/string>.*/\1/p;q;}' "${IOS_PLIST}"
  fi
}

recaptcha_native_site_keys_ready() {
  local android_key ios_key
  android_key="$(recaptcha_android_site_key_value)"
  ios_key="$(recaptcha_ios_site_key_value)"
  [ -n "${android_key}" ] && [ -n "${ios_key}" ]
}

# Prints per-platform OK/FAIL for recaptchaSiteKey. Returns 0 only when both platforms have a key.
recaptcha_report_native_site_keys() {
  local label="${1:-App Check native recaptchaSiteKey (Tier 1 gate)}"
  local after_download="${2:-0}"
  local android_key ios_key
  local android_ok=0 ios_ok=0
  local status=0

  android_key="$(recaptcha_android_site_key_value)"
  ios_key="$(recaptcha_ios_site_key_value)"

  echo ""
  echo "=== ${label} ==="

  if [ -n "${android_key}" ]; then
    echo "OK  android recaptchaSiteKey present (${ANDROID_CONFIG})"
    echo "     ${android_key}"
    android_ok=1
  elif [ -f "${ANDROID_CONFIG}" ] && grep -qi recaptcha "${ANDROID_CONFIG}"; then
    echo "WARN android: recaptcha-related field in ${ANDROID_CONFIG} but no recaptchaSiteKey value parsed"
    grep -i recaptcha "${ANDROID_CONFIG}" | head -3 | sed 's/^/     /' || true
    status=1
  elif [ -f "${ANDROID_CONFIG}" ]; then
    echo "FAIL android: ${ANDROID_CONFIG} has no recaptchaSiteKey"
    status=1
  else
    echo "FAIL android: config missing (${ANDROID_CONFIG})"
    status=1
  fi

  if [ -n "${ios_key}" ]; then
    echo "OK  ios RECAPTCHA_SITE_KEY present (${IOS_PLIST})"
    echo "     ${ios_key}"
    ios_ok=1
  elif [ -f "${IOS_PLIST}" ] && grep -qi recaptcha "${IOS_PLIST}"; then
    echo "WARN ios: recaptcha-related field in ${IOS_PLIST} but no RECAPTCHA_SITE_KEY value parsed"
    grep -i recaptcha "${IOS_PLIST}" | head -3 | sed 's/^/     /' || true
    status=1
  elif [ -f "${IOS_PLIST}" ]; then
    echo "FAIL ios: ${IOS_PLIST} has no RECAPTCHA_SITE_KEY"
    status=1
  else
    echo "FAIL ios: config missing (${IOS_PLIST})"
    status=1
  fi

  if [ "${android_ok}" -eq 1 ] && [ "${ios_ok}" -eq 1 ]; then
    echo "OK  Tier 1 gate satisfied — both native configs include recaptchaSiteKey"
    return 0
  fi

  if [ "${after_download}" -eq 1 ]; then
    echo "     Download completed; Firebase sdkconfig still omits recaptchaSiteKey."
    echo "     Identity Platform backend provisioning may still be in progress — wait for recaptchaKeys, then re-run doctor."
  elif [ "${STATE:-}" != "AUDIT" ] || [ "${KEY_COUNT:-0}" -lt 2 ]; then
    echo "     Complete prerequisites + AUDIT and wait for recaptchaKeys before expecting recaptchaSiteKey in sdkconfig."
  else
    echo "     Backend keys exist but sdkconfig not updated yet — wait briefly and re-download, or re-run doctor --fix."
  fi

  return "${status}"
}

recaptcha_download_and_report_native_configs() {
  if ! recaptcha_download_native_configs; then
    return 1
  fi
  recaptcha_report_native_site_keys "Fresh download verification" 1
}

recaptcha_print_context() {
  echo "Project:         ${PROJECT_ID}"
  echo "Android dir:     ${ANDROID_DIR}"
  echo "Android config:  ${ANDROID_CONFIG}"
  echo "Android package: ${ANDROID_PACKAGE:-unknown}"
  echo "Android app id:  ${ANDROID_APP_ID:-unknown}"
  echo "iOS dir:         ${IOS_DIR}"
  echo "iOS plist:       ${IOS_PLIST}"
  echo "iOS bundle:      ${IOS_BUNDLE_ID:-unknown}"
  echo "iOS app id:      ${IOS_APP_ID:-unknown}"
  recaptcha_firebase_cmd
  echo "Firebase CLI:    ${FIREBASE_CMD[*]}"
  echo "Mode:            ${MODE}"
  echo ""
}
