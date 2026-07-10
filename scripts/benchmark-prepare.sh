#!/usr/bin/env bash

set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "benchmark-prepare: this benchmark is macOS-only" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RUNS=3
LOG_DIR="${BENCHMARK_LOG_DIR:-"$ROOT_DIR/.tmp/prepare-benchmarks/$(date +%Y%m%d-%H%M%S)"}"
EDIT_FILE="packages/firestore/lib/index.ts"
EDIT_MARKER="// benchmark-prepare single-package edit"

mkdir -p "$LOG_DIR"

if [[ ! -f "$EDIT_FILE" ]]; then
  echo "benchmark-prepare: missing edit target $EDIT_FILE" >&2
  exit 1
fi

cleanup_edit() {
  node -e "const fs = require('fs'); const f = process.argv[2]; fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/\n+\/\/ benchmark-prepare single-package edit\n$/, '\n'));" "$EDIT_FILE"
}

trap cleanup_edit EXIT

now() {
  node -e "console.log((Date.now() / 1000).toFixed(6))"
}

elapsed_seconds() {
  node -e "console.log((parseFloat(process.argv[3]) - parseFloat(process.argv[2])).toFixed(3))" "$1" "$2"
}

median_of_three() {
  node -e "const args = process.argv.slice(2).map(Number).sort((a, b) => a - b); console.log(args[Math.floor(args.length / 2)].toFixed(3))" "$@"
}

reset_build_outputs() {
  rm -rf packages/*/dist packages/*/plugin/build
}

setup_cold_install() {
  rm -rf node_modules .nx/cache
  reset_build_outputs
}

setup_full_rebuild() {
  reset_build_outputs
}

setup_noop_rebuild() {
  :
}

setup_single_package_edit() {
  cleanup_edit
  printf '\n%s\n' "$EDIT_MARKER" >>"$EDIT_FILE"
}

restore_single_package_edit() {
  cleanup_edit
}

run_timed() {
  local scenario="$1"
  local iteration="$2"
  shift 2

  local log_file="$LOG_DIR/${scenario}-${iteration}.log"
  local start
  local end
  local elapsed
  local exit_code

  printf '[%s/%d] running: %s\n' "$scenario" "$iteration" "$*"
  start="$(now)"
  set +e
  "$@" >"$log_file" 2>&1
  exit_code=$?
  set -e
  end="$(now)"
  elapsed="$(elapsed_seconds "$start" "$end")"

  if [[ "$exit_code" -ne 0 ]]; then
    printf '[%s/%d] failed after %ss; log: %s\n' "$scenario" "$iteration" "$elapsed" "$log_file" >&2
    tail -n 80 "$log_file" >&2
    exit "$exit_code"
  fi

  printf '[%s/%d] completed in %ss; log: %s\n' "$scenario" "$iteration" "$elapsed" "$log_file"
  LAST_ELAPSED="$elapsed"
}

run_scenario() {
  local id="$1"
  local name="$2"
  local setup_function="$3"
  local cleanup_function="$4"
  shift 4

  local timings=()

  printf '\nScenario %s: %s\n' "$id" "$name"

  for iteration in $(seq 1 "$RUNS"); do
    "$setup_function"
    run_timed "$id" "$iteration" "$@"
    timings+=("$LAST_ELAPSED")
    "$cleanup_function"
  done

  local median
  median="$(median_of_three "${timings[@]}")"
  printf 'Scenario %s median-of-3: %ss (runs: %ss, %ss, %ss)\n' \
    "$id" "$median" "${timings[0]}" "${timings[1]}" "${timings[2]}"
  SCENARIO_RESULTS+=("$id|$name|$median|${timings[*]}")
}

SCENARIO_RESULTS=()

cat <<EOF
Prepare benchmark
Repository: $ROOT_DIR
Logs: $LOG_DIR
Runs per scenario: $RUNS
EOF

if [[ -f nx.json ]]; then
  echo "Warning: nx.json exists; results are not a pre-Nx baseline."
fi

run_scenario "A" "Cold install" setup_cold_install ":" yarn
run_scenario "B" "Full rebuild" setup_full_rebuild ":" yarn lerna:prepare
run_scenario "C" "No-op rebuild" setup_noop_rebuild ":" yarn lerna:prepare
run_scenario "D" "Single-package edit" setup_single_package_edit restore_single_package_edit yarn lerna:prepare

printf '\nSummary\n'
printf '| Scenario | Name | Median (s) | Runs (s) |\n'
printf '|----------|------|------------|----------|\n'
for result in "${SCENARIO_RESULTS[@]}"; do
  IFS='|' read -r id name median runs <<<"$result"
  printf '| %s | %s | %s | %s |\n' "$id" "$name" "$median" "$runs"
done

