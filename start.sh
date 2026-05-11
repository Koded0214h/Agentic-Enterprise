#!/usr/bin/env bash
# =============================================================================
#  AOS + Agent Swarm — unified startup script
#  Usage:
#    ./start.sh          — start everything
#    ./start.sh --stop   — kill all managed processes
#    ./start.sh --status — show what's running
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"
SWARM_DIR="$REPO_ROOT/agent-swarm"
LOG_DIR="$REPO_ROOT/.logs"
PID_FILE="$REPO_ROOT/.aos.pid"

AOS_PORT=8000
FRONTEND_PORT=5173

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}▶ $*${RESET}"; }
success() { echo -e "${GREEN}✔ $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠ $*${RESET}"; }
error()   { echo -e "${RED}✖ $*${RESET}"; exit 1; }

# ── Stop ─────────────────────────────────────────────────────────────────────
stop_all() {
  if [[ ! -f "$PID_FILE" ]]; then
    warn "No PID file found. Nothing to stop."
    return
  fi
  while IFS= read -r pid; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" && echo "  Killed PID $pid"
    fi
  done < "$PID_FILE"
  rm -f "$PID_FILE"
  success "All AOS processes stopped."
}

# ── Status ───────────────────────────────────────────────────────────────────
status_all() {
  if [[ ! -f "$PID_FILE" ]]; then
    warn "Not running (no PID file)."
    return
  fi
  echo -e "${BOLD}Running processes:${RESET}"
  while IFS= read -r pid; do
    if kill -0 "$pid" 2>/dev/null; then
      echo -e "  ${GREEN}● PID $pid${RESET}  $(ps -p "$pid" -o comm= 2>/dev/null)"
    else
      echo -e "  ${RED}○ PID $pid  (dead)${RESET}"
    fi
  done < "$PID_FILE"
}

[[ "${1:-}" == "--stop"   ]] && stop_all   && exit 0
[[ "${1:-}" == "--status" ]] && status_all && exit 0

# ── Prerequisites ─────────────────────────────────────────────────────────────
command -v python3 >/dev/null || error "python3 not found"
command -v curl    >/dev/null || error "curl not found"
[[ -f "$BACKEND_DIR/.venv/bin/activate" ]] || error "Backend venv missing. Run: $BACKEND_DIR/bootstrap-venv.sh   (or create .venv and install torch then requirements — see docs/setup.md)"

mkdir -p "$LOG_DIR"
> "$PID_FILE"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   AOS — Autonomous Agent Operating System   ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════╝${RESET}"
echo ""

# ── 1. Django backend ─────────────────────────────────────────────────────────
info "Starting AOS backend on http://localhost:$AOS_PORT ..."

# Kill anything already on the port
lsof -ti tcp:$AOS_PORT | xargs kill -9 2>/dev/null || true

source "$BACKEND_DIR/.venv/bin/activate"

# Migrate
(cd "$BACKEND_DIR" && python manage.py migrate --run-syncdb -v 0 2>&1 | grep -v "PyTorch\|No migrations") || true

# Seed default policies
(cd "$BACKEND_DIR" && python manage.py default_policies 2>&1 | grep -v "PyTorch") || true

# Sync swarm agents into AOS registry
(cd "$BACKEND_DIR" && python manage.py sync_swarm_agents 2>&1 | tail -5) || true

# Start server in background
(cd "$BACKEND_DIR" && python manage.py runserver $AOS_PORT \
  > "$LOG_DIR/backend.log" 2>&1) &
BACKEND_PID=$!
echo "$BACKEND_PID" >> "$PID_FILE"

# Wait for backend to be ready
info "Waiting for backend to be ready..."
for i in {1..20}; do
  if curl -s http://localhost:$AOS_PORT/api/schema/ > /dev/null 2>&1; then
    success "Backend is up (PID $BACKEND_PID)"
    break
  fi
  sleep 1
  [[ $i == 20 ]] && error "Backend did not start in time. Check $LOG_DIR/backend.log"
done

# ── 2. Obtain AOS JWT token ───────────────────────────────────────────────────
info "Obtaining AOS JWT token..."

