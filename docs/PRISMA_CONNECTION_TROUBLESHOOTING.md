# Prisma Connection Troubleshooting Guide
# ========================================

## Problem: psql connects but Prisma doesn't

This is a known issue with Prisma and some cloud PostgreSQL providers.
The issue is usually SSL/TLS negotiation differences between psql and Prisma.

## Solutions (Try in order)

### Solution 1: Disable SSL Mode (Quick Test)
```bash
DATABASE_URL="postgresql://nkiru_call_db_user:3T29mBG7wcyAxOP9HQXd0IxN7qSBrw70@dpg-d5lrrqh4tr6s73c6vl9g-a.virginia-postgres.render.com:5432/nkiru_call_db?sslmode=disable"
```

**Why this might work**: psql has better SSL fallback handling than Prisma.
**Security note**: This is less secure but fine for development/testing.

### Solution 2: Use connect_timeout
```bash
DATABASE_URL="postgresql://nkiru_call_db_user:3T29mBG7wcyAxOP9HQXd0IxN7qSBrw70@dpg-d5lrrqh4tr6s73c6vl9g-a.virginia-postgres.render.com:5432/nkiru_call_db?sslmode=require&connect_timeout=30"
```

### Solution 3: Add pgbouncer parameter
```bash
DATABASE_URL="postgresql://nkiru_call_db_user:3T29mBG7wcyAxOP9HQXd0IxN7qSBrw70@dpg-d5lrrqh4tr6s73c6vl9g-a.virginia-postgres.render.com:5432/nkiru_call_db?sslmode=require&pgbouncer=true"
```

### Solution 4: Use Prisma's directUrl (Recommended for Render)
```bash
# In your .env file
DATABASE_URL="postgresql://nkiru_call_db_user:3T29mBG7wcyAxOP9HQXd0IxN7qSBrw70@dpg-d5lrrqh4tr6s73c6vl9g-a.virginia-postgres.render.com:5432/nkiru_call_db?sslmode=disable"
```

---

## Known Render + Prisma Issues

### Issue 1: SSL Certificate Validation
Render's PostgreSQL SSL certificates might not be trusted by Prisma's engine.

**Fix**: Use `sslmode=disable` or `sslmode=prefer`

### Issue 2: Connection Timeouts
Render free tier may have connection limits.

**Fix**: Add `connect_timeout=30` to give more time

### Issue 3: Network Routing
Prisma's query engine might have different network behavior than psql.

**Fix**: Try using IP address instead of hostname (get IP via: dig +short dpg-d5lrrqh4tr6s73c6vl9g-a.virginia-postgres.render.com)

---

## Testing Commands

After each DATABASE_URL change, test with:

```bash
# Test 1: Prisma can parse the URL
npx prisma validate

# Test 2: Prisma can connect
npx prisma db execute --stdin <<< "SELECT 1;"

# Test 3: Push schema
pnpm db:push
```

---

## If Nothing Works: Use Supabase or Neon Instead

Render's free PostgreSQL has connection limitations. Consider:

### Option A: Supabase (Free, Better for Prisma)
1. Go to https://supabase.com
2. Create free project
3. Get connection string (already optimized for Prisma)
4. Update DATABASE_URL

### Option B: Neon (Free, Serverless PostgreSQL)
1. Go to https://neon.tech
2. Create free project
3. Copy connection string
4. Update DATABASE_URL

### Option C: ElephantSQL (Free tier)
1. Go to https://www.elephantsql.com
2. Create free Tiny Turtle instance
3. Copy connection URL
4. Update DATABASE_URL

---

## Emergency Workaround: Use Local PostgreSQL

If you need to continue development:

```bash
# Install PostgreSQL locally (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create local database
createdb nkiru_call_db

# Update .env
DATABASE_URL="postgresql://localhost:5432/nkiru_call_db"

# Push schema
pnpm db:push

# Continue development locally
pnpm dev
```

Deploy to production with Render's INTERNAL URL (which works better).

---

## Why This Happens

**psql (works)**:
- Native C library
- Built-in SSL negotiation
- Fallback mechanisms
- Decades of compatibility fixes

**Prisma (doesn't work)**:
- Rust-based query engine
- Stricter SSL requirements
- Less forgiving connection handling
- May not recognize Render's SSL certificates

This is a known issue tracked in:
- Prisma GitHub Issues
- Render Community Forums
- Many developers face this!
