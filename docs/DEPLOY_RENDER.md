# Deploy to Render - Free Tier Guide

## What Render Provides FREE:
- ✅ Web service hosting
- ✅ PostgreSQL database (free tier)
- ✅ Automatic SSL certificates
- ✅ Auto-deploy from GitHub
- ✅ Environment variables management

## Limitations:
- Services spin down after 15 mins of inactivity (cold starts)
- 750 hours/month per service
- Database: 90 days retention, then deleted if inactive

---

## Step-by-Step Deployment

### 1. Prepare Your Repository

First, commit and push your code:

```bash
# Commit everything
git add .
git commit -m "Prepare for Render deployment"

# Push to GitHub (create repo if needed)
git remote add origin https://github.com/YOUR_USERNAME/nkiru-call-micro.git
git push -u origin main
```

### 2. Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 3. Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `nkiru-db`
   - **Database**: `nkiru_call_db`
   - **User**: (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: **Free**
3. Click **"Create Database"**
4. Wait 2-3 minutes for provisioning
5. **Copy the "Internal Database URL"** (starts with `postgresql://`)

### 4. Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `nkiru-call-micro`
3. Configure:
   - **Name**: `nkiru-call-service`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: **Node**
   - **Build Command**: `pnpm install && pnpm prisma:generate && pnpm build`
   - **Start Command**: `pnpm start`
   - **Plan**: **Free**

### 5. Add Environment Variables

In the **Environment** tab, add these:

```bash
# Database (use Internal Database URL from step 3)
DATABASE_URL=postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/dbname

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=nkiru-faqs

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=text-embedding-3-small

# Retell AI
RETELL_API_KEY=your_retell_api_key
RETELL_ASSISTANT_ID=your_assistant_id

# NKIRU
NKIRU_API_KEY=your_nkiru_api_key
NKIRU_API_BASE_URL=https://stage-api.withnkiru.com

# Server
NODE_ENV=production
PORT=10000

# FAQ Sync (optional)
FAQ_SYNC_ENABLED=true
FAQ_SYNC_INTERVAL_HOURS=24

# Logging
LOG_LEVEL=info
```

### 6. Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repo
   - Run `pnpm install`
   - Generate Prisma client
   - Build TypeScript
   - Start your server
3. Watch the logs for any errors

### 7. Run Database Migrations

Once deployed, you need to create the database tables:

**Option A: Use Render Shell (Recommended)**

1. Go to your web service
2. Click **"Shell"** tab (top right)
3. Run:
```bash
npx prisma db push
```

**Option B: From Your Local Machine**

```bash
# Set the production DATABASE_URL temporarily
export DATABASE_URL="your_render_database_url"

# Run migration
pnpm prisma:migrate:deploy

# Or use db push
pnpm db:push
```

### 8. Sync FAQs

After deployment, sync your FAQs:

```bash
curl -X POST https://your-app-name.onrender.com/api/v1/nkiru/faqs/sync
```

Or SSH into Render shell and run:
```bash
npx ts-node scripts/mock-sync-faqs.ts
```

### 9. Test Your Deployment

```bash
# Health check
curl https://your-app-name.onrender.com/health

# Test knowledge base
curl -X POST https://your-app-name.onrender.com/api/v1/nkiru/tools/search-knowledge-base \
  -H "Content-Type: application/json" \
  -d '{"query": "How much does delivery cost?", "clientId": "68a30d1f2b9087134a75db48"}'
```

---

## Important Notes

### Cold Starts
Free tier services spin down after 15 minutes of inactivity. First request after sleep takes 30-60 seconds.

**Solutions:**
1. Use a cron job to ping your service every 10 minutes:
   - https://cron-job.org/en/
   - Ping: `https://your-app.onrender.com/health`

2. Upgrade to paid tier ($7/month) - no cold starts

### Database Backup
Free databases are deleted after 90 days of inactivity.

**Solutions:**
1. Set up `FAQ_SYNC_ENABLED=true` to keep it active
2. Use external database (see Option 2 below)

### Logs
Access logs via Render dashboard or CLI:
```bash
# Install Render CLI
npm install -g render-cli

# View logs
render logs -s your-service-name --tail
```

---

## Your URLs After Deployment

- **Web Service**: `https://nkiru-call-service.onrender.com`
- **Database**: `internal-url.oregon-postgres.render.com` (internal only)
- **Health Check**: `https://nkiru-call-service.onrender.com/health`

---

## Troubleshooting

### Build Fails

Check build logs. Common issues:
- Missing environment variables
- TypeScript errors
- Prisma generation failed

Solution: Make sure all env vars are set before build.

### Database Connection Issues

Error: `Can't reach database server`

Solutions:
1. Use the **Internal Database URL** (not External)
2. Check database is running in Render dashboard
3. Verify DATABASE_URL is correct

### Service Won't Start

Check logs for:
- Port binding issues (use `PORT` from env, not hardcoded)
- Missing dependencies
- Prisma client not generated

---

## What Render Does For You

✅ **Automatically**:
- Provisions PostgreSQL database
- Manages SSL certificates
- Auto-deploys on git push
- Provides monitoring dashboard
- Handles scaling

❌ **You Must Do**:
- Create database schema (Prisma migrations)
- Sync FAQ data
- Configure environment variables
- Set up Retell AI webhooks

---

## Next Steps After Deployment

1. ✅ Service is live
2. ✅ Database is connected
3. → Run Prisma migrations
4. → Sync FAQs
5. → Configure Retell AI with your new URL
6. → Test end-to-end with phone call
