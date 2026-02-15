# Production Deployment Runbook (Ubuntu 22.04 VPS)

## 1) VPS setup commands

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg unzip git build-essential nginx ufw certbot python3-certbot-nginx postgresql postgresql-contrib
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
node -v
npm -v
pm2 -v
```

## 2) Node installation and application checkout

```bash
sudo mkdir -p /var/www/language-learning-service
sudo rsync -a --delete /workspace/Web-Language-Learning-Service/ /var/www/language-learning-service/
sudo chown -R $USER:$USER /var/www/language-learning-service
cd /var/www/language-learning-service
npm ci
cd frontend
npm ci
cd ..
```

## 3) PostgreSQL setup

```bash
DB_NAME="language_learning_prod"
DB_USER="language_learning_app"
DB_PASSWORD="$(openssl rand -base64 32 | tr -d '\n')"

sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
sudo sed -i "s/^#listen_addresses =.*/listen_addresses = 'localhost'/" /etc/postgresql/14/main/postgresql.conf
sudo systemctl restart postgresql
```

Run schema and migrations:

```bash
cd /var/www/language-learning-service
psql "postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}" -f sql/schema.sql
psql "postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}" -f migrations/001_learning_system.sql
```

## 4) Environment config (`/backend/.env` equivalent)

This repository backend root is `/var/www/language-learning-service`; create `.env` there:

```bash
JWT_SECRET="$(openssl rand -hex 64)"
cat > /var/www/language-learning-service/.env <<EOT
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=language_learning_prod
DB_USER=language_learning_app
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES=12h
NODE_ENV=production
EOT
chmod 600 /var/www/language-learning-service/.env
```

## 5) Frontend production build

```bash
cd /var/www/language-learning-service/frontend
VITE_API_BASE_URL="https://language-learning.app/api" npm run build
```

## 6) Nginx configuration

Install bundled config:

```bash
sudo cp /var/www/language-learning-service/deploy/nginx/language-learning.conf /etc/nginx/sites-available/language-learning
sudo ln -sf /etc/nginx/sites-available/language-learning /etc/nginx/sites-enabled/language-learning
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Configuration includes:
- React SPA static hosting from `frontend/dist`
- `try_files ... /index.html` fallback
- `/api/` proxy to backend on `127.0.0.1:5000`
- gzip compression
- static asset caching headers

## 7) PM2 setup and runtime commands

Start backend:

```bash
sudo mkdir -p /var/log/app
sudo chown -R $USER:$USER /var/log/app
cd /var/www/language-learning-service
pm2 start deploy/pm2/ecosystem.config.cjs
pm2 save
sudo env PATH=$PATH pm2 startup systemd -u $USER --hp $HOME
```

Operational commands:

```bash
pm2 start deploy/pm2/ecosystem.config.cjs
pm2 restart language-learning-backend
pm2 logs language-learning-backend
pm2 monit
```

## 8) DNS and SSL (Let’s Encrypt)

Point DNS A records:
- `language-learning.app` -> VPS public IP
- `www.language-learning.app` -> VPS public IP

Issue and install certificate:

```bash
sudo certbot --nginx -d language-learning.app -d www.language-learning.app --redirect --agree-tos -m admin@language-learning.app --non-interactive
sudo systemctl reload nginx
```

## 9) Security hardening

```bash
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose
```

Backend should only bind to localhost through Nginx public ingress.

## 10) Logging

PM2 log files:
- `/var/log/app/backend-out.log`
- `/var/log/app/backend-error.log`

Auth failures and API errors are written to process stderr and captured in PM2 error logs.

## 11) Daily backups with 7-day retention

```bash
sudo chmod +x /var/www/language-learning-service/deploy/scripts/db_backup.sh
sudo chmod +x /var/www/language-learning-service/deploy/scripts/configure_backups.sh
/var/www/language-learning-service/deploy/scripts/configure_backups.sh
```

Manual backup run:

```bash
/var/www/language-learning-service/deploy/scripts/db_backup.sh
```

## 12) Optional CI/CD (Git-based auto deploy)

Use bundled deployment script:

```bash
sudo chmod +x /var/www/language-learning-service/deploy/scripts/deploy.sh
```

Integrate into your Git provider’s runner on push to `main`:

```bash
/var/www/language-learning-service/deploy/scripts/deploy.sh
```

## 13) Final deployment validation checklist

```bash
curl -sS https://language-learning.app/api/health
curl -sS https://language-learning.app
curl -sS -X POST https://language-learning.app/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@language-learning.app","password":"StrongAdminPass123!"}'
```

Validate in browser:
1. Frontend loads via domain.
2. Authentication works.
3. Lessons load.
4. Summary page loads.
5. Localization strings load.
6. Admin panel is accessible.
7. Media uploads succeed.
