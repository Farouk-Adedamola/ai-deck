# 🔍 Webhook Diagnostics Guide

## Problem: Calls not being saved to database

Your function tools work ✅, but calls aren't being tracked ❌

This means **webhooks are not configured correctly** in Retell Dashboard.

---

## 📝 Quick Fix Checklist

### 1. ✅ Correct Webhook URL

Your webhook endpoint is at: `/webhooks/retell` (NOT `/api/v1/webhooks/retell`)

**Correct URLs:**
- **Production (Render):** `https://your-app.onrender.com/webhooks/retell`
- **Local (ngrok):** `https://your-ngrok-url.ngrok-free.app/webhooks/retell`

### 2. 🔧 Update Retell Dashboard

1. Go to: https://app.retellai.com
2. Select your Assistant
3. Find **"Webhooks"** section
4. Update webhook URL to the correct path above
5. Enable these events:
   - ✅ `call_started`
   - ✅ `call_ended`
   - ✅ `call_analyzed`
6. **Save** changes

### 3. 🧪 Test Your Webhook

#### Option A: Test Locally (if server is running)

```bash
# Start your server first
pnpm dev

# In another terminal, run:
./test-webhook.sh

# OR manually:
curl -X POST http://localhost:7720/webhooks/retell \
  -H "Content-Type: application/json" \
  -d '{
    "event": "call_started",
    "call_id": "test_call_123",
    "call": {
      "start_timestamp": "2026-01-26T00:00:00Z",
      "direction": "inbound",
      "from_number": "+1234567890"
    }
  }'
```

**Expected Response:**
```json
{"received": true}
```

**Check Database:**
```sql
SELECT * FROM calls WHERE retell_call_id = 'test_call_123';
SELECT * FROM call_events WHERE event_type = 'call_started';
```

#### Option B: Test Production (Render)

```bash
# Replace YOUR-APP with your actual Render service name
curl -X POST https://YOUR-APP.onrender.com/webhooks/retell \
  -H "Content-Type: application/json" \
  -d '{
    "event": "call_started",
    "call_id": "test_production_123",
    "call": {
      "start_timestamp": "2026-01-26T00:00:00Z",
      "direction": "inbound"
    }
  }'
```

### 4. 📊 Check Logs

#### If Running Locally:
Watch your terminal where `pnpm dev` is running. You should see:
```
{"message":"POST /webhooks/retell"}
{"message":"Received Retell webhook event: call_started","call_id":"test_call_123"}
```

#### If on Render:
1. Go to: https://dashboard.render.com
2. Select your service
3. Click **"Logs"** tab
4. Make a test call
5. Look for webhook events

**Good Logs:**
```json
{"message":"POST /webhooks/retell"}
{"message":"Received Retell webhook event: call_started"}
```

**Bad Logs (not seeing this?):**
- Webhook URL is wrong in Retell
- Retell can't reach your server
- Events not enabled in Retell

---

## 🔍 Common Issues

### Issue 1: No webhook logs at all
**Cause:** Retell isn't sending webhooks to your server

**Fix:**
1. Verify webhook URL in Retell Dashboard
2. Ensure events are enabled (`call_started`, `call_ended`, `call_analyzed`)
3. Check if your server is publicly accessible (ngrok for local, Render URL for production)

### Issue 2: Webhook receives events but database not updating
**Cause:** Database connection issue

**Fix:**
```bash
# Test database connection
pnpm run db:verify

# Check Prisma client is generated
pnpm run prisma:generate
```

### Issue 3: Signature verification failures
**Cause:** Webhook verification uses `RETELL_API_KEY` (not a separate webhook secret)

**Fix:**
1. Ensure `RETELL_API_KEY` is set in your `.env` file
2. The webhook handler automatically uses this key to verify signatures
3. No separate `WEBHOOK_SECRET` is needed for Retell

### Issue 4: Calls work but not saved
**Cause:** This is your current issue - webhook not configured

**Fix:** Follow the checklist above ☝️

---

## ✅ Verification Steps

After making the changes:

1. **Update webhook URL in Retell Dashboard** ✓
2. **Enable webhook events** ✓
3. **Test webhook endpoint** ✓
4. **Make a real call** ✓
5. **Check database** ✓

### Check Database:

```sql
-- Should show your calls
SELECT retell_call_id, status, started_at, phone_number 
FROM calls 
ORDER BY created_at DESC 
LIMIT 10;

-- Should show webhook events
SELECT event_type, occurred_at 
FROM call_events 
ORDER BY occurred_at DESC 
LIMIT 10;
```

---

## 🎯 Expected Behavior After Fix

When you make a call:

1. **call_started event** → Creates record in `calls` table with status='ongoing'
2. **Function calls work** → Your search and ticket tools execute
3. **call_ended event** → Updates `calls` table with transcript, summary, duration
4. **call_analyzed event** → Adds AI-generated summary
5. **All events logged** → Each webhook creates entry in `call_events` table

---

## 🆘 Still Not Working?

Check these:

1. **Server running?**
   ```bash
   curl http://localhost:7720/health
   # Should return: {"status":"ok","timestamp":"...","service":"nkiru-call-micro"}
   ```

2. **Database connected?**
   ```bash
   pnpm run db:verify
   ```

3. **Correct webhook URL?**
   - Local: `http://localhost:7720/webhooks/retell` → Must use **ngrok** for Retell to reach it
   - Production: `https://your-app.onrender.com/webhooks/retell`

4. **Events enabled in Retell?**
   - Go to Retell Dashboard
   - Check webhook configuration
   - Ensure `call_started`, `call_ended`, `call_analyzed` are enabled

5. **Check Retell webhook logs:**
   - Retell Dashboard → Webhooks → View Delivery Logs
   - Look for failed deliveries or errors

---

## 📞 Need Help?

Share these details:

1. Your webhook URL configured in Retell
2. Server logs when making a call
3. Database query results:
   ```sql
   SELECT COUNT(*) FROM calls;
   SELECT COUNT(*) FROM call_events;
   ```
4. Whether you're running locally (with ngrok) or on Render
