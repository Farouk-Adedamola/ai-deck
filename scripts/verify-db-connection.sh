#!/bin/bash

# Database Connection Verification Script
# This script helps you verify your PostgreSQL setup

echo "Checking PostgreSQL installation..."
echo ""

# Check if psql is available
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo "PostgreSQL is installed: $PSQL_VERSION"
else
    echo "PostgreSQL (psql) is not found in PATH"
    echo "   Please install PostgreSQL or add it to your PATH"
    exit 1
fi

echo ""
echo "Checking if PostgreSQL is running..."
echo ""

# Try to connect to default database
if psql -h localhost -U postgres -d postgres -c "SELECT 1;" &> /dev/null 2>&1; then
    echo "PostgreSQL is running and accessible"
elif psql -h localhost -d postgres -c "SELECT 1;" &> /dev/null 2>&1; then
    echo "PostgreSQL is running and accessible (no user specified)"
else
    echo "Cannot connect to PostgreSQL"
    echo "   Make sure PostgreSQL is running:"
    echo "   - Homebrew: brew services start postgresql@15"
    echo "   - Postgres.app: Start the app and click 'Start'"
    exit 1
fi

echo ""
echo "Checking for .env file..."
echo ""

if [ -f .env ]; then
    echo ".env file exists"
    
    # Check if DATABASE_URL is set
    if grep -q "DATABASE_URL=" .env; then
        echo "DATABASE_URL is set in .env"
        
        # Extract DATABASE_URL
        DB_URL=$(grep "DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
        
        echo ""
        echo "Testing database connection..."
        echo ""
        
        # Try to extract connection details and test
        if [[ $DB_URL == postgresql://* ]]; then
            # Try to connect (this is a basic test)
            echo "Attempting to connect to database..."
            if psql "$DB_URL" -c "SELECT version();" &> /dev/null 2>&1; then
                echo "Successfully connected to database!"
                echo ""
                psql "$DB_URL" -c "SELECT version();" | head -3
            else
                echo "Could not connect to database with the provided DATABASE_URL"
                echo "   Please check:"
                echo "   - Database name is correct"
                echo "   - Username and password are correct"
                echo "   - Database exists (run: createdb your_database_name)"
                exit 1
            fi
        else
            echo "DATABASE_URL format might be incorrect"
            echo "   Expected format: postgresql://user:password@host:port/database"
        fi
    else
        echo "DATABASE_URL not found in .env file"
        echo "   Please add: DATABASE_URL=postgresql://localhost:5432/nkiru_call_db"
        exit 1
    fi
else
    echo ".env file not found"
    echo "   Please create .env file with DATABASE_URL"
    exit 1
fi

echo ""
echo "Database setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Run: pnpm prisma generate"
echo "2. Run: pnpm db:push"
echo "3. Run: pnpm dev"
