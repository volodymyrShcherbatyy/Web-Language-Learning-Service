#!/usr/bin/env bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
APP_ROOT="/var/www/language-learning-service"
LOG_ROOT="/var/log/app"
DB_NAME="language_learning_prod"
DB_USER="language_learning_app"
DB_PASS="$(openssl rand -base64 32 | tr -d '\n')"
JWT_SECRET="$(openssl rand -hex 64)"
JWT_EXPIRES="12h"
SERVER_IP="$(curl -4 -s ifconfig.me)"

sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg unzip git build-essential nginx ufw certbot python3-certbot-nginx postgresql postgresql-contrib

curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

sudo mkdir -p "$APP_ROOT"
sudo rsync -a --delete /workspace/Web-Language-Learning-Service/ "$APP_ROOT"/
sudo chown -R "$USER":"$USER" "$APP_ROOT"

sudo mkdir -p "$LOG_ROOT"
sudo chown -R "$USER":"$USER" "$LOG_ROOT"

sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';" || true
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

sudo sed -i "s/^#listen_addresses =.*/listen_addresses = 'localhost'/" /etc/postgresql/14/main/postgresql.conf
sudo systemctl restart postgresql

cat > "$APP_ROOT/.env" <<EOT
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES=${JWT_EXPIRES}
NODE_ENV=production
EOT
chmod 600 "$APP_ROOT/.env"

cd "$APP_ROOT"
npm ci
psql "postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}" -f sql/schema.sql
psql "postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}" -f migrations/001_learning_system.sql

cd "$APP_ROOT/frontend"
npm ci
VITE_API_BASE_URL="https://language-learning.app/api" npm run build

cd "$APP_ROOT"
pm2 start deploy/pm2/ecosystem.config.cjs
pm2 save
sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$HOME"

sudo cp deploy/nginx/language-learning.conf /etc/nginx/sites-available/language-learning
sudo ln -sf /etc/nginx/sites-available/language-learning /etc/nginx/sites-enabled/language-learning
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "Point language-learning.app and www.language-learning.app to ${SERVER_IP} before issuing SSL certificates."
echo "Then run: sudo certbot --nginx -d language-learning.app -d www.language-learning.app --redirect --agree-tos -m admin@language-learning.app --non-interactive"

echo "Database password: ${DB_PASS}"
echo "JWT secret generated and saved to ${APP_ROOT}/.env"
