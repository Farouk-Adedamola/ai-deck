# NKIRU FAQ Sync Guide

## 🎯 Overview

This guide explains how to sync real FAQs from NKIRU's API to your AI call assistant.

**What it does:**
1. Fetches FAQs from NKIRU API
2. Stores them in PostgreSQL (for caching)
3. Indexes them in Pinecone (for AI search)
4. Makes them available for your voice assistant

---

## 🔑 Prerequisites

### 1. Environment Variables

Make sure your `.env` file has these set:

```bash
# NKIRU API Configuration
NKIRU_API_KEY=your_nkiru_api_key_here
NKIRU_API_BASE_URL=https://stage-api.withnkiru.com

# Database (Neon)
DATABASE_URL=postgresql://neondb_owner:password@ep-xxxxx.aws.neon.tech/neondb?sslmode=require

# Pinecone (Vector Search)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=nkiru-faqs

# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=text-embedding-3-small
```

### 2. Database Setup

Ensure your database tables exist:

```bash
pnpm db:push
```

### 3. NKIRU API Access

You need:
- ✅ Valid NKIRU API key
- ✅ Access to the `/faq` endpoint
- ✅ Active NKIRU account

---

## 📥 How to Sync FAQs

### Method 1: Using the Script (Recommended)

```bash
# Sync FAQs from NKIRU API
pnpm sync:faqs
```

**Expected Output:**
```
============================================================
Starting Real FAQ Sync from NKIRU API
============================================================

📡 NKIRU API Base URL: https://stage-api.withnkiru.com
🔑 API Key: sk_live_abc...

📥 Fetching FAQs from NKIRU API...
Fetched FAQs from NKIRU: 25 FAQs

✅ Synced FAQ: What are your business hours?
✅ Synced FAQ: How do I contact support?
... (more FAQs)

============================================================
✅ FAQ Sync Complete!
============================================================

Your AI assistant can now answer questions from NKIRU FAQs
```

---

### Method 2: Using the API Endpoint

While your server is running:

```bash
# Start server
pnpm dev

# In another terminal, trigger sync
curl -X POST http://localhost:7720/api/v1/nkiru/faqs/sync
```

**Response:**
```json
{
  "message": "FAQs synced successfully"
}
```

---

### Method 3: Automatic Sync (Scheduled)

Enable automatic syncing in your `.env`:

```bash
FAQ_SYNC_ENABLED=true
FAQ_SYNC_INTERVAL_HOURS=24  # Sync every 24 hours
```

Then start your server:

```bash
pnpm dev
```

FAQs will auto-sync:
- On server startup
- Every 24 hours (configurable)

---

## 🧪 Testing the Sync

### Step 1: Verify FAQs in Database

```bash
# View cached FAQs
curl http://localhost:7720/api/v1/nkiru/faqs
```

### Step 2: Test Knowledge Base Search

```bash
curl -X POST http://localhost:7720/api/v1/nkiru/tools/search-knowledge-base \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are your business hours?",
    "clientId": "optional_client_id"
  }'
```

**Expected Response:**
```json
{
  "result": "Result 1:\nQuestion: What are your business hours?\nAnswer: We are open Monday to Friday, 9 AM to 6 PM EST..."
}
```

### Step 3: Check Pinecone Index

```bash
pnpm test:pinecone
```

Should show your FAQs indexed.

---

## 🔍 Troubleshooting

### Error: 401 Unauthorized

**Problem:** Invalid or expired API key

**Solution:**
```bash
# 1. Verify your API key in .env
cat .env | grep NKIRU_API_KEY

# 2. Get a fresh API key from NKIRU dashboard
# 3. Update .env with new key
```

---

### Error: 404 Not Found

**Problem:** FAQ endpoint doesn't exist or wrong URL

**Solution:**
```bash
# 1. Test the endpoint directly
curl -X GET https://stage-api.withnkiru.com/faq \
  -H "X-API-Key: your_api_key"

# 2. If 404, check NKIRU API documentation for correct endpoint
# 3. Update NKIRU_API_BASE_URL if needed
```

---

### Error: Network timeout

**Problem:** Can't reach NKIRU API

**Solution:**
```bash
# 1. Check internet connection
ping stage-api.withnkiru.com

# 2. Check if API is up
curl -I https://stage-api.withnkiru.com

# 3. Try from browser: https://stage-api.withnkiru.com/health
```

---

### No FAQs Returned

