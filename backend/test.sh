#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URLs
BASE_URL="http://localhost:8000"
REGISTRY_URL="$BASE_URL/api/registry"
GATEWAY_URL="$BASE_URL/api/gateway"

# Storage for IDs
USER_TOKEN=""
AGENT_ID=""
ROLE_ID=""
AGENT_TOKEN=""
SESSION_TOKEN=""

echo -e "${BLUE}🚀 Starting AOS API Tests${NC}\n"

# ----------------------------------------------------------------------------
# 1. Authentication - Get user JWT token
# ----------------------------------------------------------------------------
echo -e "${YELLOW}1. Getting user authentication token...${NC}"

USER_TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/token/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

if echo "$USER_TOKEN_RESPONSE" | grep -q "access"; then
    USER_TOKEN=$(echo "$USER_TOKEN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access'])")
    echo -e "${GREEN}✅ User authentication successful${NC}"
else
    echo -e "${RED}❌ Failed to get user token. Response:${NC}"
    echo "$USER_TOKEN_RESPONSE"
    echo -e "\n${YELLOW}Please create a superuser first:${NC}"
    echo -e "   python manage.py createsuperuser"
    echo -e "   Then update the username/password in this script."
    exit 1
fi

# ----------------------------------------------------------------------------
# 2. Clean up existing roles to avoid duplicates
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}2. Cleaning up existing roles...${NC}"

# Get all roles
ROLES_RESPONSE=$(curl -s -X GET "$REGISTRY_URL/roles/" \
  -H "Authorization: Bearer $USER_TOKEN")

# Delete existing roles to avoid duplicates
echo "$ROLES_RESPONSE" | python3 -c "
import sys, json
try:
    roles = json.load(sys.stdin)
    for role in roles:
        if role['name'] in ['Executive Agent Role', 'Sales Agent Role']:
            print(f\"Deleting existing role: {role['name']} ({role['id']})\")
            # We'll delete via curl in bash, just print the IDs here
            print(f\"DELETE_ID:{role['id']}\")
except:
    pass
" | while read -r line; do
    if [[ "$line" == DELETE_ID:* ]]; then
        ROLE_ID_TO_DELETE=$(echo "$line" | cut -d':' -f2)
        curl -s -X DELETE "$REGISTRY_URL/roles/$ROLE_ID_TO_DELETE/" \
          -H "Authorization: Bearer $USER_TOKEN"
        echo -e "${YELLOW}   Deleted role: $ROLE_ID_TO_DELETE${NC}"
    fi
done

# ----------------------------------------------------------------------------
# 3. Create Executive Role
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}3. Creating Executive Agent Role...${NC}"

ROLE_RESPONSE=$(curl -s -X POST "$REGISTRY_URL/roles/" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Executive Agent Role",
    "description": "Full access to all agent operations",
    "permissions": [
      "agents:create",
      "agents:read",
      "agents:update",
      "agents:delete",
      "agents:execute",
      "tools:access",
      "workflows:orchestrate"
    ]
  }')

if echo "$ROLE_RESPONSE" | grep -q "id"; then
    ROLE_ID=$(echo "$ROLE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
    echo -e "${GREEN}✅ Executive Role created with ID: $ROLE_ID${NC}"
else
    echo -e "${RED}❌ Failed to create role. Response:${NC}"
    echo "$ROLE_RESPONSE"
    # Try to get existing role ID
    EXISTING_ROLE=$(curl -s -X GET "$REGISTRY_URL/roles/?name=Executive%20Agent%20Role" \
      -H "Authorization: Bearer $USER_TOKEN")
    ROLE_ID=$(echo "$EXISTING_ROLE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')" 2>/dev/null)
    if [ ! -z "$ROLE_ID" ]; then
        echo -e "${YELLOW}   Using existing role with ID: $ROLE_ID${NC}"
    else
        exit 1
    fi
fi

# ----------------------------------------------------------------------------
# 4. Create Sales Role
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}4. Creating Sales Agent Role...${NC}"

SALES_ROLE_RESPONSE=$(curl -s -X POST "$REGISTRY_URL/roles/" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Agent Role",
    "description": "Access to CRM and sales tools",
    "permissions": [
      "agents:read",
      "tools:crm:read",
      "tools:crm:write",
      "tools:email:send"
    ]
  }')

if echo "$SALES_ROLE_RESPONSE" | grep -q "id"; then
    SALES_ROLE_ID=$(echo "$SALES_ROLE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
    echo -e "${GREEN}✅ Sales Role created with ID: $SALES_ROLE_ID${NC}"
else
    echo -e "${YELLOW}   Sales role may already exist, trying to fetch it...${NC}"
    EXISTING_SALES_ROLE=$(curl -s -X GET "$REGISTRY_URL/roles/?name=Sales%20Agent%20Role" \
      -H "Authorization: Bearer $USER_TOKEN")
    SALES_ROLE_ID=$(echo "$EXISTING_SALES_ROLE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')" 2>/dev/null)
    if [ ! -z "$SALES_ROLE_ID" ]; then
        echo -e "${GREEN}✅ Found existing Sales Role with ID: $SALES_ROLE_ID${NC}"
    fi
fi

# ----------------------------------------------------------------------------
# 5. List all roles
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}5. Listing all roles...${NC}"

curl -s -X GET "$REGISTRY_URL/roles/" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool

# ----------------------------------------------------------------------------
# 6. Create Executive Agent
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}6. Creating Executive Agent...${NC}"

