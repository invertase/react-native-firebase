#!/bin/bash

# Copyright (c) 2016-present Invertase Limited & Contributors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this library except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Verify and optionally fix reCAPTCHA Enterprise + Identity Platform setup.
#
# Runbook: okf-bundle/recaptcha-enterprise-test-setup.md
# Doc URL map: firebase-recaptcha-enterprise-doctor.sh --docs
#              (or _recaptcha-enterprise-common.sh recaptcha_print_doc_references)
#
# Phase → primary docs:
#   B  APIs + IAM — https://cloud.google.com/recaptcha/docs/prepare-environment
#                  https://cloud.google.com/identity-platform/docs/recaptcha-enterprise#create_a_service_account
#   B2 AUDIT       — https://cloud.google.com/identity-platform/docs/recaptcha-enterprise
#   C  Phone auth  — https://firebase.google.com/docs/auth/android/phone-auth
#                    https://firebase.google.com/docs/auth/ios/phone-auth
#   D  sdkconfig   — https://firebase.google.com/docs/cli (apps:sdkconfig)
#
# See okf-bundle/recaptcha-enterprise-test-setup.md § Documentation map

set -euo pipefail

RECAPTCHA_SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=_recaptcha-enterprise-common.sh
source "${RECAPTCHA_SCRIPT_DIR}/_recaptcha-enterprise-common.sh"

recaptcha_parse_args "$@"

FAIL=0
WARN=0

recaptcha_resolve_app_ids_from_api || true

recaptcha_print_context

echo "=== Tooling ==="
# gcloud auth: required for APIs, IAM, Identity Toolkit REST
# firebase login: required for apps:sdkconfig — https://firebase.google.com/docs/cli
if recaptcha_require_gcloud; then
  echo "OK  gcloud authenticated"
else
  FAIL=1
  if recaptcha_offer_fix "Run gcloud auth login interactively?"; then
    gcloud auth login
    gcloud config set project "${PROJECT_ID}"
  fi
fi

if recaptcha_firebase_authenticated; then
  echo "OK  firebase CLI authenticated (${FIREBASE_CMD[*]})"
else
  echo "WARN firebase CLI not authenticated (needed to download native configs)"
  echo "     Fix: npx --yes firebase-tools login"
  WARN=1
  if recaptcha_offer_fix "Run firebase login now?"; then
    recaptcha_run_firebase login
  fi
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "FAIL jq not in PATH"
  FAIL=1
else
  echo "OK  jq available"
fi

echo ""
# Phase B — https://cloud.google.com/recaptcha/docs/prepare-environment#enable-api
echo "=== Phase B: APIs enabled ==="
if recaptcha_require_gcloud; then
  if recaptcha_api_enabled "${RECAPTCHA_ENTERPRISE_API}"; then
    echo "OK  ${RECAPTCHA_ENTERPRISE_API} is enabled"
  else
    echo "FAIL ${RECAPTCHA_ENTERPRISE_API} is not enabled"
    FAIL=1
    if recaptcha_offer_fix "Enable reCAPTCHA Enterprise prerequisites (APIs + IAM)?"; then
      recaptcha_run_prerequisites
      recaptcha_api_enabled "${RECAPTCHA_ENTERPRISE_API}" && echo "OK  ${RECAPTCHA_ENTERPRISE_API} is now enabled"
    else
      echo "     Fix: firebase-recaptcha-enterprise-doctor.sh --fix"
    fi
  fi

  if recaptcha_api_enabled "${IDENTITY_TOOLKIT_API}"; then
    echo "OK  ${IDENTITY_TOOLKIT_API} is enabled"
  else
    echo "FAIL ${IDENTITY_TOOLKIT_API} is not enabled"
    FAIL=1
    if recaptcha_offer_fix "Enable reCAPTCHA Enterprise prerequisites (APIs + IAM)?"; then
      recaptcha_run_prerequisites
    else
      echo "     Fix: firebase-recaptcha-enterprise-doctor.sh --fix"
    fi
  fi
fi

