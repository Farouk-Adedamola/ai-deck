# 🚀 Render Deployment Checklist - Quick Start

> **You already have**: Database on Render ✅  
> **Time required**: 15-20 minutes  
> **Status**: Ready to deploy

---

## ✅ Pre-Deployment Checklist

### 1. Commit Your Code (2 mins)

```bash
# Check current status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Complete backend setup - Ready for Render deployment

- Pinecone v6 serverless configured
- RAG search with OpenAI embeddings
- All TypeScript errors fixed
- Mock FAQ sync tested
- Database migrations ready
"

# Push to GitHub (if not already done)
git push origin main
```

**✅ Verify**: Your code is on GitHub

---

## 🚀 Render Deployment Steps

### 2. Create Web Service on Render (5 mins)

1. **Go to**: https://dashboard.render.com
2. **Click**: "New +" → "Web Service"
3. **Connect Repository**:
   - Select your GitHub account
   - Choose your repository (e.g., `nkiru-call-micro`)
   - Click "Connect"

### 3. Configure Service Settings (3 mins)

Fill in these **exact** settings:

| Setting            | Value                                                |
| ------------------ | ---------------------------------------------------- |
| **Name**           | `nkiru-call-service` (or your choice)                |
| **Region**         | Same as your database (check your DB region)         |
| **Branch**         | `main`                                               |
| **Root Directory** | _(leave blank)_                                      |
| **Runtime**        | **Node**                                             |
| **Build Command**  | `pnpm install && pnpm prisma:generate && pnpm build` |
| **Start Command**  | `pnpm start`                                         |
| **Plan**           | **Free**                                             |

**⚠️ Important**: Don't click "Create Web Service" yet!

---

### 4. Add Environment Variables (5 mins)

Scroll down to **"Environment Variables"** section and add these:

#### 🗄️ Database (You already have this!)

```bash
DATABASE_URL=postgresql://nkiru_user:YOUR_PASSWORD@dpg-xxxxx.oregon-postgres.render.com/nkiru_db
```

**📌 Where to find**: Go to your Render database → "Info" tab → Copy "Internal Database URL"

#### 🔑 Required API Keys

```bash
# Pinecone
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=nkiru-faqs

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=text-embedding-3-small

# Retell AI
RETELL_API_KEY=your_retell_api_key_here
RETELL_ASSISTANT_ID=your_assistant_id_here

# NKIRU
NKIRU_API_KEY=your_nkiru_api_key_here
NKIRU_API_BASE_URL=https://stage-api.withnkiru.com

# Server Config
NODE_ENV=production
PORT=10000
LOG_LEVEL=info

# FAQ Sync (Optional)
FAQ_SYNC_ENABLED=true
FAQ_SYNC_INTERVAL_HOURS=24
```

**💡 Pro Tip**: Copy from your local `.env` file if you have one.

---

### 5. Deploy! (2-5 mins)

1. **Click**: "Create Web Service"
2. **Wait**: Render will now:
   - ✅ Clone your repository
   - ✅ Install dependencies with pnpm
   - ✅ Generate Prisma client
   - ✅ Build TypeScript files
   - ✅ Start your server

3. **Watch the logs** for any errors (usually takes 2-3 minutes)

**✅ Success**: You'll see `Deploy live for nkiru-call-service` 🎉

---

### 6. Run Database Migrations (2 mins)

Your database tables need to be created:

#### Option A: Render Shell (Easiest)

1. Go to your service dashboard
2. Click **"Shell"** (top navigation bar)
3. Run this command:

```bash
npx prisma db push
```

4. Wait for "✅ Database is now in sync with schema"

#### Option B: From Your Local Machine

```bash
# Temporarily use production database
export DATABASE_URL="your_render_internal_database_url"

# Push schema
pnpm db:push

# Unset variable
unset DATABASE_URL
```

---

### 7. Sync Mock FAQs (Test Data) (1 min)

Using Render Shell or locally:

```bash
npx ts-node scripts/mock-sync-faqs.ts
```

**✅ Expected Output**: "✅ Successfully synced 5 FAQs to Pinecone"

---

### 8. Test Your Deployment (3 mins)

Get your service URL: `https://nkiru-call-service.onrender.com`

#### Test 1: Health Check

```bash
curl https://YOUR-SERVICE.onrender.com/health
```

**Expected**: `{"status":"ok","timestamp":"..."}`

#### Test 2: Knowledge Base Search

```bash
curl -X POST https://YOUR-SERVICE.onrender.com/api/v1/nkiru/tools/search-knowledge-base \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How much does delivery cost?",
    "clientId": "68a30d1f2b9087134a75db48"
  }'
```

**Expected**: Returns FAQ with delivery pricing info

#### Test 3: Create Ticket

```bash
curl -X POST https://YOUR-SERVICE.onrender.com/api/v1/nkiru/tools/create-support-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "subject": "Test Ticket",
    "description": "Testing ticket creation from deployed service"
  }'
```

**Expected**: `{"success": true, "ticketId": "..."}`

---

## 🎯 Next Steps After Deployment

### ✅ Your Service is Live!

**Your URLs**:
- **Service**: `https://YOUR-SERVICE.onrender.com`
- **Health**: `https://YOUR-SERVICE.onrender.com/health`
- **Knowledge Base**: `https://YOUR-SERVICE.onrender.com/api/v1/nkiru/tools/search-knowledge-base`
- **Tickets**: `https://YOUR-SERVICE.onrender.com/api/v1/nkiru/tools/create-support-ticket`

---

### 🔗 Configure Retell AI (15 mins)

Now connect your deployed service to Retell AI:

#### Step 1: Go to Retell Dashboard

https://app.retellai.com/

#### Step 2: Add Custom Functions

**Function 1: Search Knowledge Base**

