#!/usr/bin/env bash
set -euo pipefail

( crontab -l 2>/dev/null; echo "0 2 * * * /var/www/language-learning-service/deploy/scripts/db_backup.sh >> /var/log/app/db-backup.log 2>&1" ) | crontab -
