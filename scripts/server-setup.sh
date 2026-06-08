#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# AOS Server Setup — run once on a fresh Ubuntu 22.04 VPS
#
# Usage:
#   curl -sL https://raw.githubusercontent.com/koded0214h/agentic-enterprise/main/scripts/server-setup.sh | bash
#   OR: scp scripts/server-setup.sh user@server: && ssh user@server bash server-setup.sh
#
# What it does:
#   1. Installs Docker + Docker Compose v2
#   2. Clones the repo to /opt/aos
#   3. Sets up DuckDNS IP auto-update cron
#   4. Issues Let's Encrypt SSL cert
#   5. Starts the stack
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Configuration — set these before running ────────────────────────────────
DUCKDNS_DOMAIN="${DUCKDNS_DOMAIN:-}"         # e.g. aos-api
DUCKDNS_TOKEN="${DUCKDNS_TOKEN:-}"           # from duckdns.org/install
REPO_URL="${REPO_URL:-https://github.com/koded0214h/agentic-enterprise.git}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/aos}"
EMAIL="${EMAIL:-coder0214h@gmail.com}"       # for Let's Encrypt

if [[ -z "$DUCKDNS_DOMAIN" || -z "$DUCKDNS_TOKEN" ]]; then
    echo "ERROR: Set DUCKDNS_DOMAIN and DUCKDNS_TOKEN before running."
    echo "  export DUCKDNS_DOMAIN=your-subdomain"
    echo "  export DUCKDNS_TOKEN=your-token"
    exit 1
fi

FULL_DOMAIN="${DUCKDNS_DOMAIN}.duckdns.org"

echo "===================================================================="
echo " AOS Server Setup"
echo " Domain : $FULL_DOMAIN"
echo " Dir    : $DEPLOY_DIR"
echo "===================================================================="

# ── 1. System packages ───────────────────────────────────────────────────────
apt-get update -qq
apt-get install -y --no-install-recommends \
    ca-certificates curl gnupg git ufw

# ── 2. Docker ────────────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
    echo "--> Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
fi

# Ensure docker compose v2 plugin
docker compose version &>/dev/null || apt-get install -y docker-compose-plugin

echo "--> Docker $(docker --version)"

# ── 3. Firewall ──────────────────────────────────────────────────────────────
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ── 4. Clone / update repo ───────────────────────────────────────────────────
if [[ -d "$DEPLOY_DIR/.git" ]]; then
    echo "--> Updating repo..."
    git -C "$DEPLOY_DIR" pull origin main
else
    echo "--> Cloning repo..."
    git clone "$REPO_URL" "$DEPLOY_DIR"
fi

# ── 5. DuckDNS IP auto-update ────────────────────────────────────────────────
echo "--> Setting up DuckDNS auto-update..."
mkdir -p /opt/duckdns
cat > /opt/duckdns/update.sh <<EOF
#!/bin/bash
curl -s "https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip=" \
    >> /var/log/duckdns.log 2>&1
EOF
chmod +x /opt/duckdns/update.sh

# Update every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/duckdns/update.sh") | sort -u | crontab -

# Run now to point DuckDNS to this server immediately
/opt/duckdns/update.sh
echo "    DuckDNS updated. Your domain: $FULL_DOMAIN"

# ── 6. Copy .env ─────────────────────────────────────────────────────────────
if [[ ! -f "$DEPLOY_DIR/.env" ]]; then
    echo ""
    echo "================================================================"
    echo " IMPORTANT: Create $DEPLOY_DIR/.env before continuing."
    echo " Template: $DEPLOY_DIR/.env.production.example"
    echo ""
    echo " At minimum set:"
    echo "   DATABASE_URL=postgresql://... (from Neon)"
    echo "   DJANGO_SECRET_KEY=..."
    echo "   ALLOWED_HOSTS=$FULL_DOMAIN"
    echo "   DUCKDNS_DOMAIN=$DUCKDNS_DOMAIN"
    echo "   DUCKDNS_TOKEN=$DUCKDNS_TOKEN"
    echo "================================================================"
    cp "$DEPLOY_DIR/.env.production.example" "$DEPLOY_DIR/.env"
    echo "Copied example .env — edit it now, then re-run this script."
    exit 0
fi

# ── 7. Update nginx config with real domain ──────────────────────────────────
echo "--> Configuring nginx for $FULL_DOMAIN..."
sed -i "s/YOUR_SUBDOMAIN.duckdns.org/$FULL_DOMAIN/g" \
    "$DEPLOY_DIR/nginx/conf.d/aos.conf"

# ── 8. Start stack without SSL first (for certbot http-01 challenge) ─────────
echo "--> Starting nginx (HTTP only, for cert challenge)..."
cd "$DEPLOY_DIR"

# Temporarily use an HTTP-only nginx config for the cert challenge
cat > /tmp/nginx-init.conf <<EOF
events { worker_connections 1024; }
http {
    server {
        listen 80;
        server_name $FULL_DOMAIN;
        location /.well-known/acme-challenge/ { root /var/www/certbot; }
        location / { return 200 'OK'; }
    }
}
EOF

docker run -d --name nginx-init \
    -p 80:80 \
    -v /tmp/nginx-init.conf:/etc/nginx/nginx.conf:ro \
    -v aos_certbot_www:/var/www/certbot \
    nginx:1.27-alpine 2>/dev/null || true

sleep 3

# ── 9. Issue SSL certificate ──────────────────────────────────────────────────
echo "--> Issuing Let's Encrypt certificate for $FULL_DOMAIN..."
docker run --rm \
    -v aos_certbot_conf:/etc/letsencrypt \
    -v aos_certbot_www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    --email "$EMAIL" --agree-tos --no-eff-email \
    -d "$FULL_DOMAIN" \
    && echo "    SSL certificate issued." \
    || echo "    WARNING: cert failed — check DuckDNS DNS propagation, then run certbot manually."

docker stop nginx-init 2>/dev/null || true
docker rm nginx-init 2>/dev/null || true

# ── 10. Launch full stack ────────────────────────────────────────────────────
echo "--> Launching AOS stack..."
docker compose -f "$DEPLOY_DIR/docker-compose.prod.yml" up -d

echo ""
echo "===================================================================="
echo " Done! AOS backend should be up at:"
echo "   https://$FULL_DOMAIN/api/health/"
echo ""
echo " Useful commands:"
echo "   docker compose -f /opt/aos/docker-compose.prod.yml logs -f backend"
echo "   docker compose -f /opt/aos/docker-compose.prod.yml ps"
echo "===================================================================="
