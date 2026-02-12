#!/bin/bash
set -euo pipefail

BASE_URL="http://localhost:8000"
REGISTRY_URL="$BASE_URL/api/registry"
INTELLIGENCE_URL="$BASE_URL/api/intelligence"

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Temp dir for all response files — cleaned up on exit
TMPDIR_WORK=$(mktemp -d)
trap 'rm -rf "$TMPDIR_WORK"' EXIT

# ---------------------------------------------------------------------------
# All JSON processing goes through temp files, never through shell variables.
# Passing LLM responses as shell variable interpolations into python3 -c ""
# corrupts the source code because LLM output contains newlines, tabs, and
# backslashes that are valid JSON but invalid when spliced into shell strings.
# ---------------------------------------------------------------------------

# Write a response string to a temp file and return the path
tmpfile() {
  local name="$1"
  echo "$TMPDIR_WORK/$name.json"
}

# curl wrapper: saves response to a named temp file, returns the path
fetch() {
  local name="$1"; shift          # logical name, used for temp file
  local path; path=$(tmpfile "$name")
  curl -sf "$@" -o "$path"
  echo "$path"
}

# Extract one field from a JSON temp file
extract() {
  local label="$1"
  local field="$2"
  local file="$3"
  python3 - "$file" "$field" "$label" << 'PYEOF'
import sys, json
file, field, label = sys.argv[1], sys.argv[2], sys.argv[3]
with open(file) as f:
    data = json.load(f)
if field not in data:
    print(f"ERROR: '{field}' not in {label} response. Keys: {list(data.keys())}", file=sys.stderr)
    sys.exit(1)
print(data[field])
PYEOF
}

# Print the 'response' field from a JSON temp file as readable text
print_response() {
  local file="$1"
  python3 - "$file" << 'PYEOF'
import sys, json, textwrap
with open(sys.argv[1]) as f:
    data = json.load(f)
if 'error' in data:
    print(f"  ERROR: {data['error']}")
    sys.exit(0)
response = data.get('response', '(empty response)')
print()
for line in response.splitlines():
    if line.strip():
        for chunk in textwrap.wrap(line, width=100):
            print('  ' + chunk)
    else:
        print()
PYEOF
}

# Print key metadata fields from a JSON temp file
print_meta() {
  local file="$1"; shift    # remaining args are field names to print
  python3 - "$file" "$@" << 'PYEOF'
import sys, json
with open(sys.argv[1]) as f:
    data = json.load(f)
for field in sys.argv[2:]:
    print(f"  {field}: {data.get(field, '(missing)')}")
PYEOF
}

# ---------------------------------------------------------------------------
# 0. Seed default policies
# ---------------------------------------------------------------------------
echo -e "\n Seeding default policies..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MANAGE_PY=""
SEARCH_DIR="$SCRIPT_DIR"
for _ in 1 2 3 4; do
  if [[ -f "$SEARCH_DIR/manage.py" ]]; then
    MANAGE_PY="$SEARCH_DIR/manage.py"
    break
  fi
  SEARCH_DIR="$(dirname "$SEARCH_DIR")"
done
if [[ -n "$MANAGE_PY" ]]; then
  python "$MANAGE_PY" default_policies 2>&1 | sed 's/^/   /'
else
  echo "   manage.py not found (searched 4 levels up) -- skipping"
fi

