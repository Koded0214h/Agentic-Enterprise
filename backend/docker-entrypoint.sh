#!/bin/bash

# Wait for database to be ready
echo "Waiting for postgres..."

# If you have netcat installed, you can use it to wait for the port
# while ! nc -z db 5432; do
#   sleep 0.1
# done

echo "PostgreSQL started"

# Apply database migrations
echo "Apply database migrations"
python manage.py migrate

# Create superuser if not exists
# python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')"

# Start server
exec "$@"
