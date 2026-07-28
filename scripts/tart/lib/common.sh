#!/usr/bin/env bash
# Shared helpers for scripts/tart (host and in-VM).
set -euo pipefail

# Resolve scripts/tart root from this file (works when sourced from any tart script).
_tart_common_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export RNFB_TART_ROOT="${RNFB_TART_ROOT:-$_tart_common_dir}"

# VM image names (local Tart VMs).
export RNFB_TART_GOLDEN_VM="${RNFB_TART_GOLDEN_VM:-rnfb-ios-e2e-golden}"
export RNFB_TART_WARMED_VM="${RNFB_TART_WARMED_VM:-rnfb-ios-e2e-warmed}"
export RNFB_TART_PREWARM_DIR="${RNFB_TART_PREWARM_DIR:-$HOME/rnfb-prewarm}"
# In-VM repo materialization path (admin user on Cirrus Tart images).
export RNFB_TART_VM_HOME="${RNFB_TART_VM_HOME:-/Users/admin}"
export RNFB_TART_VM_PREWARM_DIR="${RNFB_TART_VM_PREWARM_DIR:-${RNFB_TART_VM_HOME}/rnfb-prewarm}"
export RNFB_TART_MANIFEST_DIR="${RNFB_TART_MANIFEST_DIR:-$HOME/rnfb-tart-manifests}"

# Yarn Berry cache outside the worktree (.yarnrc.yml has enableGlobalCache: false).
export YARN_CACHE_FOLDER="${YARN_CACHE_FOLDER:-$HOME/.yarn-rnfb-cache}"

# Natural cache paths (mirror CI actions/cache restore targets inside the VM disk).
export RNFB_DETOX_CACHE="${RNFB_DETOX_CACHE:-$HOME/Library/Detox/ios}"
export RNFB_METRO_CACHE="${RNFB_METRO_CACHE:-$HOME/.metro}"
export RNFB_FIREBASE_EMULATORS="${RNFB_FIREBASE_EMULATORS:-$HOME/.cache/firebase/emulators}"
export RNFB_COCOA_PODS_CACHE="${RNFB_COCOA_PODS_CACHE:-$HOME/Library/Caches/CocoaPods}"
export RNFB_CCACHE_DIR="${RNFB_CCACHE_DIR:-$HOME/.ccache}"

# CCACHE env aligned with tests_e2e_ios.yml (+ no_hash_dir so prewarm/iteration share hits).
export CCACHE_SLOPPINESS="${CCACHE_SLOPPINESS:-clang_index_store,file_stat_matches,include_file_ctime,include_file_mtime,ivfsoverlay,pch_defines,modules,system_headers,time_macros,no_hash_dir}"
export CCACHE_BASEDIR="${CCACHE_BASEDIR:-$HOME}"
export CCACHE_FILECLONE="${CCACHE_FILECLONE:-true}"
export CCACHE_DEPEND="${CCACHE_DEPEND:-true}"
export CCACHE_INODECACHE="${CCACHE_INODECACHE:-true}"
export CCACHE_LIMIT_MULTIPLE="${CCACHE_LIMIT_MULTIPLE:-0.95}"
export CCACHE_DIR="${CCACHE_DIR:-$RNFB_CCACHE_DIR}"
export CCACHE_MAXSIZE="${CCACHE_MAXSIZE:-1500M}"

# Tart virtiofs mount points (host passes --dir=name:path).
export RNFB_TART_WORKTREE_MOUNT="${RNFB_TART_WORKTREE_MOUNT:-/Volumes/My Shared Files/worktree}"
export RNFB_TART_SCRIPTS_MOUNT="${RNFB_TART_SCRIPTS_MOUNT:-/Volumes/My Shared Files/tart-scripts}"

