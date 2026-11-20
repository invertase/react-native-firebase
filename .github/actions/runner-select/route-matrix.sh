#!/usr/bin/env bash
# One placement read per matrix cell. Always exits 0 and writes choices plus fallback.
set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="${GITHUB_OUTPUT:-/dev/stdout}"

write_output() {
  local name="$1"
  local value="$2"
  local delim="ROUTEMATRIX$(date +%s%N)"
  {
    printf '%s<<%s\n' "$name" "$delim"
    printf '%s\n' "$value"
    printf '%s\n' "$delim"
  } >>"$OUT"
}

fallback_json() {
  local raw="${INPUT_DEFAULT_RUNS_ON:-}"
  if [[ -z "$raw" ]]; then
    printf '%s' '"ubuntu-latest"'
    return 0
  fi
  if printf '%s' "$raw" | jq -e . >/dev/null 2>&1; then
    printf '%s' "$raw" | jq -c .
    return 0
  fi
  jq -nc --arg s "$raw" '$s'
}

FALLBACK="$(fallback_json 2>/dev/null || printf '%s' '"ubuntu-latest"')"
CHOICES='{}'

if ! command -v jq >/dev/null 2>&1; then
  echo "runner-select: missing jq; every cell uses the hosted label" >&2
  write_output choices "$CHOICES"
  write_output fallback "$FALLBACK"
  exit 0
fi

matrix_json="${MATRIX_JSON:-}"
if [[ -z "$matrix_json" ]]; then
  matrix_json='{}'
fi
keys_text="$(
  printf '%s' "$matrix_json" | jq -r --arg fields "${KEY_FIELDS:-}" '
    if (type != "object") or (length == 0) then empty
    else
      reduce (to_entries[]) as $axis ([{}];
        [ .[] as $base | $axis.value[] as $v | $base + {($axis.key): $v} ]
      )
      | .[]
      | . as $row
      | ($fields | split(",") | map(gsub("^\\s+|\\s+$"; "")) | map(select(. != "") | $row[.] | tostring) | join("-"))
    end
  ' || true
)"

while IFS= read -r key; do
  [[ -z "$key" ]] && continue
  label=""
  if out="$(bash "$SCRIPT_DIR/select.sh")"; then
    label="$(printf '%s\n' "$out" | sed -n 's/^runs-on=//p' | head -n 1)"
  fi
  if [[ -z "$label" ]] || ! printf '%s' "$label" | jq -e . >/dev/null 2>&1; then
    label="$FALLBACK"
  fi
  CHOICES="$(printf '%s' "$CHOICES" | jq -c --arg k "$key" --argjson v "$label" '. + {($k): $v}')"
done <<< "$keys_text"

write_output choices "$CHOICES"
write_output fallback "$FALLBACK"
exit 0
