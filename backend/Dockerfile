# Stage 1: Builder
FROM python:3.9-slim-buster AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements.txt to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Production
FROM python:3.9-slim-buster AS production

WORKDIR /app

# Copy only necessary runtime dependencies from builder
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin/gunicorn /usr/local/bin/gunicorn
COPY --from=builder /usr/local/bin/uvicorn /usr/local/bin/uvicorn

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application with Gunicorn and Uvicorn workers
# Assuming your main FastAPI app is in `app/main.py` and the app instance is named `app`
CMD ["gunicorn", "app.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]