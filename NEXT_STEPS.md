# Next Steps - NKIRU Call Microservice

## ✅ What's Working Now

- [x] Server running on port 7720
- [x] PostgreSQL database connected
- [x] Pinecone v6 vector search configured
- [x] OpenAI embeddings (1024 dimensions)
- [x] Mock FAQ sync working
- [x] Knowledge base API endpoint functional
- [x] RAG search with semantic similarity (0.5 threshold)
- [x] Ticket creation endpoint ready

---

## 📋 Immediate Next Steps

### Step 1: Commit Your Changes (5 mins) ⭐ DO THIS NOW

```bash
# Check what's changed
git status

# Add all files
git add .

# Commit with a descriptive message
git commit -m "Complete backend setup with Pinecone v6 and RAG

- Upgrade Pinecone from v1.1.2 to v6.1.3 (serverless)
- Fix TypeScript build errors in routes
- Add comprehensive testing guides and documentation
- Lower RAG confidence threshold from 0.7 to 0.5
- Add test scripts for Pinecone and RAG search
- Configure OpenAI embeddings with 1024 dimensions
- Add .pnpm-store to .gitignore
"

# Push to remote (if you have one)
git push
```

---

## 🚀 Phase 2: Integrate with Retell AI (30-60 mins)

### 2.1: Deploy Your Service

Your service needs to be publicly accessible for Retell AI to call it.

**Option A: Railway (Recommended - Free tier)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables in Railway dashboard:
# - DATABASE_URL
# - PINECONE_API_KEY
# - PINECONE_INDEX_NAME
# - OPENAI_API_KEY
# - RETELL_API_KEY
# - NKIRU_API_KEY

# Deploy
railway up
```

**Option B: Render**

1. Go to https://render.com
2. Connect your GitHub repo
3. Create a new Web Service
4. Add environment variables
5. Deploy

**Option C: Vercel/Netlify** (For serverless)

Your service URL will be something like:

- `https://your-app.railway.app`
- `https://your-app.onrender.com`

### 2.2: Configure Retell AI Assistant

