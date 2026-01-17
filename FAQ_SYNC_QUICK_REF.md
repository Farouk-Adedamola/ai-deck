# 🚀 Quick Reference - NKIRU FAQ Sync

## One-Command Sync

```bash
pnpm sync:faqs
```

That's it! This will:
- ✅ Fetch FAQs from NKIRU API
- ✅ Store in PostgreSQL database
- ✅ Index in Pinecone for AI search

---

## Prerequisites

Your `.env` must have:

```bash
NKIRU_API_KEY=your_key_here
NKIRU_API_BASE_URL=https://stage-api.withnkiru.com
DATABASE_URL=your_neon_db_url
PINECONE_API_KEY=your_pinecone_key
OPENAI_API_KEY=your_openai_key
```

---

## Test It Works

```bash
# 1. Sync FAQs
pnpm sync:faqs

# 2. Start server
pnpm dev

# 3. Search knowledge base (in another terminal)
curl -X POST http://localhost:7720/api/v1/nkiru/tools/search-knowledge-base \
  -H "Content-Type: application/json" \
  -d '{"query": "What are your hours?"}'
```

---

## Troubleshooting

| Error                      | Fix                                  |
| -------------------------- | ------------------------------------ |
| "NKIRU_API_KEY is not set" | Add to `.env` file                   |
| "401 Unauthorized"         | Check API key is correct             |
| "404 Not Found"            | Verify NKIRU_API_BASE_URL            |
| "No FAQs returned"         | Create FAQs in NKIRU dashboard first |

---

## Full Documentation

See `docs/NKIRU_FAQ_SYNC.md` for complete guide.