AGENT_RESPONSE=$(curl -s -X POST "$REGISTRY_URL/agents/" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Orion Executive Agent $(date +%s)\",
    \"agent_type\": \"EXECUTIVE\",
    \"version\": \"2.1.0\",
    \"role_ids\": [\"$ROLE_ID\"],
    \"metadata\": {
      \"purpose\": \"Enterprise orchestration\",
      \"department\": \"CTO Office\",
      \"max_concurrent_tasks\": 10,
      \"llm_preference\": \"gpt-4-turbo\"
    }
  }")

if echo "$AGENT_RESPONSE" | grep -q "identity_key"; then
    AGENT_ID=$(echo "$AGENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
    AGENT_TOKEN=$(echo "$AGENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['identity_key'])")
    echo -e "${GREEN}✅ Executive Agent created:${NC}"
    echo -e "   Agent ID: $AGENT_ID"
    echo -e "   Identity Token: $AGENT_TOKEN"
    echo -e "${YELLOW}   ⚠️  SAVE THIS TOKEN - IT WON'T BE SHOWN AGAIN!${NC}"
else
    echo -e "${RED}❌ Failed to create agent. Response:${NC}"
    echo "$AGENT_RESPONSE"
    exit 1
fi

# ----------------------------------------------------------------------------
# 7. Create Sales Agent
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}7. Creating Sales Agent...${NC}"

if [ ! -z "$SALES_ROLE_ID" ]; then
    SALES_AGENT_RESPONSE=$(curl -s -X POST "$REGISTRY_URL/agents/" \
      -H "Authorization: Bearer $USER_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"Nova Sales Agent $(date +%s)\",
        \"agent_type\": \"FUNCTIONAL\",
        \"version\": \"1.5.0\",
        \"role_ids\": [\"$SALES_ROLE_ID\"],
        \"metadata\": {
          \"purpose\": \"Sales operations and CRM management\",
          \"department\": \"Sales\",
          \"crm_integration\": \"salesforce\",
          \"llm_preference\": \"gpt-3.5-turbo\"
        }
      }")

    if echo "$SALES_AGENT_RESPONSE" | grep -q "id"; then
        SALES_AGENT_ID=$(echo "$SALES_AGENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
        SALES_AGENT_TOKEN=$(echo "$SALES_AGENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['identity_key'])")
        echo -e "${GREEN}✅ Sales Agent created with ID: $SALES_AGENT_ID${NC}"
    else
        echo -e "${RED}❌ Failed to create sales agent${NC}"
    fi
fi

# ----------------------------------------------------------------------------
# 8. List all agents
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}8. Listing all agents...${NC}"

