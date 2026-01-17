#!/bin/bash

# Quick Fix Script for Prisma Connection Issues
# This script tests different DATABASE_URL configurations

echo "🔧 Prisma Connection Fix Script"
echo "================================"
echo ""

BASE_URL="postgresql://nkiru_call_db_user:3T29mBG7wcyAxOP9HQXd0IxN7qSBrw70@dpg-d5lrrqh4tr6s73c6vl9g-a.virginia-postgres.render.com:5432/nkiru_call_db"

# Array of different SSL configurations to try
declare -a configs=(
    "?sslmode=require"
    "?sslmode=require&sslaccept=accept_invalid_certs"
    "?sslmode=require&sslcert=&sslidentity=&sslpassword="
    "?sslmode=no-verify"
    "?schema=public&connection_limit=5&pool_timeout=10&sslmode=require"
)

echo "Testing different DATABASE_URL configurations..."
echo ""

for i in "${!configs[@]}"; do
    TEST_URL="${BASE_URL}${configs[$i]}"
    
    echo "Test $((i+1)): ${configs[$i]}"
    echo "Testing..."
    
    # Test with Prisma
    if DATABASE_URL="$TEST_URL" timeout 15 npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ SUCCESS!"
        echo ""
        echo "=========================================="
        echo "🎉 Working DATABASE_URL found!"
        echo "=========================================="
        echo ""
        echo "Add this to your .env file:"
        echo ""
        echo "DATABASE_URL=\"${TEST_URL}\""
        echo ""
        exit 0
    else
        echo "❌ Failed"
        echo ""
    fi
done

echo "=========================================="
echo "⚠️  None of the standard configs worked"
echo "=========================================="
echo ""
echo "This suggests a different issue. Please:"
echo ""
echo "1. Check Render Dashboard:"
echo "   - Go to: https://dashboard.render.com"
echo "   - Check if database status is 'Available'"
echo "   - Check if there's an IP allowlist configured"
echo ""
echo "2. Try Connection Pooling URL:"
echo "   - In Render dashboard, look for 'Connection Pooling'"
echo "   - Use that URL instead of External Database URL"
echo ""
echo "3. Check for network issues:"
echo "   nc -zv dpg-d5lrrqh4tr6s73c6vl9g-a.virginia-postgres.render.com 5432"
echo ""
