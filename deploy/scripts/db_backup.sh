#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/language-learning"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
FILE_PATH="${BACKUP_DIR}/language_learning_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

if [[ -f /var/www/language-learning-service/.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source /var/www/language-learning-service/.env
  set +a
fi

PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" | gzip > "$FILE_PATH"
find "$BACKUP_DIR" -type f -name 'language_learning_*.sql.gz' -mtime +7 -delete
