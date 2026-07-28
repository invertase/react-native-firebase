#!/usr/bin/env bash
# Host: stop (and optionally delete) an ephemeral VM left running by run-ephemeral.sh.
set -euo pipefail

# shellcheck source=lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

rnfb_tart_require tart

VM=""
DELETE=0

usage() {
  cat <<EOF
usage: $0 VM_NAME [--delete]

Stop an ephemeral VM. Pass --delete to remove the disk image after stopping.

  tart list | grep rnfb-e2e
  $0 rnfb-e2e-<uuid>
  $0 rnfb-e2e-<uuid> --delete
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --delete) DELETE=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) VM="$1"; shift ;;
  esac
done

if [[ -z "$VM" ]]; then
  usage >&2
  exit 1
fi

if ! rnfb_tart_vm_exists "$VM"; then
  echo "error: VM ${VM} not found" >&2
  exit 1
fi

rnfb_tart_ephemeral_teardown "$VM" "" "$DELETE"
