#!/bin/bash
# Sourced by build scripts that wipe a DerivedData path before xcodebuild.
#
# wipeable_derived_data_path <path> <repo-root> prints the physical path, or
# prints why it refuses and returns 2. The basename must contain
# "derived-data" or "DerivedData", the path must not contain a ".." component,
# and it must not be /, $HOME, the repo root, or an ancestor of either.
#
# repo_path_tag <repo-root> prints the first 8 hex characters of the SHA-1 of
# the physical repo root path, so /tmp defaults differ between worktrees.

repo_path_tag() {
  (cd "$1" && pwd -P) | tr -d '\n' | shasum | cut -c1-8
}

wipeable_derived_data_path() {
  local path="$1" repo_root="$2" parent rest="" resolved forbidden
  if [[ -z "$path" ]]; then
    echo "refusing to wipe an empty DerivedData path" >&2
    return 2
  fi
  case "/${path}/" in
    */../*)
      echo "refusing to wipe DerivedData path '${path}': it contains a '..' component" >&2
      return 2
      ;;
  esac
  if [[ "${#path}" -gt 1 ]]; then
    path="${path%/}"
  fi
  if [[ "$path" == "/" ]]; then
    echo "refusing to wipe DerivedData path '/'" >&2
    return 2
  fi
  parent="$path"
  while [[ ! -d "$parent" ]]; do
    rest="/$(basename "$parent")${rest}"
    parent="$(dirname "$parent")"
  done
  resolved="$(cd "$parent" && pwd -P)${rest}"
  while [[ "$resolved" == *//* ]]; do
    resolved="${resolved//\/\//\/}"
  done
  while [[ "${#resolved}" -gt 1 && "$resolved" == */ ]]; do
    resolved="${resolved%/}"
  done
  if [[ "$resolved" == "/" || -z "$resolved" ]]; then
    echo "refusing to wipe DerivedData path '${path}' (resolves to '${resolved}')" >&2
    return 2
  fi
  case "$(basename "$resolved")" in
    *derived-data* | *DerivedData*) ;;
    *)
      echo "refusing to wipe DerivedData path '${path}' (resolves to '${resolved}'): its basename must contain 'derived-data'" >&2
      return 2
      ;;
  esac
  for forbidden in "$HOME" "$repo_root"; do
    [[ -n "$forbidden" && -d "$forbidden" ]] || continue
    forbidden="$(cd "$forbidden" && pwd -P)"
    case "${forbidden}/" in
      "${resolved}"/*)
        echo "refusing to wipe DerivedData path '${path}' (resolves to '${resolved}'): it is or contains ${forbidden}" >&2
        return 2
        ;;
    esac
  done
  echo "$resolved"
}
