#!/usr/bin/env bash
set -euo pipefail

log_token() {
  local raw="$1"
  if [[ "$raw" =~ ^[A-Za-z0-9._-]*$ ]]; then
    printf '%s' "$raw"
  else
    printf 'rejected'
  fi
}

emit() {
  local runs_on="$1"
  local pool="$2"
  local reason="$3"
  local http="${4-}"
  local placement="${5-}"
  local class_log mode_log summary
  class_log="$(log_token "$CLASS")"
  mode_log="$(log_token "$MODE")"
  summary="class=${class_log} mode=${mode_log} default=${DEFAULT_JSON} overflow=${OVERFLOW_JSON-}"
  if [[ -n "$http" ]]; then
    summary+=" http=${http}"
  fi
  if [[ "$placement" == 1 ]]; then
    summary+=" hosted.total.free=${TOTAL_FREE} hosted.macos.free=${MACOS_FREE} overflow.headroom=${HEADROOM} hosted.mode=${HOSTED_MODE_LOG}"
  fi
  summary+=" branch=${reason} reason=${reason}"
  printf 'runs-on=%s\n' "$runs_on"
  printf 'pool=%s\n' "$pool"
  printf 'reason=%s\n' "$reason"
  printf 'summary=%s\n' "$summary"
  printf 'runner-select: %s\n' "$summary" >&2
}

fail_usage() {
  echo "runner-select: $*" >&2
  exit 2
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail_usage "missing required command: $1"
}

first_nonempty() {
  local v
  for v in "$@"; do
    if [[ -n "$v" ]]; then
      printf '%s' "$v"
      return 0
    fi
  done
  return 0
}

parse_label_input() {
  local raw="$1"
  if [[ -z "$raw" ]]; then
    return 1
  fi
  if printf '%s' "$raw" | jq -e . >/dev/null 2>&1; then
    printf '%s' "$raw" | jq -ec .
    return 0
  fi
  if [[ "$raw" == *[![:alnum:]_.-]* || "$raw" == *'://'* ]]; then
    return 1
  fi
  jq -nc --arg s "$raw" '$s'
}

read_default_json() {
  local raw="$1"
  local parsed
  if ! parsed="$(parse_label_input "$raw")"; then
    if [[ -z "$raw" ]]; then
      echo 'runner-select: default-runs-on is empty' >&2
      exit 1
    fi
    echo 'runner-select: invalid default-runs-on' >&2
    exit 1
  fi
  DEFAULT_JSON="$parsed"
}

read_overflow_json() {
  local raw="$1"
  local parsed
  if ! parsed="$(parse_label_input "$raw")"; then
    echo 'runner-select: invalid overflow-runs-on' >&2
    exit 1
  fi
  OVERFLOW_JSON="$parsed"
}

overflow_label_key() {
  local raw="$1"
  local as_string=''
  if as_string="$(printf '%s' "$raw" | jq -er 'select(type == "string")' 2>/dev/null)" && [[ -n "$as_string" ]]; then
    printf '%s' "$as_string"
    return 0
  fi
  printf '%s' "$raw"
}

placement_url_for_overflow() {
  local key="$1"
  case "$key" in
    macos-self-hosted)
      first_nonempty "${MELLIFERA_PLACEMENT_URL_MACOS:-}" "${MELLIFERA_PLACEMENT_URL:-}"
      ;;
    linux-self-hosted)
      first_nonempty "${MELLIFERA_PLACEMENT_URL_LINUX:-}" "${MELLIFERA_PLACEMENT_URL:-}"
      ;;
    linux-nested-virt-self-hosted)
      first_nonempty "${MELLIFERA_PLACEMENT_URL_LINUX_NESTED:-}" "${MELLIFERA_PLACEMENT_URL:-}"
      ;;
    *)
      first_nonempty "${MELLIFERA_PLACEMENT_URL:-}"
      ;;
  esac
}

placement_body_valid() {
  local body="$1"
  printf '%s' "$body" | jq -e '
    (.hosted.total.free | type) == "number"
    and (.hosted.macos.free | type) == "number"
    and (.overflow.headroom | type) == "number"
  ' >/dev/null 2>&1
}

require_cmd jq
require_cmd curl

CLASS="${INPUT_CLASS:-}"
MODE="$(first_nonempty "${INPUT_MODE:-}" "${RUNNER_SELECT_MODE:-}")"

case "$CLASS" in
  macos)
    DEFAULT_RAW="$(first_nonempty "${INPUT_DEFAULT_RUNS_ON:-}" "${MELLIFERA_DEFAULT_RUNS_ON_MACOS:-}" "${MELLIFERA_DEFAULT_RUNS_ON:-}")"
    OVERFLOW_RAW="$(first_nonempty "${INPUT_OVERFLOW_RUNS_ON:-}" "${MELLIFERA_OVERFLOW_RUNS_ON_MACOS:-}" "macos-self-hosted")"
    ;;
  other)
    DEFAULT_RAW="$(first_nonempty "${INPUT_DEFAULT_RUNS_ON:-}" "${MELLIFERA_DEFAULT_RUNS_ON_LINUX:-}" "${MELLIFERA_DEFAULT_RUNS_ON:-}")"
    OVERFLOW_RAW="$(first_nonempty "${INPUT_OVERFLOW_RUNS_ON:-}" "${MELLIFERA_OVERFLOW_RUNS_ON_LINUX:-}" "linux-self-hosted")"
    ;;
  *)
    DEFAULT_RAW="$(first_nonempty "${INPUT_DEFAULT_RUNS_ON:-}" "${MELLIFERA_DEFAULT_RUNS_ON:-}")"
    OVERFLOW_RAW="$(first_nonempty "${INPUT_OVERFLOW_RUNS_ON:-}")"
    ;;