echo ""
# Phase B — https://cloud.google.com/identity-platform/docs/recaptcha-enterprise#create_a_service_account
echo "=== Phase B: Identity Platform service account IAM ==="
if recaptcha_require_gcloud; then
  PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)' 2>/dev/null || true)"
  if [ -z "${PROJECT_NUMBER}" ]; then
    echo "FAIL could not read project number for ${PROJECT_ID}"
    FAIL=1
  else
    IDENTITY_SA="service-${PROJECT_NUMBER}@gcp-sa-identitytoolkit.iam.gserviceaccount.com"
    if recaptcha_iam_member_has_role "serviceAccount:${IDENTITY_SA}" "roles/identitytoolkit.serviceAgent"; then
      echo "OK  ${IDENTITY_SA} has roles/identitytoolkit.serviceAgent"
    else
      echo "FAIL ${IDENTITY_SA} missing roles/identitytoolkit.serviceAgent"
      FAIL=1
      if recaptcha_offer_fix "Grant Identity Platform service agent role?"; then
        recaptcha_run_prerequisites
      else
        echo "     Fix: firebase-recaptcha-enterprise-doctor.sh --fix"
      fi
    fi
  fi
fi

echo ""
# Operator roles — https://cloud.google.com/recaptcha/docs/prepare-environment#configure-roles-and-permissions
echo "=== Phase B: operator reCAPTCHA Enterprise IAM (informational) ==="
if recaptcha_require_gcloud; then
  OPERATOR="$(recaptcha_operator_account)"
  if [ -z "${OPERATOR}" ]; then
    echo "WARN no gcloud account — cannot check operator roles"
    WARN=1
  else
    echo "Operator: ${OPERATOR}"
    if recaptcha_operator_can_set_iam_policy; then
      echo "OK  operator can grant project IAM (resourcemanager.projects.setIamPolicy)"
      CAN_GRANT_OPERATOR_IAM=1
    else
      echo "WARN operator cannot grant project IAM on ${PROJECT_ID}"
      echo "     Missing resourcemanager.projects.setIamPolicy — ask a Project Owner / IAM Admin to grant reCAPTCHA roles."
      CAN_GRANT_OPERATOR_IAM=0
      WARN=1
    fi

    if recaptcha_operator_has_project_role "roles/recaptchaenterprise.admin"; then
      echo "OK  operator has roles/recaptchaenterprise.admin"
    else
      echo "WARN operator lacks roles/recaptchaenterprise.admin"
      WARN=1
      if [ "${CAN_GRANT_OPERATOR_IAM}" -eq 1 ]; then
        if recaptcha_offer_fix "Grant roles/recaptchaenterprise.admin to ${OPERATOR}?"; then
          recaptcha_grant_operator_project_role "roles/recaptchaenterprise.admin" || WARN=1
        fi
      fi
    fi

    if recaptcha_operator_has_project_role "roles/recaptchaenterprise.agent"; then
      echo "OK  operator has roles/recaptchaenterprise.agent"
    else
      echo "WARN operator lacks roles/recaptchaenterprise.agent"
      WARN=1
      if [ "${CAN_GRANT_OPERATOR_IAM}" -eq 1 ]; then
        if recaptcha_offer_fix "Grant roles/recaptchaenterprise.agent to ${OPERATOR}?"; then
          recaptcha_grant_operator_project_role "roles/recaptchaenterprise.agent" || WARN=1
        fi
      fi
    fi

    if recaptcha_operator_has_project_role "roles/recaptchaenterprise.admin" \
      || recaptcha_operator_has_project_role "roles/recaptchaenterprise.agent"; then
      echo "OK  operator has at least one reCAPTCHA Enterprise role (optional for RNFB e2e bootstrap)"
    elif [ "${CAN_GRANT_OPERATOR_IAM}" -eq 0 ]; then
      echo "     Manual: https://cloud.google.com/recaptcha/docs/prepare-environment#configure-roles-and-permissions"
    fi
  fi
fi