```json
{
  "name": "search_knowledge_base",
  "description": "Search the company's knowledge base to answer customer questions about products, services, pricing, or policies.",
  "url": "https://YOUR-SERVICE.onrender.com/api/v1/nkiru/tools/search-knowledge-base",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The customer's question or search query"
      },
      "clientId": {
        "type": "string",
        "description": "Client ID (optional)"
      }
    },
    "required": ["query"]
  }
}
```

**Function 2: Create Support Ticket**

```json
{
  "name": "create_support_ticket",
  "description": "Create a support ticket when unable to help or customer requests human assistance.",
  "url": "https://YOUR-SERVICE.onrender.com/api/v1/nkiru/tools/create-support-ticket",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "customer_name": {
        "type": "string",
        "description": "Customer's full name"
      },
      "email": {
        "type": "string",
        "description": "Customer's email"
      },
      "phoneNumber": {
        "type": "string",
        "description": "Customer's phone number"
      },
      "subject": {
        "type": "string",
        "description": "Brief ticket subject"
      },
      "description": {
        "type": "string",
        "description": "Detailed issue description"
      }
    },
    "required": ["customer_name", "subject", "description"]
  }
}
```

#### Step 3: Update Assistant Prompt

Add to your Retell AI assistant's system prompt:

```
You are a helpful customer service assistant.

IMPORTANT WORKFLOW:
1. When customer asks a question, ALWAYS use search_knowledge_base first
2. If knowledge base has the answer, provide it clearly and concisely
3. If no answer found, or customer needs human help, use create_support_ticket
4. When creating tickets, collect: name, email/phone, and clear issue description
5. Be friendly, professional, and helpful

Example:
Customer: "What are your delivery charges?"
You: [search_knowledge_base("delivery charges")] → "Our delivery costs are $50 per 20kg..."

Customer: "I need help with a complex billing issue"
You: [collect info] → [create_support_ticket()] → "I've created ticket #123. Our team will contact you within 24 hours."
```

---

### 📞 Test End-to-End (10 mins)

1. **Configure Phone Number** in NKIRU dashboard
2. **Connect** to your Retell AI assistant
3. **Make test calls**:
   - Ask about delivery costs → Should search KB
   - Request human help → Should create ticket
   - Ask unknown question → Should acknowledge and offer ticket

---

## 🔥 Important: Prevent Cold Starts

Render free tier spins down after 15 mins of inactivity. First request takes 30-60 seconds.

### Solution: Set up a Ping Service

Use **cron-job.org** (free):

1. Go to https://cron-job.org
2. Create account (free)
3. Create new cron job:
   - **URL**: `https://YOUR-SERVICE.onrender.com/health`
   - **Schedule**: Every 10 minutes
   - **Method**: GET

This keeps your service warm 24/7! 🔥

---

## 📊 Monitoring Your Service

### View Logs

**In Render Dashboard**:
1. Go to your service
2. Click "Logs" tab
3. Watch real-time logs

**Using Render CLI**:

```bash
# Install CLI
npm install -g render-cli

# View logs
render logs --service nkiru-call-service --tail
```

### Set Up Alerts

In Render dashboard → Service → Settings:
- Enable "Deploy Notifications"
- Add your email for failure alerts

---

## 🆘 Troubleshooting

### ❌ Build Fails

**Check**: Build logs for errors

**Common Issues**:
- Missing `pnpm` → Check build command includes `pnpm install`
- TypeScript errors → Run `pnpm build` locally first
- Prisma errors → Ensure `pnpm prisma:generate` runs before build

### ❌ Service Won't Start

**Check**: Startup logs

**Common Issues**:
- Port not set → Verify `PORT=10000` in env vars
- Database connection → Use "Internal Database URL", not "External"
- Missing env vars → Check all required vars are set

### ❌ Database Connection Fails

**Error**: `Can't reach database server`

**Solution**:
1. Use **Internal Database URL** (starts with `postgresql://`)
2. Verify database is running (check Render dashboard)
3. Ensure web service and database are in same region

### ❌ Cold Starts Taking Too Long

**Normal**: First request after sleep takes 30-60 seconds

**Solutions**:
1. Set up cron job (see above)
2. Upgrade to paid plan ($7/month) - no cold starts

---

## ✅ Deployment Complete Checklist

- [ ] Code committed and pushed to GitHub
- [ ] Web service created on Render
- [ ] All environment variables configured
- [ ] Service deployed successfully
- [ ] Database migrations run (Prisma)
- [ ] Mock FAQs synced to Pinecone
- [ ] Health check returns 200 OK
- [ ] Knowledge base search tested
- [ ] Ticket creation tested
- [ ] Retell AI functions configured
- [ ] Assistant prompt updated
- [ ] Cron job set up (prevent cold starts)
- [ ] Test phone call successful

---

## 🎉 Congratulations!

Your NKIRU Call Microservice is now live on Render!

**Service URL**: `https://YOUR-SERVICE.onrender.com`

### What's Next?

1. **Sync Real FAQs** from NKIRU (see NEXT_STEPS.md - Phase 3)
2. **Monitor logs** during first few calls
3. **Iterate** based on real customer interactions
4. **Add analytics** to track usage

---

## 📚 Additional Resources

- **Full Deployment Guide**: `docs/DEPLOY_RENDER.md`
- **Testing Guide**: Check knowledge base search tests
- **Next Steps**: `NEXT_STEPS.md`
- **Render Docs**: https://render.com/docs
- **Support**: Contact via NKIRU dashboard

---

**Need Help?**

- Check logs in Render dashboard
- Review troubleshooting section above
- Consult `NEXT_STEPS.md` for additional guidance

---

*Last Updated: January 2026*
*Version: 1.0 - Production Ready*
