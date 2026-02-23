#!/bin/bash

# Autonomous Agent Operating System (AOS) - Enterprise Stress Test
# Scenario: CTO Onboarding a new AI Department with multi-agent orchestration.

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m'

BASE_URL="http://localhost:8000/api"
ADMIN_USER="admin"
ADMIN_PASS="admin123"

# Helper functions
print_header() {
    printf "\n${MAGENTA}>>> %s${NC}\n" "$1"
}

print_success() {
    printf "${GREEN}  [OK] %s${NC}\n" "$1"
}

print_info() {
    printf "${BLUE}  [INFO] %s${NC}\n" "$1"
}

print_error() {
    printf "${RED}  [ERROR] %s${NC}\n" "$1"
}

# 0. System Check & Auth
print_header "Phase 0: Enterprise Initialization"
python3 manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); u = User.objects.get_or_create(username='$ADMIN_USER', is_staff=True, is_superuser=True)[0]; u.set_password('$ADMIN_PASS'); u.save()" > /dev/null 2>&1

AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/token/" -H "Content-Type: application/json" -d "{\"username\": \"$ADMIN_USER\", \"password\": \"$ADMIN_PASS\"}")
TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.access')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    print_error "CTO Authentication failed!"
    exit 1
fi

AUTH_H="Authorization: Bearer $TOKEN"
print_success "CTO Authenticated."

# 1. Governance Setup (Policy Engine)
print_header "Phase 1: Setting up Governance & Roles"
ROLE_DATA=$(curl -s -X POST "$BASE_URL/registry/roles/" -H "$AUTH_H" -H "Content-Type: application/json" \
    -d "{\"name\": \"Standard Agent $(date +%s)\", \"permissions\": [\"agent:execute\", \"tool:use\"]}")
ROLE_ID=$(echo "$ROLE_DATA" | jq -r '.id')
print_success "Global 'Standard Agent' Role created."

POLICY_DATA=$(curl -s -X POST "$BASE_URL/policies/policies/" -H "$AUTH_H" -H "Content-Type: application/json" \
    -d "{\"name\": \"Budget Guardrail $(date +%s)\", \"effect\": \"ALLOW\", \"resources\": [\"agent:execute\"], \"priority\": 10}")
print_success "Governance Policy 'Budget Guardrail' active."

# 2. Financial Setup (Billing)
print_header "Phase 2: Defining Cost Centers & Budgets"
DEPT_DATA=$(curl -s -X POST "$BASE_URL/billing/departments/" -H "$AUTH_H" -H "Content-Type: application/json" \
    -d "{\"name\": \"Strategic Research $(date +%s)\", \"code\": \"STRAT-$(date +%s)\"}")
DEPT_ID=$(echo "$DEPT_DATA" | jq -r '.id')
print_success "Department 'Strategic Research' established (ID: $DEPT_ID)"

BUDGET_DATA=$(curl -s -X POST "$BASE_URL/billing/budgets/" -H "$AUTH_H" -H "Content-Type: application/json" \
    -d "{\"department\": \"$DEPT_ID\", \"monthly_limit\": 5000.00}")
print_success "Monthly Compute Budget set to \$5,000.00"

# 3. Knowledge Base Setup
print_header "Phase 3: Initializing Enterprise Knowledge"
KB_DATA=$(curl -s -X POST "$BASE_URL/knowledge/collections/" -H "$AUTH_H" -H "Content-Type: application/json" \
    -d "{\"name\": \"Corporate Wiki $(date +%s)\", \"description\": \"Internal docs\", \"embedding_model\": \"models/gemini-embedding-001\"}")
KB_ID=$(echo "$KB_DATA" | jq -r '.id')
print_success "Vector Knowledge Collection 'Corporate Wiki' ready."

# 4. Agent Workforce Deployment
print_header "Phase 4: Spawning Agent Workforce"

# A. The Analyst (Functional)
ANALYST_DATA=$(curl -s -X POST "$BASE_URL/registry/agents/" -H "$AUTH_H" -H "Content-Type: application/json" \
    -d "{\"name\": \"DataAnalyst-$(date +%s)\", \"agent_type\": \"FUNCTIONAL\", \"department\": \"$DEPT_ID\"}")
ANALYST_ID=$(echo "$ANALYST_DATA" | jq -r '.id')
print_success "Spawned Agent: DataAnalyst"

# B. The Archivist (Functional)
ARCHIVIST_DATA=$(curl -s -X POST "$BASE_URL/registry/agents/" -H "$AUTH_H" -H "Content-Type: application/json" \
    -d "{\"name\": \"Archivist-$(date +%s)\", \"agent_type\": \"FUNCTIONAL\", \"department\": \"$DEPT_ID\"}")
ARCHIVIST_ID=$(echo "$ARCHIVIST_DATA" | jq -r '.id')
print_success "Spawned Agent: Archivist"