# Tart SSH defaults (Cirrus macOS images).
export RNFB_TART_SSH_USER="${RNFB_TART_SSH_USER:-admin}"
export RNFB_TART_SSH_PASSWORD="${RNFB_TART_SSH_PASSWORD:-admin}"
export RNFB_TART_SSH_OPTS="${RNFB_TART_SSH_OPTS:--o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -o ServerAliveInterval=15 -o ServerAliveCountMax=4 -o PreferredAuthentications=password -o PubkeyAuthentication=no -o IdentitiesOnly=yes -o NumberOfPasswordPrompts=1}"
export RNFB_TART_SSH_TIMEOUT="${RNFB_TART_SSH_TIMEOUT:-3600}"
export RNFB_TART_ITERATION_TIMEOUT="${RNFB_TART_ITERATION_TIMEOUT:-7200}"

rnfb_tart_ts() {
  date -u '+%Y-%m-%dT%H:%M:%SZ'
}

rnfb_tart_log() {
  echo "[$(rnfb_tart_ts)] $*"
}

# Prefix every line read from stdin with an ISO-8601 UTC timestamp.
rnfb_tart_timestamp_stream() {
  while IFS= read -r line || [[ -n "$line" ]]; do
    printf '[%s] %s\n' "$(rnfb_tart_ts)" "$line"
  done
}

rnfb_tart_require() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    rnfb_tart_log "error: required command not found: ${cmd}" >&2
    exit 1
  fi
}

# Cirrus/Tart SSH sessions are non-login; always apply brew shellenv when present.
rnfb_tart_init_brew() {
  if [[ -x /opt/homebrew/bin/brew ]]; then
    # shellcheck disable=SC1091
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -x /usr/local/bin/brew ]]; then
    # shellcheck disable=SC1091
    eval "$(/usr/local/bin/brew shellenv)"
  elif ! command -v brew >/dev/null 2>&1; then
    echo "[tart] installing Homebrew..."
    NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    # shellcheck disable=SC1091
    eval "$(/opt/homebrew/bin/brew shellenv)"
  fi
  export HOMEBREW_NO_AUTO_UPDATE=1
}

rnfb_tart_vm_exists() {
  local vm="$1"
  tart list 2>/dev/null | grep -qE "[[:space:]]${vm}[[:space:]]"
}

# In-VM git clone has no access to the host's SSH keys.
rnfb_tart_init_ruby_path() {
  local gem_bin user_gem
  gem_bin="$(ruby -e 'print Gem.bindir' 2>/dev/null || true)"
  if [[ -n "$gem_bin" && -d "$gem_bin" ]]; then
    export PATH="${gem_bin}:${PATH}"
  fi
  user_gem="$(ruby -e 'print Gem.user_dir' 2>/dev/null)/bin"
  if [[ -d "$user_gem" ]]; then
    export PATH="${user_gem}:${PATH}"
  fi
}

rnfb_tart_init_ruby() {
  rnfb_tart_init_brew
  if ruby -e "exit(Gem::Version.new(RUBY_VERSION) >= Gem::Version.new('3.0.0') ? 0 : 1)" 2>/dev/null; then
    rnfb_tart_init_ruby_path
    return 0
  fi
  brew install ruby@3
  export PATH="$(brew --prefix ruby@3)/bin:${PATH}"
  rnfb_tart_init_ruby_path
}

rnfb_tart_init_cocoapods() {
  rnfb_tart_init_brew
  if command -v pod >/dev/null 2>&1; then
    return 0
  fi
  brew install cocoapods
}

rnfb_tart_init_brew_utils() {
  local tart_scripts="${1:-${RNFB_TART_SCRIPTS_MOUNT:-/Volumes/My Shared Files/tart-scripts}}"
  rnfb_tart_init_brew
  if command -v xcbeautify >/dev/null 2>&1 && command -v applesimutils >/dev/null 2>&1; then
    return 0
  fi
  bash "${tart_scripts}/lib/install-homebrew-utils.sh" applesimutils xcbeautify
}