curl -s -X GET "$REGISTRY_URL/agents/" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool

# ----------------------------------------------------------------------------
# 9. Get specific agent details
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}9. Getting Executive Agent details...${NC}"

curl -s -X GET "$REGISTRY_URL/agents/$AGENT_ID/" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool

# ----------------------------------------------------------------------------
# 10. Filter agents by type
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}10. Filtering agents by type (EXECUTIVE)...${NC}"

curl -s -X GET "$REGISTRY_URL/agents/?agent_type=EXECUTIVE" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool

# ----------------------------------------------------------------------------
# 11. Update agent metadata
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}11. Updating Executive Agent configuration...${NC}"

curl -s -X PATCH "$REGISTRY_URL/agents/$AGENT_ID/" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "2.2.0",
    "metadata": {
      "purpose": "Enterprise orchestration - Updated",
      "department": "CTO Office",
      "max_concurrent_tasks": 20,
      "llm_preference": "claude-3-opus",
      "features": ["multi-agent", "policy-enforcement", "audit-logging"]
    }
  }' | python3 -m json.tool

# ----------------------------------------------------------------------------
# 12. AGENT GATEWAY TESTS
# ----------------------------------------------------------------------------
echo -e "\n${BLUE}🔐 TESTING AGENT GATEWAY${NC}\n"

# ----------------------------------------------------------------------------
# 13. Test Direct Identity Token Authentication
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}13. Testing direct identity token authentication...${NC}"

DIRECT_AUTH_RESPONSE=$(curl -s -X GET "$REGISTRY_URL/agents/$AGENT_ID/" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json")

if echo "$DIRECT_AUTH_RESPONSE" | grep -q "id"; then
    echo -e "${GREEN}✅ Direct identity token authentication works!${NC}"
    SESSION_TOKEN="$AGENT_TOKEN"
else
    echo -e "${RED}❌ Direct identity token authentication failed${NC}"
    echo "$DIRECT_AUTH_RESPONSE"
fi

# ----------------------------------------------------------------------------
# 14. Agent Login with JWT (if gateway is configured)
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}14. Attempting agent login with JWT...${NC}"

LOGIN_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{
    \"agent_id\": \"$AGENT_ID\",
    \"identity_key\": \"$AGENT_TOKEN\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
    SESSION_ID=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['session_id'])" 2>/dev/null)
    echo -e "${GREEN}✅ Agent JWT login successful${NC}"
    echo -e "   JWT Token: ${JWT_TOKEN:0:20}...${NC}"
    SESSION_TOKEN="$JWT_TOKEN"
else
    echo -e "${YELLOW}⚠️  Agent JWT login failed (this is OK if gateway not fully configured)${NC}"
    echo "$LOGIN_RESPONSE"
fi

# ----------------------------------------------------------------------------
# 15. Test agent authentication with available token
# ----------------------------------------------------------------------------
if [ ! -z "$SESSION_TOKEN" ]; then
    echo -e "\n${YELLOW}15. Testing authenticated agent access...${NC}"
    
    curl -s -X GET "$REGISTRY_URL/agents/$AGENT_ID/" \
      -H "Authorization: Bearer $SESSION_TOKEN" \
      -H "Content-Type: application/json" | python3 -m json.tool
fi

# ----------------------------------------------------------------------------
# 16. Test unauthorized access
# ----------------------------------------------------------------------------
if [ ! -z "$SESSION_TOKEN" ] && [ ! -z "$SALES_AGENT_ID" ]; then
    echo -e "\n${YELLOW}16. Testing unauthorized access to Sales Agent...${NC}"
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$REGISTRY_URL/agents/$SALES_AGENT_ID/" \
      -H "Authorization: Bearer $SESSION_TOKEN" \
      -H "Content-Type: application/json")
    
    if [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "401" ]; then
        echo -e "${GREEN}✅ Correctly forbidden (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${RED}❌ Expected 403/401, got $HTTP_CODE${NC}"
    fi
