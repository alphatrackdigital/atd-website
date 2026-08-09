#!/usr/bin/env bash
set -euo pipefail

document_root_input="${1:-}"
release_id="${2:-}"

if [[ -z "$document_root_input" || -z "$release_id" ]]; then
  echo "Usage: activate-cpanel-release.sh DOCUMENT_ROOT RELEASE_ID" >&2
  exit 2
fi
if [[ ! "$release_id" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "Invalid release ID." >&2
  exit 2
fi

home_real="$(realpath "$HOME")"
document_root="$(realpath "$document_root_input")"
release_dir="$home_real/.atd-releases/$release_id"
backup_dir="$home_real/.atd-backups/$release_id"

case "$document_root" in
  "$home_real"/*) ;;
  *) echo "Document root must be a directory below the cPanel account home." >&2; exit 2 ;;
esac
if [[ "$document_root" == "$home_real" || "$document_root" == "/" ]]; then
  echo "Refusing unsafe document root: $document_root" >&2
  exit 2
fi
if [[ ! -d "$document_root" || ! -f "$document_root/index.html" ]]; then
  echo "Document root must exist and contain the current site index.html." >&2
  exit 2
fi
if [[ ! -d "$release_dir" || ! -f "$release_dir/index.html" || ! -f "$release_dir/.htaccess" ]]; then
  echo "Uploaded release is incomplete: $release_dir" >&2
  exit 2
fi
if [[ -e "$backup_dir" ]]; then
  echo "Backup already exists for $release_id; refusing to overwrite it." >&2
  exit 2
fi

mkdir -p "$home_real/.atd-backups"
mkdir "$backup_dir"

# cPanel/ACME-managed paths are retained independently of the static site release.
rsync -a \
  --exclude='.well-known/' \
  --exclude='cgi-bin/' \
  "$document_root/" "$backup_dir/"

restore_backup() {
  echo "Activation failed; restoring the pre-deploy backup." >&2
  rsync -a --delete-after \
    --exclude='.well-known/' \
    --exclude='cgi-bin/' \
    "$backup_dir/" "$document_root/"
}

if ! rsync -a --delete-after \
  --exclude='.well-known/' \
  --exclude='cgi-bin/' \
  "$release_dir/" "$document_root/"; then
  restore_backup
  exit 1
fi

if ! printf '%s\n' "$release_id" > "$home_real/.atd-current-release"; then
  restore_backup
  exit 1
fi
echo "Activated ATD release $release_id; backup saved at $backup_dir"