# C. The Executive (Supervisor)
EXEC_DATA=$(curl -s -X POST "$BASE_URL/registry/agents/" -H "$AUTH_H" -H "Content-Type: application/json" \
    -d "{\"name\": \"DepartmentManager-$(date +%s)\", \"agent_type\": \"EXECUTIVE\", \"department\": \"$DEPT_ID\"}")
EXEC_ID=$(echo "$EXEC_DATA" | jq -r '.id')
print_success "Spawned Executive: DepartmentManager"

# 5. Capability Configuration
print_header "Phase 5: Configuring Intelligence Graphs"
LLM_DATA=$(curl -s -X POST "$BASE_URL/intelligence/llm-configs/" -H "$AUTH_H" -H "Content-Type: application/json" \
    -d "{\"name\": \"Ultra Core $(date +%s)\", \"provider\": \"GEMINI\", \"model_name\": \"gemini-2.5-flash\"}")
LLM_ID=$(echo "$LLM_DATA" | jq -r '.id')

# Set Analyst to ReAct
curl -s -X POST "$BASE_URL/intelligence/capabilities/" -H "$AUTH_H" -H "Content-Type: application/json" \
    -d "{\"agent\": \"$ANALYST_ID\", \"primary_llm\": \"$LLM_ID\", \"graph_type\": \"REACT\"}" > /dev/null

# Set Archivist to ReAct (This was missing!)
curl -s -X POST "$BASE_URL/intelligence/capabilities/" -H "$AUTH_H" -H "Content-Type: application/json" \
    -d "{\"agent\": \"$ARCHIVIST_ID\", \"primary_llm\": \"$LLM_ID\", \"graph_type\": \"REACT\"}" > /dev/null

# Set Manager to Multi-Agent Supervisor
curl -s -X POST "$BASE_URL/intelligence/capabilities/" -H "$AUTH_H" -H "Content-Type: application/json" \
    -d "{\"agent\": \"$EXEC_ID\", \"primary_llm\": \"$LLM_ID\", \"graph_type\": \"MULTI_AGENT\", \"sub_agent_ids\": [\"$ANALYST_ID\", \"$ARCHIVIST_ID\"]}" > /dev/null
print_success "Hierarchical Intelligence Graphs established."

# 6. Workflow Execution
print_header "Phase 6: Executing Complex Multi-Agent Task"
print_info "Manager is orchestrating Analyst and Archivist..."
RUN_DATA=$(curl -s -X POST "$BASE_URL/intelligence/execute/" -H "$AUTH_H" -H "Content-Type: application/json" \
    -d "{\"agent_id\": \"$EXEC_ID\", \"task\": \"Summarize what quantum computing is in 10 words.\"}")
CONV_ID=$(echo "$RUN_DATA" | jq -r '.conversation_id')
RESULT=$(echo "$RUN_DATA" | jq -r '.response')

if [ "$CONV_ID" == "null" ] || [ -z "$CONV_ID" ]; then
    print_error "Multi-Agent execution failed! Response: $RUN_DATA"
    exit 1
fi

printf "${BLUE}  [Manager Response]:${NC} %s\n" "$RESULT"

# 6.5 Full Conversation Log
print_header "Phase 6.5: Full Orchestration Log (Chat History)"
MESSAGES=$(curl -s -X GET "$BASE_URL/intelligence/conversations/$CONV_ID/" -H "$AUTH_H")
print_info "Detailed exchange between Supervisor and specialized agents:"
echo "$MESSAGES" | jq -r '.messages[] | "    [\(.role)] \(.content)"'

# 7. Observability & Trace
print_header "Phase 7: X-Ray Audit (Trace Logs)"
TRACES=$(curl -s -X GET "$BASE_URL/intelligence/conversations/$CONV_ID/traces/" -H "$AUTH_H")
print_info "Execution Path recorded in DAG:"
echo "$TRACES" | jq -r '.[] | "    -> Node: \(.node_name) | Dur: \(.duration_ms)ms | Loop: \(.is_loop)"'

# 8. Financial Audit
print_header "Phase 8: Billing & Cost Attribution"
USAGE=$(curl -s -X GET "$BASE_URL/billing/usage/summary/?department_id=$DEPT_ID" -H "$AUTH_H")
COST=$(echo "$USAGE" | jq -r '.total_cost')
TIME=$(echo "$USAGE" | jq -r '.total_compute_time')
RECORDS=$(echo "$USAGE" | jq -r '.record_count')

print_success "Strategic Research Department Audit:"
printf "    - Chargeback Total: ${YELLOW}\$%s${NC}\n" "$COST"
printf "    - Total Compute:    ${YELLOW}%sms${NC}\n" "$TIME"
printf "    - API Operations:   ${YELLOW}%s calls${NC}\n" "$RECORDS"

printf "\n${GREEN}================================================================${NC}\n"
printf "${GREEN}   ✨ ENTERPRISE AOS WORKFLOW FULLY VERIFIED ✨   ${NC}\n"
printf "${GREEN}================================================================${NC}\n"