# Ensure admin user exists with known password
source "$BACKEND_DIR/.venv/bin/activate"
(cd "$BACKEND_DIR" && python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
u, created = User.objects.get_or_create(username='admin', defaults={'email':'admin@aos.internal','is_superuser':True,'is_staff':True})
u.set_password('admin1234')
u.save()
" 2>&1 | grep -v "PyTorch\|imported") || true

TOKEN_RESPONSE=$(curl -s -X POST http://localhost:$AOS_PORT/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin1234"}')

AOS_TOKEN=$(echo "$TOKEN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access',''))" 2>/dev/null || echo "")

if [[ -z "$AOS_TOKEN" ]]; then
  error "Could not obtain JWT token. Response: $TOKEN_RESPONSE"
fi

success "JWT token obtained"

# ── 3. Write swarm .env ───────────────────────────────────────────────────────
info "Writing agent-swarm/.env ..."
cat > "$SWARM_DIR/.env" << EOF
AOS_BASE_URL=http://localhost:$AOS_PORT
AOS_TOKEN=$AOS_TOKEN
AOS_ENV=dev
EOF
success "agent-swarm/.env updated with fresh token"

# ── 4. Verify live integration ────────────────────────────────────────────────
info "Verifying AOS ↔ Swarm bridge..."

EID=$(python3 -c 'import uuid; print(uuid.uuid4())')
POLICY_RESP=$(curl -s -X POST http://localhost:$AOS_PORT/api/swarm/policy/check/ \
  -H "Authorization: Bearer $AOS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"execution_id\":\"$EID\",\"agent_name\":\"sales-account-strategist\",\"task\":\"startup smoke test\",\"engine\":\"claude\",\"environment\":\"dev\"}")

DECISION=$(echo "$POLICY_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('decision','error'))" 2>/dev/null || echo "error")

if [[ "$DECISION" == "allow" ]]; then
  success "Bridge smoke test passed — policy decision: ALLOW"
else
  warn "Bridge smoke test returned: $DECISION"
  echo "  Response: $POLICY_RESP"
fi

# ── 5. Frontend ────────────────────────────────────────────────────────────────
info "Starting frontend on http://localhost:$FRONTEND_PORT ..."

# Kill anything already on the frontend port
lsof -ti tcp:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true

if [[ -d "$FRONTEND_DIR" && -f "$FRONTEND_DIR/package.json" ]]; then
  # Install deps if node_modules is missing
  if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
    info "Installing frontend dependencies..."
    (cd "$FRONTEND_DIR" && npm install --silent) || warn "npm install failed — frontend may not start"
  fi

  (cd "$FRONTEND_DIR" && npm run dev -- --port $FRONTEND_PORT \
    > "$LOG_DIR/frontend.log" 2>&1) &
  FRONTEND_PID=$!
  echo "$FRONTEND_PID" >> "$PID_FILE"

  # Wait for Vite to be ready
  for i in {1..15}; do
    if curl -s -o /dev/null http://localhost:$FRONTEND_PORT/ 2>/dev/null; then
      success "Frontend is up (PID $FRONTEND_PID)"
      break
    fi
    sleep 1
    [[ $i == 15 ]] && warn "Frontend didn't respond in time — check $LOG_DIR/frontend.log"
  done
else
  warn "No frontend directory found at $FRONTEND_DIR — skipping"
fi

# ── 6. Summary ────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║                  AOS is live                ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${GREEN}Frontend UI${RESET}       http://localhost:$FRONTEND_PORT"
echo -e "  ${GREEN}Backend API${RESET}       http://localhost:$AOS_PORT"
echo -e "  ${GREEN}Swagger UI${RESET}        http://localhost:$AOS_PORT/api/docs/swagger/"
echo -e "  ${GREEN}Admin panel${RESET}       http://localhost:$AOS_PORT/admin/"
echo -e "  ${GREEN}Metrics${RESET}           http://localhost:$AOS_PORT/metrics"
echo -e "  ${GREEN}Swarm bridge${RESET}      http://localhost:$AOS_PORT/api/swarm/"
echo ""
echo -e "  ${CYAN}Logs${RESET}              $LOG_DIR/frontend.log  |  $LOG_DIR/backend.log"
echo -e "  ${CYAN}Stop everything${RESET}   ./start.sh --stop"
echo ""
echo -e "  ${BOLD}To run a swarm agent:${RESET}"
echo -e "  ${YELLOW}  cd agent-swarm && source .env && python orchestrator.py \"<your goal>\"${RESET}"
echo ""
echo -e "  ${BOLD}Credentials:${RESET}  admin / admin1234"
echo ""
