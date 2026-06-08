# ──────────────────────────────────────────────────────────────
# AOS Backend — builds from repo root so agent-swarm/ is included
# ──────────────────────────────────────────────────────────────

# Stage 1: dependency cache layer
FROM python:3.12-slim-bookworm AS deps

WORKDIR /deps

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt backend-requirements.txt
COPY agent-swarm/requirements-runtime.txt swarm-requirements.txt

RUN pip install --no-cache-dir -r backend-requirements.txt \
    && pip install --no-cache-dir -r swarm-requirements.txt


# Stage 2: production image
FROM python:3.12-slim-bookworm AS production

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/agent-swarm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from deps stage
COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Copy source — backend and swarm runtime
COPY backend/ backend/
COPY agent-swarm/ agent-swarm/

# Collect static files
WORKDIR /app/backend
RUN python manage.py collectstatic --noinput --settings=backend.settings || true

RUN chmod +x /app/backend/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/backend/docker-entrypoint.sh"]
CMD ["gunicorn", "backend.wsgi:application", \
     "--workers", "4", \
     "--worker-class", "sync", \
     "--bind", "0.0.0.0:8000", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--timeout", "120"]