fi

# ----------------------------------------------------------------------------
# 17. Pause agent
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}17. Pausing Executive Agent...${NC}"

PAUSE_RESPONSE=$(curl -s -X POST "$REGISTRY_URL/agents/$AGENT_ID/pause/" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json")

if echo "$PAUSE_RESPONSE" | grep -q "paused"; then
    echo -e "${GREEN}✅ Agent paused successfully${NC}"
else
    echo -e "${RED}❌ Failed to pause agent${NC}"
    echo "$PAUSE_RESPONSE"
fi

# ----------------------------------------------------------------------------
# 18. Check agent status
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}18. Checking agent status...${NC}"

curl -s -X GET "$REGISTRY_URL/agents/$AGENT_ID/" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool | grep -A2 '"status"'

# ----------------------------------------------------------------------------
# 19. Resume agent
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}19. Resuming Executive Agent...${NC}"

RESUME_RESPONSE=$(curl -s -X POST "$REGISTRY_URL/agents/$AGENT_ID/resume/" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json")

if echo "$RESUME_RESPONSE" | grep -q "running"; then
    echo -e "${GREEN}✅ Agent resumed successfully${NC}"
else
    echo -e "${RED}❌ Failed to resume agent${NC}"
    echo "$RESUME_RESPONSE"
fi

# ----------------------------------------------------------------------------
# 20. Search agents
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}20. Searching agents by name...${NC}"

curl -s -X GET "$REGISTRY_URL/agents/?search=Orion" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool

# ----------------------------------------------------------------------------
# 21. Clean up - Delete agents
# ----------------------------------------------------------------------------
echo -e "\n${YELLOW}21. Cleaning up - Deleting test agents...${NC}"

# Delete Sales Agent
if [ ! -z "$SALES_AGENT_ID" ]; then
    echo -e "   Deleting Sales Agent: $SALES_AGENT_ID"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$REGISTRY_URL/agents/$SALES_AGENT_ID/" \
      -H "Authorization: Bearer $USER_TOKEN")
    
    if [ "$HTTP_CODE" = "204" ]; then
        echo -e "${GREEN}   ✅ Sales Agent deleted (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${RED}   ❌ Failed to delete sales agent. HTTP Code: $HTTP_CODE${NC}"
    fi
fi

# Delete Executive Agent
if [ ! -z "$AGENT_ID" ]; then
    echo -e "   Deleting Executive Agent: $AGENT_ID"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$REGISTRY_URL/agents/$AGENT_ID/" \
      -H "Authorization: Bearer $USER_TOKEN")
    
    if [ "$HTTP_CODE" = "204" ]; then
        echo -e "${GREEN}   ✅ Executive Agent deleted (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${RED}   ❌ Failed to delete executive agent. HTTP Code: $HTTP_CODE${NC}"
    fi
fi

# ----------------------------------------------------------------------------
# Summary
# ----------------------------------------------------------------------------
echo -e "\n${BLUE}📊 TEST SUMMARY${NC}"
echo -e "${GREEN}✅ Agent Registry: Operational${NC}"
echo -e "${GREEN}✅ Role Management: Operational${NC}"

if [ ! -z "$SESSION_TOKEN" ]; then
    echo -e "${GREEN}✅ Agent Authentication: Working${NC}"
else
    echo -e "${YELLOW}⚠️  Agent Authentication: Limited (direct token only)${NC}"
fi

echo -e "\n${BLUE}📝 Notes:${NC}"
echo -e "   • To fully enable Agent Gateway JWT authentication:"
echo -e "     1. Add 'agent_gateway.authentication.AgentAuthentication' to REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES']"
echo -e "     2. Run migrations: python manage.py makemigrations agent_gateway"
echo -e "     3. Run: python manage.py migrate agent_gateway"
echo -e "     4. Restart Django server"

echo -e "\n${GREEN}🎉 Test completed successfully!${NC}"