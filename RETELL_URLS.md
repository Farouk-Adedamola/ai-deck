# 🔗 Your Retell AI Integration URLs

## 📍 Assuming your Render URL is: `https://your-app.onrender.com`

Replace `your-app` with your actual Render service name.

---

## 🔧 Function URLs (Configure in Retell Dashboard)

### 1. Search Knowledge Base
```
https://your-app.onrender.com/api/v1/nkiru/tools/search-knowledge-base
```

### 2. Create Support Ticket
```
https://your-app.onrender.com/api/v1/nkiru/tools/create-support-ticket
```

---

## 📞 Webhook URL (Optional but Recommended)

### Retell Webhook
```
https://your-app.onrender.com/webhooks/retell
```

**Purpose**: Track call events, save transcripts, link calls to tickets

**Configure in**: Retell Dashboard → Your Assistant → Webhooks

**Events to Enable**:
- ✅ `call_started` - When call begins
- ✅ `call_ended` - When call completes (saves transcript)
- ✅ `call_analyzed` - When AI analysis completes

---

## 🎯 Why Use the Webhook?

### ✅ **WITH Webhook**:
- Track all calls in your database
- Save full transcripts automatically
- Get call duration & cost data
- Link support tickets to specific calls
- Build analytics dashboard
- Review conversation history

### ❌ **WITHOUT Webhook**:
- Calls work fine
- No call history saved
- No transcripts stored
- Can't track which ticket came from which call

---

## 🛠️ Quick Setup

### Step 1: Get Your Render URL

1. Go to: https://dashboard.render.com
2. Click your service
3. Copy the URL (e.g., `https://ai-deck-xyz.onrender.com`)

### Step 2: Configure Functions in Retell

1. Go to: https://app.retellai.com
2. Select your Assistant
3. Click **"Functions"** tab
4. For each function:
   - Click **"Add Function"** or **"Edit"**
   - Paste the URL (replace `your-app` with your actual URL)
   - Configure parameters as shown in `RETELL_URGENT_FIX.md`
   - Save

### Step 3: Configure Webhook (Optional)

1. In Retell Dashboard → Your Assistant
2. Look for **"Webhooks"** or **"Events"** section
3. Add webhook URL: `https://your-app.onrender.com/webhooks/retell`
4. Enable events: `call_started`, `call_ended`, `call_analyzed`
5. Save

---

## 🧪 Test Your Setup

### Test 1: Verify Endpoints Work

```bash
# Replace YOUR-APP with your actual Render service name

# Test search
curl -X POST https://YOUR-APP.onrender.com/api/v1/nkiru/tools/search-knowledge-base \
  -H "Content-Type: application/json" \
  -d '{"query": "delivery charges"}'

# Test ticket creation
curl -X POST https://YOUR-APP.onrender.com/api/v1/nkiru/tools/create-support-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "email": "test@example.com",
    "phoneNumber": "+1234567890",
    "subject": "Test",
    "description": "Testing"
  }'

# Test webhook
curl -X POST https://YOUR-APP.onrender.com/webhooks/retell \
  -H "Content-Type: application/json" \
  -d '{
    "event": "call_started",
    "call_id": "test_call_123",
    "call": {
      "start_timestamp": "2026-01-18T00:00:00Z",
      "direction": "inbound"
    }
  }'
```

### Test 2: Make a Real Call

1. Call your Retell AI assistant
2. Ask: "What are your delivery charges?"
3. Check Render logs - should see `search_knowledge_base` called
4. Try creating a ticket - provide all details
5. Check Render logs - should see `create_support_ticket` with data
6. Check your database - should see call record (if webhook enabled)

---

## 📊 Monitor in Real-Time

### View Render Logs

```bash
# In terminal (if you have Render CLI)
render logs --service your-service-name --tail

# Or in browser:
# https://dashboard.render.com → Your Service → Logs tab
```

### What to Look For

**✅ Good logs (working)**:
```json
{"message": "POST /api/v1/nkiru/tools/search-knowledge-base"}
{"message": "Tool Call: search_knowledge_base"}
{"query": "delivery charges"}
```

**❌ Bad logs (broken)**:
```json
{"message": "POST /api/v1/nkiru/tools/search-knowledge-base"}
{"level": "warn", "message": "Missing query"}
```

---

## 🔒 Security Notes

1. **Webhook Signature**: Your code supports webhook signature verification
   - Add `WEBHOOK_SECRET` to Render env vars
   - Set the same secret in Retell dashboard
   - Your app will verify requests are from Retell

2. **CORS**: Already configured for Retell's IPs

3. **Rate Limiting**: Consider adding if you get many calls

---

## 📋 Full URL Checklist

Replace `your-app` with your actual Render service name:

- [ ] Function 1: `https://your-app.onrender.com/api/v1/nkiru/tools/search-knowledge-base`
- [ ] Function 2: `https://your-app.onrender.com/api/v1/nkiru/tools/create-support-ticket`
- [ ] Webhook: `https://your-app.onrender.com/webhooks/retell`
- [ ] All URLs tested with `curl`
- [ ] All URLs configured in Retell dashboard
- [ ] Test call made and logged successfully

---

## 💡 Pro Tip: Find Your Render URL

Don't know your Render URL?

```bash
# Check your last deployment
cd /Users/user/Documents/ai-deck
git remote -v

# Or check Render dashboard
# https://dashboard.render.com → Your Service → Settings
# Look for "Service URL"
```

Your service URL will be something like:
- `https://ai-deck.onrender.com`
- `https://ai-deck-abc123.onrender.com`
- `https://nkiru-assistant.onrender.com`

---

**Remember**: Use HTTPS (not HTTP) for all Retell integrations! 🔒
