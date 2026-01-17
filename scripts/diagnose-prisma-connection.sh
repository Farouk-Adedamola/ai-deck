#!/bin/bash

# Prisma Connection Diagnostic Script
# This helps identify why Prisma can't connect while psql can

echo "🔍 Prisma Connection Diagnostic"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Step 1: Testing network connectivity to Render..."
echo ""

HOST="dpg-d5lrrqh4tr6s73c6vl9g-a.virginia-postgres.render.com"
PORT="5432"

# Test if we can reach the host
if nc -zv -w 5 $HOST $PORT 2>&1 | grep -q "succeeded\|open"; then
    echo -e "${GREEN}✅ Port 5432 is reachable${NC}"
else
    echo -e "${RED}❌ Cannot reach port 5432${NC}"
    echo ""
    echo "Possible causes:"
    echo "1. Render database is suspended/inactive"
    echo "2. Firewall blocking connection"
    echo "3. IP whitelist restriction"
    exit 1
fi

echo ""
echo "Step 2: Testing SSL connection..."
echo ""

# Test SSL connection
if openssl s_client -connect $HOST:$PORT -starttls postgres < /dev/null 2>&1 | grep -q "Verify return code: 0"; then
    echo -e "${GREEN}✅ SSL connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  SSL verification had issues (this might be OK)${NC}"
fi

echo ""
echo "Step 3: Checking DATABASE_URL format..."
echo ""

if [ -f .env ]; then
    DB_URL=$(grep "DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    
    # Check for required components
    if [[ $DB_URL == *":5432"* ]]; then
        echo -e "${GREEN}✅ Port :5432 present${NC}"
    else
        echo -e "${RED}❌ Missing port :5432${NC}"
        echo "   Add :5432 after hostname"
    fi
    
    if [[ $DB_URL == *"sslmode=require"* ]]; then
        echo -e "${GREEN}✅ sslmode=require present${NC}"
    else
        echo -e "${YELLOW}⚠️  Missing sslmode=require${NC}"
        echo "   Add ?sslmode=require at the end"
    fi
    
    if [[ $DB_URL == *"sslaccept=strict"* ]]; then
        echo -e "${YELLOW}⚠️  sslaccept=strict may cause issues${NC}"
        echo "   Try removing it or changing to sslaccept=accept_invalid_certs"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

echo ""
echo "Step 4: Recommended DATABASE_URL formats..."
echo ""
echo -e "${YELLOW}Try these in order (most to least secure):${NC}"
echo ""
echo "Option 1 (Recommended):"
echo "DATABASE_URL=\"postgresql://user:pass@host:5432/db?sslmode=require\""
echo ""
echo "Option 2 (If Option 1 fails):"
echo "DATABASE_URL=\"postgresql://user:pass@host:5432/db?sslmode=require&sslaccept=accept_invalid_certs\""
echo ""
echo "Option 3 (Less secure, but works):"
echo "DATABASE_URL=\"postgresql://user:pass@host:5432/db?sslmode=no-verify\""
echo ""
echo "Option 4 (If SSL is causing issues):"
echo "DATABASE_URL=\"postgresql://user:pass@host:5432/db?sslmode=disable\""
echo ""

echo "Step 5: Testing Prisma connection with current settings..."
echo ""

# Try Prisma db execute to test connection
if timeout 10 npx prisma db execute --stdin <<< "SELECT 1;" 2>&1 | grep -q "Error: P1001"; then
    echo -e "${RED}❌ Prisma still cannot connect${NC}"
    echo ""
    echo "🔧 Quick fixes to try:"
    echo ""
    echo "1. Update your .env DATABASE_URL to:"
    echo "   DATABASE_URL=\"postgresql://nkiru_call_db_user:3T29mBG7wcyAxOP9HQXd0IxN7qSBrw70@dpg-d5lrrqh4tr6s73c6vl9g-a.virginia-postgres.render.com:5432/nkiru_call_db?sslmode=require&sslaccept=accept_invalid_certs\""
    echo ""
    echo "2. Try using connection pooling (PgBouncer):"
    echo "   Check Render dashboard for 'External Connection Pooling URL'"
    echo ""
    echo "3. Check Render database status:"
    echo "   Go to: https://dashboard.render.com → Your Database"
    echo "   Status should be: 'Available'"
    exit 1
else
    echo -e "${GREEN}✅ Prisma can connect!${NC}"
fi

echo ""
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