echo ""
# Phase C — register apps: https://console.firebase.google.com/project/_/settings/general
echo "=== Phase C: Firebase apps registered ==="
if recaptcha_require_gcloud && command -v jq >/dev/null 2>&1; then
  if [ -z "${ANDROID_PACKAGE}" ] || [ -z "${IOS_BUNDLE_ID}" ]; then
    echo "WARN could not detect Android package / iOS bundle from ${ANDROID_DIR} and ${IOS_DIR}"
    WARN=1
  fi

  ANDROID_APPS_JSON="$(recaptcha_fetch_firebase_apps android)"
  IOS_APPS_JSON="$(recaptcha_fetch_firebase_apps ios)"

  ANDROID_MATCH="$(echo "${ANDROID_APPS_JSON}" | jq -r --arg pkg "${ANDROID_PACKAGE:-__none__}" \
    '[.apps[]? | select(.packageName == $pkg)] | length')"
  IOS_MATCH="$(echo "${IOS_APPS_JSON}" | jq -r --arg bundle "${IOS_BUNDLE_ID:-__none__}" \
    '[.apps[]? | select(.bundleId == $bundle)] | length')"

  if [ "${ANDROID_MATCH}" -ge 1 ]; then
    echo "OK  Firebase Android app: ${ANDROID_PACKAGE} (app id ${ANDROID_APP_ID:-lookup via API})"
  else
    echo "FAIL no Firebase Android app with packageName ${ANDROID_PACKAGE:-unknown}"
    echo "     Console: https://console.firebase.google.com/project/${PROJECT_ID}/settings/general"
    FAIL=1
  fi

  if [ "${IOS_MATCH}" -ge 1 ]; then
    echo "OK  Firebase iOS app: ${IOS_BUNDLE_ID} (app id ${IOS_APP_ID:-lookup via API})"
  else
    echo "FAIL no Firebase iOS app with bundleId ${IOS_BUNDLE_ID:-unknown}"
    echo "     Console: https://console.firebase.google.com/project/${PROJECT_ID}/settings/general"
    FAIL=1
  fi
fi

echo ""
# Phase C/D — https://cloud.google.com/identity-platform/docs/recaptcha-enterprise
#             https://cloud.google.com/identity-platform/docs/reference/rest/v2/projects.tenants#recaptchaproviderenforcementstate
echo "=== Phase C/D: Identity Platform recaptchaConfig (Tier 2) ==="
if recaptcha_require_gcloud && command -v jq >/dev/null 2>&1; then
  CONFIG_JSON="$(curl -s \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "X-Goog-User-Project: ${PROJECT_ID}" \
    "https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config")"

  echo "${CONFIG_JSON}" | jq '{
    phoneEnforcementState: .recaptchaConfig.phoneEnforcementState,
    useSmsTollFraudProtection: .recaptchaConfig.useSmsTollFraudProtection,
    recaptchaKeys: (.recaptchaConfig.recaptchaKeys // [] | map({provider, keyName}))
  }'

  STATE="$(echo "${CONFIG_JSON}" | jq -r '.recaptchaConfig.phoneEnforcementState // "MISSING"')"
  if [ "${STATE}" = "AUDIT" ]; then
    echo "OK  phoneEnforcementState is AUDIT"
  else
    echo "FAIL phoneEnforcementState is ${STATE} (expected AUDIT)"
    FAIL=1
    if recaptcha_offer_fix "Set phoneEnforcementState to AUDIT?"; then
      recaptcha_run_audit
      echo "     Wait 1–2+ minutes for recaptchaKeys provisioning, then re-run doctor."
    else
      echo "     Fix: firebase-recaptcha-enterprise-doctor.sh --fix"
    fi
  fi

  KEY_COUNT="$(echo "${CONFIG_JSON}" | jq '[.recaptchaConfig.recaptchaKeys // [] | .[] | select(.provider == "IOS" or .provider == "ANDROID" or .type == "IOS" or .type == "ANDROID")] | length')"
  if [ "${KEY_COUNT}" -ge 2 ]; then
    echo "OK  recaptchaKeys includes iOS and Android entries (${KEY_COUNT} mobile keys)"
  else
    echo "FAIL recaptchaKeys missing iOS/Android entries (found ${KEY_COUNT} mobile keys)"
    echo "     Backend provisioning still in progress — ensure prerequisites + AUDIT ran, wait, re-run doctor."
    FAIL=1
    if recaptcha_offer_fix "Re-apply AUDIT config (may kick provisioning)?"; then
      recaptcha_run_audit
      echo "     Wait 1–2+ minutes, then re-run doctor."
    fi
  fi
