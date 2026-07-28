#!/usr/bin/env bash
set -euo pipefail

WORKER_CAP="${GRADLE_WORKER_CAP:-6}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

resolve_physical_cpus() {
  local cpus

  case "$(uname -s)" in
    Darwin)
      if cpus="$(sysctl -n hw.physicalcpu 2>/dev/null)" && [[ "$cpus" =~ ^[0-9]+$ ]] && (( cpus >= 1 )); then
        echo "$cpus"
        return
      fi
      ;;
    Linux)
      if command -v lscpu >/dev/null 2>&1; then
        cpus="$(lscpu -p=CORE 2>/dev/null | grep -Ev '^#' | sort -u | wc -l | tr -d ' ')"
        if [[ "$cpus" =~ ^[0-9]+$ ]] && (( cpus >= 1 )); then
          echo "$cpus"
          return
        fi
        local sockets cores_per_socket
        sockets="$(lscpu 2>/dev/null | awk '/^Socket\(s\)/ {print $2; exit}')"
        cores_per_socket="$(lscpu 2>/dev/null | awk '/^Core\(s\) per socket/ {print $4; exit}')"
        if [[ "$sockets" =~ ^[0-9]+$ && "$cores_per_socket" =~ ^[0-9]+$ ]] && (( sockets >= 1 && cores_per_socket >= 1 )); then
          echo $(( sockets * cores_per_socket ))
          return
        fi
      fi
      if [[ -r /proc/cpuinfo ]]; then
        cpus="$(awk '/^physical id/ {pid=$4} /^core id/ {cid=$4; k=pid","cid; if (!seen[k]++) n++} END {print n+0}' /proc/cpuinfo)"
        if [[ "$cpus" =~ ^[0-9]+$ ]] && (( cpus >= 1 )); then
          echo "$cpus"
          return
        fi
      fi
      ;;
  esac

  # Fallback: assume SMT — use half of logical CPUs
  local logical=4
  if command -v getconf >/dev/null 2>&1; then
    logical="$(getconf _NPROCESSORS_ONLN)"
  elif [[ -r /proc/cpuinfo ]]; then
    logical="$(grep -c ^processor /proc/cpuinfo)"
  fi
  echo $(( logical / 2 > 0 ? logical / 2 : 1 ))
}

cpus="$(resolve_physical_cpus)"
workers=$(( cpus < WORKER_CAP ? cpus : WORKER_CAP ))
(( workers >= 1 )) || workers=1

echo "[gradlew-with-worker-cap] cpus=$cpus cap=$WORKER_CAP -> --max-workers=$workers" >&2
exec ./gradlew --max-workers="$workers" "$@"
