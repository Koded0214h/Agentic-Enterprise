#!/bin/bash
set -e

echo "==> Waiting for database..."
until python -c "
import os, sys
import dj_database_url, psycopg2
url = os.environ.get('DATABASE_URL', '')
if not url:
    sys.exit(0)
cfg = dj_database_url.parse(url)
try:
    conn = psycopg2.connect(
        host=cfg.get('HOST'), port=cfg.get('PORT') or 5432,
        dbname=cfg.get('NAME'), user=cfg.get('USER'), password=cfg.get('PASSWORD'),
        connect_timeout=3,
    )
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f'  db not ready: {e}')
    sys.exit(1)
"; do
    sleep 2
done
echo "==> Database ready."

echo "==> Running migrations..."
python manage.py migrate --noinput

echo "==> Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true

echo "==> Starting server..."
exec "$@"
