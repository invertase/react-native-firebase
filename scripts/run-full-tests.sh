#!/bin/bash
# Script to run full test suite in react-native-firebase
# This script handles all test categories and provides error reporting

set -e
# Create temporary directory for logs
TMP_DIR=$(mktemp -d)
echo "Step logs directory: $TMP_DIR"

kill_listen_port() {
  local port="$1"
  local pids
  pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
  fi
}

# Metro only — keep Firebase emulators up when switching tests/ vs tests-macos.
# After #9192 both apps bind :8081; macOS Jet must use tests-macos Metro.
stop_packager() {
  ps -ef | grep node | grep react-native | grep cli.js | awk '{print $2}' | xargs kill 2>/dev/null || true
  kill_listen_port 8081
  killall "io.invertase.testing" 2>/dev/null || true
  kill_listen_port 8090
  sleep 2
}

wait_for_packager() {
  local i
  for i in $(seq 1 30); do
    if curl -sf http://127.0.0.1:8081/status >/dev/null; then
      return 0
    fi
    sleep 1
  done
  echo "Packager did not become ready on http://127.0.0.1:8081/status"
  return 1
}

# Clean up any stale metro bundler or firebase emulator processes
function terminate_testing_processes() {
  # The emulator and packager are tough to kill in the background
  # enumerating child processes, small searches, background job efforts - all fraught
  # doing a very very specific process command line search works though
  # they will fail if the upstream command lines spawned change but they work now
  ps -ef | grep node | grep firebase.js | grep emulators:start | awk '{print $2}' | xargs kill 2>/dev/null || true
  ps -ef | grep node | grep react-native | grep cli.js | awk '{print $2}' | xargs kill 2>/dev/null || true
  kill_listen_port 8081
  kill_listen_port 8090

  # The macOS app stays running even after the run, clean it up as well.
  # Prefer RNFB_MACOS_PRODUCT_NAME; also clear known slotted siblings (parallel e2e).
  local mac_name
  mac_name="${RNFB_MACOS_PRODUCT_NAME:-io.invertase.testing}"
  killall "$mac_name" 2>/dev/null || true
  if [[ -z "${RNFB_MACOS_PRODUCT_NAME:-}" ]]; then
    local s
    for s in 0 1 2 3 4 5 6 7; do
      killall "io.invertase.testing.s${s}" 2>/dev/null || true
    done
  fi

  sleep 5
}

# Ensure process occurs regardless of how the script exits
# Note log dir is not cleaned up as an architectural choice,
# they will remain for inspection in case needed,
# system retention policy will clean them as needed
trap 'terminate_testing_processes' EXIT

# Run yarn commands with logging to file to avoid agent context/output use
# In case of error send output to console for agentic troubleshooting
run_yarn_script() {
  local script_name="$1"
  local log_file="${TMP_DIR}/${script_name}.log"
  echo "  ...running $script_name - log: $log_file"

  # Run the yarn command and redirect output to log file
  if ! yarn "$script_name" > "$log_file" 2>&1; then
    echo "Command failed: yarn $script_name"
    echo "Full log preserved at: $log_file"
    cat "$log_file"
    return 1
  fi

  rm -f "$log_file"
}

# Run yarn scripts in parallel; fail if any child fails.
# Uses job-control style: background jobs + wait, SIGINT kills the group.
run_yarn_scripts_parallel() {
  local scripts=("$@")
  local pids=()
  local script_names=()
  local failed_scripts=()
  local i=0
  local failed=0

  (
    trap 'kill 0' SIGINT

    for script_name in "${scripts[@]}"; do
      run_yarn_script "$script_name" &
      pids+=($!)
      script_names+=("$script_name")
    done

    for pid in "${pids[@]}"; do
      if ! wait "$pid"; then
        failed=1
        failed_scripts+=("${script_names[$i]}")
      fi
      i=$((i + 1))
    done

    if [ "$failed" -ne 0 ]; then
      echo "Parallel step failed. Preserved logs in: $TMP_DIR"
      for script_name in "${failed_scripts[@]}"; do
        echo "  - ${TMP_DIR}/${script_name}.log"
      done
    fi

    exit "$failed"
  ) || return 1
}

# One platform, up to 3 attempts. Caller must already have the matching packager.
run_e2e_flavor() {
  local flavor="$1"
  local i e2e_log
  for i in 1 2 3; do
    e2e_log="${TMP_DIR}/tests:${flavor}:test.attempt${i}.log"
    echo "Running $flavor E2E test run attempt $i... (log: $e2e_log)"
    if ! yarn tests:"$flavor":test > "$e2e_log" 2>&1; then
      echo "E2E attempt failed. Full log preserved at: $e2e_log"
      cat "$e2e_log"
      if [ "$i" -eq 3 ]; then
        echo "$flavor E2E test failed all $i attempts. Logs preserved in: $TMP_DIR"
        terminate_testing_processes
        exit 1
      fi
    else
      echo "Successful $flavor E2E test run on attempt $i."
      return 0
    fi
  done
}

echo "Starting full test execution..."

# 1. Dependency Installation
echo "Installing dependencies..."
run_yarn_script "install" || { echo "yarn install failed. Logs preserved in: $TMP_DIR"; exit 1; }

echo "Installing iOS and macOS pods in parallel..."
run_yarn_scripts_parallel \
  "tests:ios:pod:install" \
  "tests:macos:pod:install" \
  || { echo "Pod install failed. Logs preserved in: $TMP_DIR"; exit 1; }

# 2–5. Builds, typechecks, lint, and unit tests (all parallel)
echo "Running builds, typechecks, lint, and unit tests in parallel..."
run_yarn_scripts_parallel \
  "tests:ios:build" \
  "tests:macos:build" \
  "tests:android:build" \
  "compare:types" \
  "tsc:compile" \
  "tsc:compile:consumer" \
  "reference:api" \
  "lint:js" \
  "lint:ios:check" \
  "lint:markdown" \
  "lint:spellcheck" \
  "tests:jest" \
  || { echo "Parallel verification failed. Logs preserved in: $TMP_DIR"; exit 1; }

# 6. E2E Tests with Flakiness Tolerance
echo "Running E2E tests..."

# Prep for iOS e2e run in case Xcode changed:
pushd tests
yarn detox clean-framework-cache || { echo "Clean framework cache failed"; exit 1; }
yarn detox build-framework-cache || { echo "Build framework cache failed"; exit 1; }
popd

# Start emulator + mobile Metro (tests/) for iOS/Android. macOS needs tests-macos
# Metro on the same :8081 — switch after native platforms. See running-e2e.md §1.
terminate_testing_processes
echo "starting e2e emulator and mobile packager..."
yarn tests:emulator:start &
yarn tests:packager:jet &

sleep 30
wait_for_packager || exit 1

run_e2e_flavor ios
run_e2e_flavor android

echo "switching Metro to tests-macos for macOS e2e (Firebase emulators stay up)..."
stop_packager
yarn tests:macos:packager:jet &
wait_for_packager || exit 1

run_e2e_flavor macos

# Clean up after ourselves
terminate_testing_processes
rm -rf "$TMP_DIR"

echo
echo
echo "All tests passed successfully!"
echo "Pull request can be created."
echo
echo
