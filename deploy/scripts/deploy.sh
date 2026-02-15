#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/var/www/language-learning-service"
cd "$APP_ROOT"

git fetch --all --prune
git reset --hard origin/main

npm ci
psql "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" -f migrations/001_learning_system.sql

cd "$APP_ROOT/frontend"
npm ci
VITE_API_BASE_URL="https://language-learning.app/api" npm run build

cd "$APP_ROOT"
pm2 restart language-learning-backend
