#!/bin/bash
# Script to run full test suite in react-native-firebase
# This script handles all test categories and provides error reporting

set -e
# Create temporary directory for logs
TMP_DIR=$(mktemp -d)

# Clean up any stale metro bundler or firebase emulator processes
function terminate_testing_processes() {
  # The emulator and packager are tough to kill in the background
  # enumerating child processes, small searches, background job efforts - all fraught
  # doing a very very specific process command line search works though
  # they will fail if the upstream command lines spawned change but they work now
  ps -ef | grep node | grep firebase.js | grep emulators:start | awk '{print $2}' | xargs kill 2>/dev/null || true
  ps -ef | grep node | grep react-native | grep cli.js | awk '{print $2}' | xargs kill 2>/dev/null || true

  # The macOS app stays running even after the run, clean it up as well
  killall "io.invertase.testing" 2>/dev/null || true

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
    cat "$log_file"
    rm -f "$log_file"
    return 1
  fi

  rm -f "$log_file"
}

echo "Starting full test execution..."

# 1. Dependency Installation
echo "Installing dependencies..."
run_yarn_script "install" || { echo "yarn install failed"; exit 1; }
run_yarn_script "tests:ios:pod:install" || { echo "iOS pod install failed"; exit 1; }
run_yarn_script "tests:macos:pod:install" || { echo "macOS pod install failed"; exit 1; }

# 2. Build Verification
echo "Verifying builds..."
run_yarn_script "tests:ios:build" || { echo "iOS build failed"; exit 1; }
run_yarn_script "tests:macos:build" || { echo "macOS build failed"; exit 1; }
run_yarn_script "tests:android:build" || { echo "Android build failed"; exit 1; }

# 3. Typechecking
echo "Running typechecks..."
run_yarn_script "compare:types" || { echo "Type comparison failed"; exit 1; }

# 4. Linting and Formatting
echo "Running linting and formatting checks..."
run_yarn_script "lint:js" || { echo "Javascript linting failed"; exit 1; }
run_yarn_script "lint:ios:check" || { echo "iOS Linting failed"; exit 1; }
# disabled lint:android because it is flaky at the moment?
#yarn lint:android || { echo "Android Linting failed"; exit 1; }
run_yarn_script "lint:markdown" || { echo  "Markdown linting failed"; exit 1; }
run_yarn_script "lint:spellcheck" || { echo "Spellchecking failed"; exit 1; }

# 5. Unit Tests
echo "Running unit tests..."
run_yarn_script "tests:jest" || { echo "Unit tests failed"; exit 1; }

# 6. E2E Tests with Flakiness Tolerance
echo "Running E2E tests..."

# Prep for iOS e2e run in case Xcode changed:
pushd tests
yarn detox clean-framework-cache || { echo "Clean framework cache failed"; exit 1; }
yarn detox build-framework-cache || { echo "Build framework cache failed"; exit 1; }
popd

# Start our bundler and emulator clean
terminate_testing_processes
echo "starting e2e emulator and packager..."
yarn tests:emulator:start &
yarn tests:packager:jet &

sleep 30

# Run E2E tests - 3 chances to succeed for flake tolerance
for flavor in "ios" "android" "macos"; do
  for i in {1..3}; do
    echo "Running $flavor E2E test run attempt $i..."
    if ! yarn tests:"$flavor":test; then
      if [ $i -eq 3 ]; then
        echo "$flavor E2E test failed all $i attempts."; 
        terminate_testing_processes
        exit 1;
      fi
    else
      echo "Successful $flavor E2E test run on attempt $i."
      break;
    fi
  done
done

# Clean up after ourselves
terminate_testing_processes
rm -rf "$TMP_DIR"

echo
echo
echo "All tests passed successfully!"
echo "Pull request can be created."
echo
echo