rnfb_tart_https_repo_url() {
  local url="$1"
  if [[ "$url" =~ ^git@github\.com:(.+)$ ]]; then
    echo "https://github.com/${BASH_REMATCH[1]}"
  elif [[ "$url" =~ ^ssh://git@github\.com/(.+)$ ]]; then
    echo "https://github.com/${BASH_REMATCH[1]}"
  else
    echo "$url"
  fi
}

# virtiofs worktree mounts break git metadata; stale GIT_* vars break git ls-remote in prepare scripts.
rnfb_tart_sanitize_git_env() {
  unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES
  export GIT_TERMINAL_PROMPT=0
}

# Yarn prepare runs git ls-remote from the virtiofs mount; a broken .git gitfile breaks git even for remote ops.
rnfb_tart_hydrate_ai_mocks_from_prewarm() {
  local repo_root="$1"
  local prewarm_utils="${RNFB_TART_PREWARM_DIR}/packages/ai/__tests__/test-utils"
  local target_utils="${repo_root}/packages/ai/__tests__/test-utils"
  if [[ -d "$prewarm_utils" ]] && compgen -G "${prewarm_utils}/vertexai-sdk-test-data_"* >/dev/null; then
    echo "[iteration] hydrating AI mock test-utils from ${RNFB_TART_PREWARM_DIR}"
    mkdir -p "$target_utils"
    rsync -a "${prewarm_utils}/" "${target_utils}/"
  fi
}

# Reuse the prewarm checkout path so ccache keys match the warmed VM build.
export RNFB_LOCAL_REPO="${RNFB_LOCAL_REPO:-${RNFB_TART_PREWARM_DIR}}"

# virtiofs mounts at "/Volumes/My Shared Files/..." — RN codegen scripts break on unquoted spaces.
rnfb_tart_materialize_worktree() {
  local virtiofs_root="$1"
  local mock_backup=""

  echo "[iteration] materializing worktree → ${RNFB_LOCAL_REPO} (local disk, prewarm path for ccache)"

  if [[ -d "${RNFB_LOCAL_REPO}/packages/ai/__tests__/test-utils" ]] \
    && compgen -G "${RNFB_LOCAL_REPO}/packages/ai/__tests__/test-utils/vertexai-sdk-test-data_"* >/dev/null; then
    mock_backup="$(mktemp -d)"
    rsync -a "${RNFB_LOCAL_REPO}/packages/ai/__tests__/test-utils/" "${mock_backup}/"
  fi

  mkdir -p "$RNFB_LOCAL_REPO"
  rsync -a --delete \
    --exclude 'node_modules/' \
    --exclude 'tests/ios/build/' \
    --exclude 'tests/ios/Pods/' \
    --exclude '.yarn/cache/' \
    "${virtiofs_root}/" "${RNFB_LOCAL_REPO}/"

  if [[ -n "$mock_backup" ]] \
    && ! compgen -G "${RNFB_LOCAL_REPO}/packages/ai/__tests__/test-utils/vertexai-sdk-test-data_"* >/dev/null; then
    echo "[iteration] restoring AI mock test-utils from prewarm backup"
    mkdir -p "${RNFB_LOCAL_REPO}/packages/ai/__tests__/test-utils"
    rsync -a "${mock_backup}/" "${RNFB_LOCAL_REPO}/packages/ai/__tests__/test-utils/"
  fi
  [[ -n "$mock_backup" ]] && rm -rf "$mock_backup"
}

# Prewarm leaves DerivedData/ModuleCache under tests/ios/build; a fresh pod install +
# xcodebuild then hits "module defined in both .../Pods/../build/... and .../build/...".
rnfb_tart_clean_stale_ios_build() {
  local repo_root="$1"
  local ios_build="${repo_root}/tests/ios/build"
  if [[ -d "$ios_build" ]]; then
    echo "[iteration] removing stale tests/ios/build (prewarm DerivedData/ModuleCache)"
    rm -rf "$ios_build"
  fi
}

# Artifact layout: scripts/tart/artifacts/<session_id>/<mode>-iter<N>/ (session_id = UTC run start).
rnfb_tart_session_id_from_run_id() {
  echo "${1%-*}"
}

rnfb_tart_artifact_run_dir() {
  local run_id="$1"
  local iteration="$2"
  local session_id="${run_id%-*}"
  local mode="${run_id##*-}"
  echo "${session_id}/${mode}-iter${iteration}"
}

rnfb_tart_artifact_session_dir() {
  local tart_root="$1"
  local session_id="$2"
  echo "${tart_root}/artifacts/${session_id}"
}

rnfb_tart_sync_artifacts_to_virtiofs() {
  local virtiofs_root="$1"
  local local_root="$2"
  local run_dir="${3:-}"
  if [[ -n "$run_dir" ]]; then
    rnfb_tart_sync_artifacts_essential_to_virtiofs "$virtiofs_root" "$local_root" "$run_dir"
    return 0
  fi
  # Legacy: full tree sync (slow over virtiofs — avoid on iteration exit path).
  mkdir -p "${virtiofs_root}/scripts/tart/artifacts"
  if [[ -d "${local_root}/scripts/tart/artifacts" ]]; then
    rsync -a "${local_root}/scripts/tart/artifacts/" "${virtiofs_root}/scripts/tart/artifacts/" || true
  fi
}

# Small files only — must complete quickly so SSH can exit and host can detect completion.
rnfb_tart_sync_artifacts_essential_to_virtiofs() {
  local virtiofs_root="$1"
  local local_root="$2"
  local run_dir="$3"
  local src="${local_root}/scripts/tart/artifacts/${run_dir}"
  local dest="${virtiofs_root}/scripts/tart/artifacts/${run_dir}"
  mkdir -p "$dest"
  for f in iteration-complete.json ccache-stats.txt iteration-env.txt detox-step.log \
    flake-summary.txt resource-monitor.log metro.log springboard-invertase.log; do
    [[ -f "${src}/${f}" ]] && cp -f "${src}/${f}" "${dest}/" 2>/dev/null || true
  done
}

rnfb_tart_write_iteration_complete() {
  local run_dir="$1"
  local rc="$2"
  local artifacts_dir="$3"
  local out="${artifacts_dir}/iteration-complete.json"
  python3 - <<PY
import json, datetime, os
doc = {
    "finished_at": datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat(),
    "run_dir": "${run_dir}",
    "rc": int("${rc}"),
    "artifacts_dir": "${artifacts_dir}",
}
with open("${out}", "w") as f:
    json.dump(doc, f, indent=2)
    f.write("\n")
PY
  echo "[iteration] wrote ${out}"
}

rnfb_tart_iteration_complete_file() {
  local worktree="$1"
  local run_dir="$2"
  echo "${worktree}/scripts/tart/artifacts/${run_dir}/iteration-complete.json"
}

rnfb_tart_iteration_remote_log() {
  local run_dir="$1"
  echo "${RNFB_TART_VM_PREWARM_DIR}/scripts/tart/artifacts/${run_dir}/run-iteration.log"
}

rnfb_tart_read_iteration_rc() {
  local worktree="$1"
  local run_dir="$2"
  local complete_file
  complete_file="$(rnfb_tart_iteration_complete_file "$worktree" "$run_dir")"
  if [[ -f "$complete_file" ]]; then
    python3 -c "import json; print(json.load(open('${complete_file}'))['rc'])" 2>/dev/null || echo "1"
  else
    echo "1"
  fi
}

# Poll virtiofs worktree for iteration-complete.json (no long-lived SSH stream).
rnfb_tart_wait_iteration_complete() {
  local worktree="$1"
  local run_dir="$2"
  local timeout_sec="${3:-$RNFB_TART_ITERATION_TIMEOUT}"
  local complete_file
  complete_file="$(rnfb_tart_iteration_complete_file "$worktree" "$run_dir")"
  local waited=0
  rnfb_tart_log "[ephemeral] polling for completion marker (up to ${timeout_sec}s): ${complete_file}" >&2
  while (( waited < timeout_sec )); do
    if [[ -f "$complete_file" ]]; then
      rnfb_tart_log "[ephemeral] completion marker detected after ${waited}s" >&2
      rnfb_tart_read_iteration_rc "$worktree" "$run_dir"
      return 0
    fi
    sleep 10
    waited=$((waited + 10))
  done
  rnfb_tart_log "[ephemeral] timed out after ${timeout_sec}s waiting for ${complete_file}" >&2
  echo "124"
  return 124
}

# Fire-and-forget SSH: start run-iteration.sh under nohup on VM disk. Host does not wait.
rnfb_tart_launch_iteration_detached() {
  local vm="$1"
  local remote_log="$2"
  local remote_pid_file="$3"
  local repo_root="$4"
  local build_mode="$5"
  local run_id="$6"
  local iteration="$7"
  local headless_sim="$8"
  local remote_dir
  remote_dir="$(dirname "$remote_log")"
  local ip
  ip="$(rnfb_tart_vm_ip "$vm")"
  (
    sshpass -p "$RNFB_TART_SSH_PASSWORD" ssh $RNFB_TART_SSH_OPTS \
      "${RNFB_TART_SSH_USER}@${ip}" \
      "bash '${RNFB_TART_SCRIPTS_MOUNT}/launch-iteration-detached.sh' \
        '${remote_dir}' '${repo_root}' '${build_mode}' '${run_id}' '${iteration}' '${headless_sim}'" \
      2>/dev/null
  ) &
}

# Tail in-VM iteration log (for live status while host polls virtiofs).
rnfb_tart_tail_iteration_log() {
  local vm="$1"
  local remote_log="$2"
  local ip
  ip="$(rnfb_tart_vm_ip "$vm")"
  sshpass -p "$RNFB_TART_SSH_PASSWORD" ssh $RNFB_TART_SSH_OPTS \
    "${RNFB_TART_SSH_USER}@${ip}" "tail -f '${remote_log}'"
}

rnfb_tart_harvest_artifact_dir() {
  local vm="$1"
  local worktree="$2"
  local run_dir="$3"
  local remote="${RNFB_TART_VM_PREWARM_DIR}/scripts/tart/artifacts/${run_dir}"
  local dest="${worktree}/scripts/tart/artifacts/${run_dir}"
  mkdir -p "$dest"
  rnfb_tart_log "[ephemeral] harvesting bulk artifacts from ${vm}:${run_dir}"
  for f in run-iteration.log simulator.log testing.log simulator.mp4 xcodebuild-raw.log; do
    rnfb_tart_scp_from "$vm" "${remote}/${f}" "${dest}/" 2>/dev/null || true
  done
}

# Stop/delete an ephemeral VM. Idempotent — safe to call from EXIT trap and normal exit path.
# The VM stays running until this is called (after iteration poll + SCP harvest).
rnfb_tart_ephemeral_teardown() {
  local vm="$1"
  local run_pid="${2:-}"
  local delete_vm="${3:-1}"
  if [[ -n "${RNFB_TART_TEARDOWN_DONE:-}" ]]; then
    return 0
  fi
  export RNFB_TART_TEARDOWN_DONE=1

  rnfb_tart_log "[ephemeral] orchestrator teardown: stopping ${vm}"
  if [[ -n "$run_pid" ]]; then
    kill "$run_pid" 2>/dev/null || true
    wait "$run_pid" 2>/dev/null || true
  fi
  tart stop "$vm" 2>/dev/null || true
  if [[ "$delete_vm" -eq 1 ]]; then
    tart delete "$vm" 2>/dev/null || true
    rnfb_tart_log "[ephemeral] deleted ${vm}"
  else
    rnfb_tart_log "[ephemeral] stopped ${vm} (disk image kept)"
  fi
}

export RNFB_IOS_DERIVED_DATA="${RNFB_IOS_DERIVED_DATA:-$HOME/rnfb-xcode-derived}"

rnfb_tart_disable_ccache() {
  local libexec
  libexec="$(rnfb_tart_ccache_path)"
  if [[ -n "$libexec" ]]; then
    PATH="$(echo "$PATH" | tr ':' '\n' | grep -Fxv "$libexec" | paste -sd: - || true)"
    export PATH
  fi
}

rnfb_tart_vm_ip() {
  local vm="$1"
  tart ip "$vm"
}

rnfb_tart_ssh() {
  local vm="$1"
  shift
  local ip
  ip="$(rnfb_tart_vm_ip "$vm")"
  if command -v timeout >/dev/null 2>&1; then
    timeout "${RNFB_TART_SSH_TIMEOUT}" sshpass -p "$RNFB_TART_SSH_PASSWORD" \
      ssh $RNFB_TART_SSH_OPTS "${RNFB_TART_SSH_USER}@${ip}" "$@"
  else
    sshpass -p "$RNFB_TART_SSH_PASSWORD" ssh $RNFB_TART_SSH_OPTS "${RNFB_TART_SSH_USER}@${ip}" "$@"
  fi
}

rnfb_tart_scp_to() {
  local vm="$1"
  local src="$2"
  local dest="$3"
  local ip
  ip="$(rnfb_tart_vm_ip "$vm")"
  sshpass -p "$RNFB_TART_SSH_PASSWORD" scp $RNFB_TART_SSH_OPTS "$src" "${RNFB_TART_SSH_USER}@${ip}:${dest}"
}

rnfb_tart_scp_from() {
  local vm="$1"
  local remote="$2"
  local dest="$3"
  local ip
  ip="$(rnfb_tart_vm_ip "$vm")"
  if command -v timeout >/dev/null 2>&1; then
    timeout "${RNFB_TART_SSH_TIMEOUT}" sshpass -p "$RNFB_TART_SSH_PASSWORD" \
      scp $RNFB_TART_SSH_OPTS "${RNFB_TART_SSH_USER}@${ip}:${remote}" "$dest"
  else
    sshpass -p "$RNFB_TART_SSH_PASSWORD" scp $RNFB_TART_SSH_OPTS "${RNFB_TART_SSH_USER}@${ip}:${remote}" "$dest"
  fi
}

rnfb_tart_wait_ssh() {
  local vm="$1"
  local max_wait="${2:-180}"
  local waited=0
  rnfb_tart_log "[tart] waiting for SSH on ${vm} (up to ${max_wait}s)..."
  while (( waited < max_wait )); do
    if rnfb_tart_ssh "$vm" "true" >/dev/null 2>&1; then
      rnfb_tart_log "[tart] SSH ready on ${vm} after ${waited}s"
      return 0
    fi
    sleep 5
    waited=$((waited + 5))
  done
  echo "error: SSH not ready on ${vm} after ${max_wait}s" >&2
  return 1
}

rnfb_tart_read_manifest_field() {
  local file="$1"
  local field="$2"
  python3 -c "import json; print(json.load(open('${file}'))['${field}'])" 2>/dev/null || true
}

rnfb_tart_ccache_path() {
  if command -v brew >/dev/null 2>&1; then
    local prefix
    prefix="$(brew --prefix ccache 2>/dev/null || true)"
    if [[ -n "$prefix" && -d "${prefix}/libexec" ]]; then
      echo "${prefix}/libexec"
      return 0
    fi
  fi
  echo "/opt/homebrew/opt/ccache/libexec"
}

rnfb_tart_enable_ccache() {
  local libexec
  libexec="$(rnfb_tart_ccache_path)"
  if [[ -d "$libexec" ]]; then
    export PATH="${libexec}:${PATH}"
  fi
  mkdir -p "$CCACHE_DIR"
  export USE_CCACHE=1
  if command -v ccache >/dev/null 2>&1; then
    ccache --set-config=max_size="${CCACHE_MAXSIZE}" >/dev/null 2>&1 || true
    ccache --set-config=base_dir="${CCACHE_BASEDIR}" >/dev/null 2>&1 || true
  fi
}

rnfb_tart_log_ccache() {
  local label="$1"
  echo "[ccache] ${label}:"
  if command -v ccache >/dev/null 2>&1; then
    ccache -s 2>/dev/null | sed 's/^/  /' || true
    echo "[ccache] clang=$(command -v clang 2>/dev/null || echo missing)"
  else
    echo "[ccache] ccache binary not found"
  fi
}

rnfb_tart_capture_ccache_stats() {
  local label="$1"
  local stats_file="${RNFB_CCACHE_STATS_FILE:-ccache-stats.txt}"
  {
    echo "=== ${label} @ $(date -u '+%Y-%m-%dT%H:%M:%SZ') ==="
    echo "USE_CCACHE=${USE_CCACHE:-}"
    echo "CCACHE_DIR=${CCACHE_DIR:-}"
    echo "CCACHE_BASEDIR=${CCACHE_BASEDIR:-}"
    echo "CCACHE_SLOPPINESS=${CCACHE_SLOPPINESS:-}"
    echo "clang=$(command -v clang 2>/dev/null || echo missing)"
    echo "ccache=$(command -v ccache 2>/dev/null || echo missing)"
    if command -v ccache >/dev/null 2>&1; then
      ccache -s 2>/dev/null || true
    else
      echo "ccache binary not found"
    fi
    echo
  } >> "$stats_file"
  rnfb_tart_log_ccache "$label"
}

rnfb_tart_write_iteration_env() {
  local out_file="${1:-iteration-env.txt}"
  local repo_root="${2:-.}"
  local warmed_manifest="${RNFB_TART_SCRIPTS_MOUNT}/manifests/warmed-main.json"
  {
    echo "=== iteration env @ $(date -u '+%Y-%m-%dT%H:%M:%SZ') ==="
    echo "repo_root=${repo_root}"
    echo "RNFB_TART_PREWARM_DIR=${RNFB_TART_PREWARM_DIR}"
    echo "YARN_CACHE_FOLDER=${YARN_CACHE_FOLDER}"
    echo "CCACHE_DIR=${CCACHE_DIR}"
    echo "CCACHE_BASEDIR=${CCACHE_BASEDIR}"
    echo "USE_CCACHE=${USE_CCACHE:-}"
    echo "BUILD_MODE=${RNFB_BUILD_MODE:-}"
    echo "RUN_ID=${RNFB_RUN_ID:-}"
    echo "ITERATION=${RNFB_ITERATION:-}"
    echo "HEADLESS_SIMULATOR=${RNFB_HEADLESS_SIMULATOR:-}"
    if [[ -f "${repo_root}/yarn.lock" ]]; then
      echo "yarn_lock_sha256=$(shasum -a 256 "${repo_root}/yarn.lock" | awk '{print $1}')"
    fi
    if [[ -f "${repo_root}/tests/ios/Podfile.lock" ]]; then
      echo "podfile_lock_sha256=$(shasum -a 256 "${repo_root}/tests/ios/Podfile.lock" | awk '{print $1}')"
    fi
    if git -C "$repo_root" rev-parse HEAD >/dev/null 2>&1; then
      echo "git_head=$(git -C "$repo_root" rev-parse HEAD)"
      echo "git_branch=$(git -C "$repo_root" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
    fi
    if [[ -f "$warmed_manifest" ]]; then
      echo "--- warmed-main.json (baked) ---"
      python3 - <<PY
import json
w = json.load(open("${warmed_manifest}"))
print(f"main_commit={w.get('main_commit','')}")
print(f"prewarmed_at={w.get('prewarmed_at','')}")
print(f"yarn_lock_sha256={w.get('yarn_lock_sha256','')}")
print(f"podfile_lock_sha256={w.get('podfile_lock_sha256','')}")
PY
    fi
    echo
  } > "$out_file"
}

rnfb_tart_start_yeetd() {
  if command -v yeetd >/dev/null 2>&1; then
    pgrep -x yeetd >/dev/null 2>&1 || yeetd &
  fi
  launchctl unload -w /System/Library/LaunchAgents/com.apple.ReportCrash.plist 2>/dev/null || true
  sudo launchctl unload -w /System/Library/LaunchDaemons/com.apple.ReportCrash.Root.plist 2>/dev/null || true
}