fi

echo ""
# Phase D — sdkconfig: https://firebase.google.com/docs/cli (apps:sdkconfig)
# recaptchaSiteKey in native config (Identity Platform provisioning, not App Check Console on mobile):
#   okf-bundle/recaptcha-enterprise-test-setup.md § Console: Web vs mobile
echo "=== Phase D: Native config files ==="
CONFIG_DOWNLOADED=0
if [ -f "${ANDROID_CONFIG}" ]; then
  echo "OK  android config exists: ${ANDROID_CONFIG}"
else
  echo "FAIL android config missing: ${ANDROID_CONFIG}"
  FAIL=1
fi

if [ -f "${IOS_PLIST}" ]; then
  echo "OK  ios config exists: ${IOS_PLIST}"
else
  echo "FAIL ios config missing: ${IOS_PLIST}"
  FAIL=1
fi

if [ ! -f "${ANDROID_CONFIG}" ] || [ ! -f "${IOS_PLIST}" ] || [ "${MODE}" = "fix" ]; then
  if recaptcha_offer_fix "Download google-services.json and GoogleService-Info.plist via firebase apps:sdkconfig?"; then
    if recaptcha_download_and_report_native_configs; then
      CONFIG_DOWNLOADED=1
    else
      FAIL=1
    fi
  elif [ ! -f "${ANDROID_CONFIG}" ] || [ ! -f "${IOS_PLIST}" ]; then
    echo "     Fix: firebase-recaptcha-enterprise-doctor.sh --fix  (requires firebase login)"
  fi
elif ! recaptcha_native_site_keys_ready; then
  if [ "${STATE:-}" = "AUDIT" ] && [ "${KEY_COUNT:-0}" -ge 2 ]; then
    if recaptcha_offer_fix "Re-download native configs (refresh recaptchaSiteKey from Firebase)?"; then
      if recaptcha_download_and_report_native_configs; then
        CONFIG_DOWNLOADED=1
      else
        FAIL=1
      fi
    fi
  fi
fi

if [ "${CONFIG_DOWNLOADED}" -eq 0 ]; then
  if ! recaptcha_report_native_site_keys "App Check native recaptchaSiteKey (Tier 1 gate)" 0; then
    FAIL=1
    if [ "${MODE}" = "verify" ]; then
      if [ "${STATE:-}" != "AUDIT" ] || [ "${KEY_COUNT:-0}" -lt 2 ]; then
        echo "     Complete backend provisioning first (prerequisites + AUDIT + wait for recaptchaKeys)."
      fi
    fi
  fi
fi

echo ""
# Fictional test numbers — https://firebase.google.com/docs/auth/web/phone-auth#test-with-fictional-phone-numbers
#                         https://cloud.google.com/identity-platform/docs/test-phone-numbers
echo "=== Phase C: Fictional test phone (manual Console) ==="
echo "Register: Authentication → Phone → Phone numbers for testing"
echo "  Phone: +16505554343  Code: 654321"
echo "  https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"

echo ""
# AUDIT fallbacks — https://firebase.google.com/docs/auth/android/phone-auth
#                   https://firebase.google.com/docs/auth/ios/phone-auth
echo "=== AUDIT fallbacks (production — docs/auth/phone-auth.mdx) ==="
echo "  Android: Play Integrity → reCAPTCHA v2"
echo "  iOS: silent push (APNs) → reCAPTCHA v2"

if [ "${FAIL}" -ne 0 ]; then
  echo ""
  echo "Setup incomplete — fix FAIL items above."
  echo "Re-run: ${RECAPTCHA_SCRIPT_DIR}/firebase-recaptcha-enterprise-doctor.sh --interactive"
  exit 1
fi

echo ""
if [ "${WARN}" -ne 0 ]; then
  echo "Automated checks passed with WARNings."
else
  echo "Automated checks passed."
fi
echo "Confirm fictional test phone in Console, then run Tier 1/2 e2e."