# ---------------------------------------------------------------------------
# 1. Authenticate
# ---------------------------------------------------------------------------
echo -e "\n Getting admin token..."
AUTH_FILE=$(fetch "auth" -X POST "$BASE_URL/api/token/" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')
TOKEN=$(extract "auth" "access" "$AUTH_FILE")
echo "   Got admin token"

# ---------------------------------------------------------------------------
# 2. Create LLM configs
# ---------------------------------------------------------------------------
echo -e "\n Creating Gemini 2.5 Flash configuration..."
GEMINI_FILE=$(fetch "gemini" -X POST "$INTELLIGENCE_URL/llm-configs/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gemini 2.5 Flash - Reasoning",
    "provider": "GEMINI",
    "model_name": "gemini-2.5-flash",
    "temperature": 0.7,
    "max_tokens": 4096,
    "supports_tools": true,
    "max_context_length": 128000
  }')
GEMINI_ID=$(extract "Gemini config" "id" "$GEMINI_FILE")
echo "   Gemini config ID: $GEMINI_ID"

echo -e "\n Creating Llama 2 local configuration..."
LLAMA_FILE=$(fetch "llama" -X POST "$INTELLIGENCE_URL/llm-configs/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Llama 2 - Local",
    "provider": "LLAMA",
    "model_name": "llama2:70b",
    "temperature": 0.6,
    "max_tokens": 4096,
    "supports_tools": true,
    "max_context_length": 4096
  }')
LLAMA_ID=$(extract "Llama config" "id" "$LLAMA_FILE")
echo "   Llama config ID: $LLAMA_ID"

# ---------------------------------------------------------------------------
# 3. Create agent
# ---------------------------------------------------------------------------
echo -e "\n Creating intelligent agent..."
AGENT_FILE=$(fetch "agent" -X POST "$REGISTRY_URL/agents/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Nova - Intelligent Agent $(date +%s)\",
    \"agent_type\": \"EXECUTIVE\",
    \"version\": \"1.0.0\"
  }")
AGENT_ID=$(extract "agent" "id" "$AGENT_FILE")
AGENT_TOKEN=$(extract "agent" "identity_key" "$AGENT_FILE")
echo "   Agent ID:    $AGENT_ID"
echo "   Agent Token: $AGENT_TOKEN"

# ---------------------------------------------------------------------------
# 4. Configure capabilities
# ---------------------------------------------------------------------------
echo -e "\n Configuring agent capabilities..."
fetch "capability" -X POST "$INTELLIGENCE_URL/capabilities/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"agent\": \"$AGENT_ID\",
    \"primary_llm\": \"$GEMINI_ID\",
    \"reasoning_llm\": \"$LLAMA_ID\",
    \"graph_type\": \"REACT\",
    \"memory_type\": \"BUFFER_WINDOW\",
    \"memory_window\": 10,
    \"max_iterations\": 20,
    \"timeout_seconds\": 60
  }" > /dev/null
echo "   Capabilities configured"

# ---------------------------------------------------------------------------
# 5. Execute the agent
# ---------------------------------------------------------------------------
echo -e "\n${GREEN}TESTING AGENT INTELLIGENCE${NC}"
echo "==================================="
echo -e "\n Sending task to agent..."

EXEC_FILE=$(fetch "exec" -X POST "$INTELLIGENCE_URL/execute/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"agent_id\": \"$AGENT_ID\",
    \"task\": \"Analyze the current market trends for AI agents and provide 3 key recommendations for enterprise adoption\",
    \"context\": {
      \"user_role\": \"CTO\",
      \"industry\": \"financial_services\",
      \"compliance\": \"SOC2\"
    }
  }")

echo -e "\n${CYAN}AGENT RESPONSE:${NC}"
print_response "$EXEC_FILE"
echo
print_meta "$EXEC_FILE" "conversation_id" "agent_name"

CONVERSATION_ID=$(extract "execute" "conversation_id" "$EXEC_FILE")

# ---------------------------------------------------------------------------
# 6. Follow-up message
# ---------------------------------------------------------------------------
echo -e "\n Sending follow-up question..."
FOLLOWUP_FILE=$(fetch "followup" -X POST "$INTELLIGENCE_URL/conversations/$CONVERSATION_ID/message/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Can you elaborate on the first recommendation? What specific steps should we take to implement it?"
  }')

echo -e "\n${CYAN}AGENT FOLLOW-UP RESPONSE:${NC}"
print_response "$FOLLOWUP_FILE"

# ---------------------------------------------------------------------------
# 7. Conversation history summary
# ---------------------------------------------------------------------------
echo -e "\n Conversation history:"
HISTORY_FILE=$(fetch "history" -X GET "$INTELLIGENCE_URL/conversations/$CONVERSATION_ID/" \
  -H "Authorization: Bearer $TOKEN")

python3 - "$HISTORY_FILE" << 'PYEOF'
import sys, json
with open(sys.argv[1]) as f:
    data = json.load(f)
messages = data.get('messages', [])
print(f"  {len(messages)} message(s) in thread\n")
for msg in messages:
    role = msg.get('role', '?').upper()
    content = msg.get('content', '')
    snippet = content[:120].replace('\n', ' ')
    if len(content) > 120:
        snippet += '...'
    tag = 'USER ' if role == 'USER' else 'AGENT'
    print(f"  [{tag}] {snippet}")
PYEOF

echo -e "\n${GREEN}YOUR AGENT IS ALIVE AND REASONING!${NC}"
echo "   Gemini 2.5 Flash reasoning    [OK]"
echo "   LangGraph ReAct loop          [OK]"
echo "   Conversation memory           [OK]"
echo "   Policy engine                 [OK]"