**Problem:** NKIRU API returns empty array

**Possible causes:**
1. No FAQs created in NKIRU dashboard yet
2. API key doesn't have access to FAQs
3. FAQs are client-specific and you need to provide clientId

**Solution:**
```bash
# 1. Log in to NKIRU dashboard
# 2. Go to FAQ management
# 3. Create some FAQs
# 4. Run sync again
```

---

## 📊 FAQ Data Structure

### What NKIRU Returns

```typescript
interface NKIRUFAQ {
  _id: string;           // Unique FAQ ID
  clientId: string;      // Client/organization ID
  question: string;      // The question
  answer: string;        // The answer
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
}
```

### Example:

```json
{
  "_id": "faq_123abc",
  "clientId": "client_456def",
  "question": "What are your delivery charges?",
  "answer": "Our delivery charges are $50 per 20kg...",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

## 🔄 Sync Frequency Recommendations

### Development
- **Manual sync** when you add/update FAQs
- No automatic sync

### Staging
- **Every 6 hours** or on-demand
- `FAQ_SYNC_INTERVAL_HOURS=6`

### Production
- **Every 1-4 hours** depending on FAQ update frequency
- `FAQ_SYNC_INTERVAL_HOURS=1` (if FAQs change often)
- `FAQ_SYNC_INTERVAL_HOURS=4` (if FAQs are stable)

---

## 🎯 Best Practices

### 1. Initial Sync

```bash
# First time setup
pnpm sync:faqs

# Verify sync worked
pnpm test:pinecone
```

### 2. Monitor Sync Logs

```bash
# Watch logs during sync
tail -f logs/combined.log

# Check for errors
grep "error" logs/error.log
```

### 3. Scheduled Syncs

For production, use a cron job instead of in-app scheduling:

```bash
# Add to crontab (every 4 hours)
0 */4 * * * cd /path/to/ai-deck && pnpm sync:faqs >> logs/cron.log 2>&1
```

---

## 🚀 Production Deployment

### On Render

1. **Add to `render.yaml`** (if using Infrastructure as Code):

```yaml
services:
  - type: web
    name: nkiru-call-service
    env: node
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    envVars:
      - key: NKIRU_API_KEY
        sync: false
      - key: FAQ_SYNC_ENABLED
        value: "true"
      - key: FAQ_SYNC_INTERVAL_HOURS
        value: "4"
```

2. **Or use Render Shell** to run manual sync:

```bash
# In Render dashboard → Shell
npm run sync:faqs
```

3. **Or set up a cron job** on another service to call:

```bash
curl -X POST https://your-app.onrender.com/api/v1/nkiru/faqs/sync
```

---

## 📝 API Endpoint Reference

### POST `/api/v1/nkiru/faqs/sync`

Triggers FAQ sync from NKIRU API.

**Request:**
```bash
POST /api/v1/nkiru/faqs/sync
```

**Response:**
```json
{
  "message": "FAQs synced successfully"
}
```

---

### GET `/api/v1/nkiru/faqs`

Get cached FAQs from database.

**Request:**
```bash
GET /api/v1/nkiru/faqs?clientId=optional_client_id
```

**Response:**
```json
[
  {
    "_id": "faq_123",
    "clientId": "client_456",
    "question": "What are your hours?",
    "answer": "We are open 9-5 Monday to Friday",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

## 🆘 Need Help?

### Common Issues

1. **"NKIRU_API_KEY is not set"**
   - Add to `.env` file
   - Restart server after adding

2. **"Can't reach NKIRU API"**
   - Check internet connection
   - Verify `NKIRU_API_BASE_URL`
   - Test endpoint with curl

3. **"No FAQs synced"**
   - Check NKIRU dashboard for FAQs
   - Verify API key has FAQ access
   - Check logs for detailed error

### Get Support

- Check `logs/error.log` for detailed errors
- Review NKIRU API documentation
- Contact NKIRU support if API issues persist

---

## ✅ Success Checklist

- [ ] Environment variables configured
- [ ] Database tables created (`pnpm db:push`)
- [ ] NKIRU API key is valid
- [ ] Pinecone index exists
- [ ] First FAQ sync successful (`pnpm sync:faqs`)
- [ ] Knowledge base search works
- [ ] FAQs visible in database
- [ ] Automatic sync enabled (optional)
- [ ] Monitoring set up for production

---

**Last Updated:** January 2026  
**Version:** 1.0
