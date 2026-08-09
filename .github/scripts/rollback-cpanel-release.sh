#!/usr/bin/env bash
set -euo pipefail

document_root_input="${1:-}"
release_id="${2:-}"

if [[ -z "$document_root_input" || ! "$release_id" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "Usage: rollback-cpanel-release.sh DOCUMENT_ROOT RELEASE_ID" >&2
  exit 2
fi

home_real="$(realpath "$HOME")"
document_root="$(realpath "$document_root_input")"
backup_dir="$home_real/.atd-backups/$release_id"

case "$document_root" in
  "$home_real"/*) ;;
  *) echo "Document root must be a directory below the cPanel account home." >&2; exit 2 ;;
esac
if [[ "$document_root" == "$home_real" || "$document_root" == "/" ]]; then
  echo "Refusing unsafe document root: $document_root" >&2
  exit 2
fi
if [[ ! -d "$document_root" || ! -d "$backup_dir" || ! -f "$backup_dir/index.html" ]]; then
  echo "Document root or backup is missing/incomplete." >&2
  exit 2
fi

rsync -a --delete-after \
  --exclude='.well-known/' \
  --exclude='cgi-bin/' \
  "$backup_dir/" "$document_root/"

printf 'rollback:%s\n' "$release_id" > "$home_real/.atd-current-release"
echo "Rolled back ATD release $release_id"