1. Go to [Retell AI Dashboard](https://app.retellai.com/)
2. Navigate to your Assistant
3. Add Custom Functions:

#### Function 1: Search Knowledge Base

```json
{
  "name": "search_knowledge_base",
  "description": "Search the company's knowledge base to answer customer questions. Use this when the customer asks about products, services, pricing, policies, or any information that might be in the knowledge base.",
  "url": "https://ai-deck.onrender.com/api/v1/nkiru/tools/search-knowledge-base",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The customer's question or topic to search for"
      },
      "clientId": {
        "type": "string",
        "description": "The client ID (optional, for multi-tenant systems)"
      }
    },
    "required": ["query"]
  }
}
```

#### Function 2: Create Support Ticket

```json
{
  "name": "create_support_ticket",
  "description": "Create a support ticket in NKIRU when you cannot help the customer or they request human assistance. Always collect customer name, contact info, and describe their issue.",
  "url": "https://ai-deck.onrender.com/api/v1/nkiru/tools/create-support-ticket",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "customer_name": {
        "type": "string",
        "description": "The customer's full name"
      },
      "email": {
        "type": "string",
        "description": "The customer's email address"
      },
      "phoneNumber": {
        "type": "string",
        "description": "The customer's phone number"
      },
      "subject": {
        "type": "string",
        "description": "Brief subject line for the ticket"
      },
      "description": {
        "type": "string",
        "description": "Detailed description of the customer's issue or request"
      }
    },
    "required": ["customer_name", "subject", "description"]
  }
}
```

#### Update Assistant Prompt

Add this to your assistant's system prompt:

```
You are a helpful customer service assistant for [COMPANY NAME].

IMPORTANT INSTRUCTIONS:
1. Always search the knowledge base first when customers ask questions
2. Use the search_knowledge_base function for any questions about products, services, pricing, or policies
3. If you cannot find an answer or the customer requests human help, use create_support_ticket
4. When creating tickets, always collect: customer name, email/phone, and a clear description of their issue
5. Be friendly, professional, and concise
6. If the knowledge base returns no results, acknowledge you don't have that information and offer to create a ticket

Example flow:
- Customer: "How much does delivery cost?"
- You: *search_knowledge_base("delivery cost")* → "Our delivery costs $50 per 20kg..."
- Customer: "I need help with a complex issue"
- You: *collect info* → *create_support_ticket()* → "I've created ticket #123 for you..."
```

---

## 📊 Phase 3: Sync Real FAQs from NKIRU (10 mins)

### 3.1: Configure NKIRU API Credentials

Make sure your `.env` file has:

```bash
NKIRU_API_KEY=your_actual_nkiru_api_key
NKIRU_API_BASE_URL=https://stage-api.withnkiru.com
```

### 3.2: Run Real FAQ Sync

```bash
# Option 1: Using the sync script (Recommended)
pnpm sync:faqs

# Option 2: Using API endpoint (while server is running)
curl -X POST http://localhost:7720/api/v1/nkiru/faqs/sync

# Option 3: Enable automatic sync (add to .env)
FAQ_SYNC_ENABLED=true
FAQ_SYNC_INTERVAL_HOURS=24
```

### 3.3: Verify Sync

```bash
# Check FAQs in database
curl http://localhost:7720/api/v1/nkiru/faqs

# Test knowledge base search
curl -X POST http://localhost:7720/api/v1/nkiru/tools/search-knowledge-base \
  -H "Content-Type: application/json" \
  -d '{"query": "your question here"}'
```

**📖 Detailed Guide:** See `docs/NKIRU_FAQ_SYNC.md`

### 3.3: Set Up Cron Job (Optional)

For automatic daily syncs:

```typescript
// Add to src/index.ts
import { faqService } from './services/nkiru/faqService';
import { config } from './config';

if (config.faqSync.enabled) {
  // Sync on startup
  faqService.syncFAQs().catch(logger.error);

  // Sync every N hours
  setInterval(
    () => faqService.syncFAQs().catch(logger.error),
    config.faqSync.intervalHours * 60 * 60 * 1000
  );
}
```

---

## 🎯 Phase 4: Test End-to-End (30 mins)

### 4.1: Configure Phone Number in NKIRU

1. Go to NKIRU dashboard
2. Add a phone number
3. Connect it to your Retell AI assistant
4. Configure call routing

### 4.2: Make Test Calls

```bash
# Test scenarios:
1. Call and ask: "How much does delivery cost?"
   → Should search knowledge base and respond

2. Call and ask: "I need help with my order"
   → Should create a support ticket

3. Call and ask about something not in FAQs
   → Should acknowledge and offer to create ticket
```

### 4.3: Monitor Logs

```bash
# Watch server logs during test calls
pnpm dev

# Or in production
railway logs
# or
render logs
```

---

## 🔧 Phase 5: Production Optimization (Optional)

### Add Rate Limiting

Already configured in `src/index.ts` - you can adjust limits.

### Add Monitoring

```bash
# Add Sentry for error tracking
pnpm add @sentry/node

# Add in src/index.ts
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Add Analytics

Track:

- Number of knowledge base searches
- Success rate of searches
- Number of tickets created
- Call volume

### Set Up Alerts

Configure alerts for:

- API errors
- Database connection issues
- Pinecone connection failures
- High response times

---

## 📈 Future Enhancements

### Immediate (Next Sprint)

- [ ] Add FAQ categories/tags for better search
- [ ] Implement FAQ versioning
- [ ] Add multi-language support
- [ ] Cache frequently asked questions

### Medium Term

- [ ] Add conversation history tracking
- [ ] Implement sentiment analysis
- [ ] Add custom training data
- [ ] Build admin dashboard

### Long Term

- [ ] Fine-tune embeddings model
- [ ] Add voice analytics
- [ ] Implement A/B testing
- [ ] Build reporting dashboard

---

## 🆘 Quick Reference

### Important URLs

- **Local Server**: http://localhost:7720
- **Production**: https://YOUR-DEPLOYMENT-URL
- **Health Check**: /health
- **Knowledge Base Search**: /api/v1/nkiru/tools/search-knowledge-base
- **Create Ticket**: /api/v1/nkiru/tools/create-support-ticket

### Important Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Run production build
pnpm test:pinecone    # Test Pinecone connection
pnpm mock:sync        # Sync mock FAQs
pnpm prisma:studio    # Open database GUI
```

### Environment Variables Needed

```
DATABASE_URL=
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
OPENAI_API_KEY=
RETELL_API_KEY=
RETELL_ASSISTANT_ID=
NKIRU_API_KEY=
NKIRU_API_BASE_URL=
PORT=7720
```

---

## ✅ Success Checklist

### Backend Setup

- [x] Database configured
- [x] Pinecone configured
- [x] OpenAI configured
- [x] API endpoints working
- [x] Tests passing
- [ ] Code committed to git

### Deployment

- [ ] Service deployed
- [ ] Environment variables set
- [ ] Health check passing
- [ ] Database connected in production
- [ ] Pinecone connected in production

### Retell Integration

- [ ] Functions configured in Retell
- [ ] Assistant prompt updated
- [ ] Phone number configured
- [ ] Test calls successful

### Production Ready

- [ ] Real FAQs synced from NKIRU
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Documentation complete

---

## 🎉 You're Almost There!

Current Status: **Backend Complete, Ready for Deployment**

Next Immediate Action: **Commit your code** (see Step 1 above)

Then: **Deploy to Railway/Render** (see Phase 2)

Questions? Check `docs/TESTING_GUIDE.md` for testing help!