esac

read_default_json "$DEFAULT_RAW"
if [[ -n "$OVERFLOW_RAW" ]]; then
  read_overflow_json "$OVERFLOW_RAW"
fi

case "$MODE" in
  off)
    emit "$DEFAULT_JSON" default off
    exit 0
    ;;
  fixed | github-app)
    ;;
  '')
    emit "$DEFAULT_JSON" default error
    exit 0
    ;;
  *)
    emit "$DEFAULT_JSON" default error
    exit 0
    ;;
esac

case "$CLASS" in
  macos | other) ;;
  *)
    emit "$DEFAULT_JSON" default error
    exit 0
    ;;
esac

TOKEN="$(first_nonempty "${INPUT_PLACEMENT_TOKEN:-}" "${MELLIFERA_PLACEMENT_TOKEN:-}")"
CA_PEM="$(first_nonempty "${INPUT_PLACEMENT_CA:-}" "${MELLIFERA_PLACEMENT_CA:-}")"
if [[ -n "${INPUT_PLACEMENT_URL:-}" ]]; then
  URL="${INPUT_PLACEMENT_URL}"
else
  URL="$(placement_url_for_overflow "$(overflow_label_key "$OVERFLOW_RAW")")"
fi

if [[ -z "$TOKEN" ]]; then
  emit "$DEFAULT_JSON" default missing-token
  exit 0
fi
if [[ -z "$URL" ]]; then
  emit "$DEFAULT_JSON" default error
  exit 0
fi

if [[ -n "$CA_PEM" && "$CA_PEM" != *'-----BEGIN CERTIFICATE-----'* ]]; then
  echo 'runner-select: placement-ca is not a PEM certificate' >&2
  emit "$DEFAULT_JSON" default bad-ca
  exit 0
fi

TEMP_BASE="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
CFG="$(mktemp "${TEMP_BASE}/runner-select-curl.XXXXXX")"
BODY_FILE="$(mktemp "${TEMP_BASE}/runner-select-body.XXXXXX")"
CA_FILE=''
chmod 600 "$CFG"
cleanup() {
  rm -f "$CFG" "$BODY_FILE" ${CA_FILE:+"$CA_FILE"}
}
trap cleanup EXIT

{
  printf 'header = "Authorization: Bearer %s"\n' "$TOKEN"
} >"$CFG"

CURL_TLS=()
if [[ -n "$CA_PEM" ]]; then
  CA_FILE="$(mktemp "${TEMP_BASE}/runner-select-ca.XXXXXX")"
  chmod 600 "$CA_FILE"
  printf '%s\n' "$CA_PEM" >"$CA_FILE"
  CURL_TLS=(--cacert "$CA_FILE")
fi

HTTP_CODE=0
if ! HTTP_CODE="$(curl --silent --show-error --max-time 10 --config "$CFG" ${CURL_TLS[@]+"${CURL_TLS[@]}"} --output "$BODY_FILE" --write-out '%{http_code}' "$URL" 2>/dev/null)"; then
  emit "$DEFAULT_JSON" default curl-failed
  exit 0
fi

if [[ "$HTTP_CODE" != "200" ]]; then
  emit "$DEFAULT_JSON" default non-200 "$HTTP_CODE"
  exit 0
fi

BODY="$(<"$BODY_FILE")"
if ! placement_body_valid "$BODY"; then
  emit "$DEFAULT_JSON" default bad-json "$HTTP_CODE"
  exit 0
fi

TOTAL_FREE="$(printf '%s' "$BODY" | jq -er '.hosted.total.free | floor')"
MACOS_FREE="$(printf '%s' "$BODY" | jq -er '.hosted.macos.free | floor')"
HEADROOM="$(printf '%s' "$BODY" | jq -er '.overflow.headroom | floor')"
HOSTED_MODE_LOG="absent"
hosted_mode_raw="$(printf '%s' "$BODY" | jq -r 'if (.hosted.mode | type) == "string" then .hosted.mode else empty end')"
if [[ "$hosted_mode_raw" =~ ^[A-Za-z0-9._-]+$ ]]; then
  HOSTED_MODE_LOG="$hosted_mode_raw"
fi

HOSTED=0
if [[ "$CLASS" == macos ]]; then
  if (( TOTAL_FREE > 0 && MACOS_FREE > 0 )); then
    HOSTED=1
  fi
elif (( TOTAL_FREE > 0 )); then
  HOSTED=1
fi

if (( HOSTED )); then
  emit "$DEFAULT_JSON" hosted hosted "$HTTP_CODE" 1
  exit 0
fi

if (( HEADROOM > 0 )); then
  emit "$OVERFLOW_JSON" overflow overflow "$HTTP_CODE" 1
  exit 0
fi

emit "$DEFAULT_JSON" default default "$HTTP_CODE" 1
exit 0
