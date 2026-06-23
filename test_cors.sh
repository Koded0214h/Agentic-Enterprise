#!/usr/bin/env bash
# CORS smoke test for https://aos-api.viewdns.net
# Usage: ./test_cors.sh [origin]

BASE="https://aos-api.viewdns.net"
ORIGIN="${1:-http://localhost:3000}"

echo "=== Testing CORS from origin: $ORIGIN ==="
echo

echo "--- 1. Preflight (OPTIONS) ---"
curl -si -X OPTIONS "$BASE/api/health/" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  | grep -E "HTTP/|Access-Control-|Vary:|content-type"

echo
echo "--- 2. Simple GET /health/ ---"
curl -si "$BASE/health/" \
  -H "Origin: $ORIGIN" \
  | grep -E "HTTP/|Access-Control-|content-type|^\{"

echo
echo "--- 3. Preflight from disallowed origin (should get no CORS headers) ---"
curl -si -X OPTIONS "$BASE/api/health/" \
  -H "Origin: https://evil.example.com" \
  -H "Access-Control-Request-Method: GET" \
  | grep -E "HTTP/|Access-Control-"

echo
echo "--- 4. POST preflight (login endpoint) ---"
curl -si -X OPTIONS "$BASE/api/auth/login/" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  | grep -E "HTTP/|Access-Control-"
