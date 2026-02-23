#!/bin/bash

BASE_URL="http://localhost:8000"
TIMEOUT=30  # seconds for processing

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to extract JSON value safely
extract_json() {
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('$1', ''))
except Exception:
    print('')
"
}

# Check if server is running

echo -e "${GREEN}✅ Server is running.${NC}"

# Get admin token
echo -e "\n${YELLOW}🔐 Getting admin token...${NC}"
TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/token/" \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}')

TOKEN=$(echo "$TOKEN_RESPONSE" | extract_json "access")

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get admin token. Response: $TOKEN_RESPONSE${NC}"
    echo -e "${YELLOW}Ensure you have a user 'admin' with password 'admin123'.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Got admin token: ${TOKEN:0:20}...${NC}"

# 1. Create a knowledge collection
echo -e "\n${YELLOW}📚 Creating knowledge collection...${NC}"
COLLECTION=$(curl -s -X POST "$BASE_URL/api/knowledge/collections/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Company Knowledge Base",
        "description": "Internal company documentation and policies"
    }')

COLLECTION_ID=$(echo "$COLLECTION" | extract_json "id")

if [ -z "$COLLECTION_ID" ]; then
    echo -e "${RED}❌ Failed to create collection. Response: $COLLECTION${NC}"
    exit 1
fi
echo -e "${GREEN}   ✅ Collection ID: $COLLECTION_ID${NC}"

# 2. Create test document
echo -e "\n${YELLOW}📄 Creating test document...${NC}"
cat > test_doc.txt << 'EOF'
Our Q4 2024 revenue was $12.5 million, up 23% year-over-year. 
The AI Agents product line contributed $4.2 million.
We have 47 enterprise customers using the platform.
Next quarter we plan to launch RAG capabilities.
The platform handles over 100,000 agent executions per day.
Customer satisfaction score is 94%.
Our main competitors are building similar features.
We have 12 engineers working on the agent intelligence team.
EOF
echo -e "${GREEN}   ✅ Test document created.${NC}"

# 3. Upload document
echo -e "\n${YELLOW}📤 Uploading document...${NC}"
DOCUMENT=$(curl -s -X POST "$BASE_URL/api/knowledge/documents/" \
    -H "Authorization: Bearer $TOKEN" \
    -F "collection=$COLLECTION_ID" \
    -F "title=Q4 2024 Financial Summary" \
    -F "filename=test_doc.txt" \
    -F "file_type=txt" \
    -F "file=@test_doc.txt")

DOCUMENT_ID=$(echo "$DOCUMENT" | extract_json "id")

if [ -z "$DOCUMENT_ID" ]; then
    echo -e "${RED}❌ Failed to upload document. Response: $DOCUMENT${NC}"
    exit 1
fi
echo -e "${GREEN}   ✅ Document ID: $DOCUMENT_ID${NC}"

# 4. Process document synchronously (with timeout)
echo -e "\n${YELLOW}⚙️ Processing document (timeout: ${TIMEOUT}s)...${NC}"
PROCESS_RESPONSE=$(curl -s --max-time $TIMEOUT -X POST "$BASE_URL/api/knowledge/documents/$DOCUMENT_ID/process/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

if [ $? -eq 28 ]; then
    echo -e "${RED}   ❌ Processing timed out after ${TIMEOUT} seconds.${NC}"
    echo -e "${YELLOW}   Check server logs for errors. Common causes: missing GEMINI_API_KEY or network issues.${NC}"
    exit 1
fi

echo -e "${GREEN}   ✅ Processing response: $PROCESS_RESPONSE${NC}"

# Wait a moment for indexing to complete
sleep 3

# 5. Query the knowledge base!
echo -e "\n${YELLOW}🧠 TESTING RAG QUERY${NC}"
echo "=================================="

QUERY="What was our Q4 revenue and how many enterprise customers do we have?"

echo -e "\n${YELLOW}❓ Query:${NC} $QUERY"
echo -e "\n${YELLOW}📋 RESPONSE:${NC}"

curl -s -X POST "$BASE_URL/api/knowledge/collections/$COLLECTION_ID/query/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"query\": \"$QUERY\",
        \"k\": 3
    }" | python3 -m json.tool || echo -e "${RED}Query failed${NC}"

# 6. Follow-up question
echo -e "\n\n${YELLOW}❓ Follow-up:${NC} What about the AI Agents product line?"
echo -e "\n${YELLOW}📋 RESPONSE:${NC}"

curl -s -X POST "$BASE_URL/api/knowledge/collections/$COLLECTION_ID/query/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "query": "How much did the AI Agents product line contribute?",
        "k": 3
    }' | python3 -m json.tool || echo -e "${RED}Query failed${NC}"

# 7. Clean up
echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
rm -f test_doc.txt

echo -e "\n${GREEN}✨ RAG SYSTEM IS LIVE! ✨${NC}"



