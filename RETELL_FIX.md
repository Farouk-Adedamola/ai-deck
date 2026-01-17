# 🚨 Quick Fix: Retell AI Not Passing Customer Info

## The Problem
Your logs show Retell AI is calling `create_support_ticket` with **empty fields**:
```
customerName: "" ❌
email: "" ❌  
phoneNumber: "" ❌
subject: "" ❌
description: "" ❌
```

## Root Cause
**Retell AI's assistant is NOT collecting customer information before calling your function.**

---

## ✅ Immediate Fix (5 minutes)

### Step 1: Update Retell AI System Prompt

1. Go to: https://app.retellai.com
2. Select your Assistant
3. Replace the system prompt with this:

```
You are a professional customer service assistant.

CRITICAL RULES FOR CREATING TICKETS:

Before calling create_support_ticket, you MUST collect:
1. Customer's full name (ask: "May I have your full name?")
2. Email address (ask: "What email should I use?")
3. Phone number (ask: "What's your phone number?")
4. Description of their issue

NEVER call create_support_ticket with empty information!

Example Good Flow:
Customer: "I need help"
You: "I'd be happy to help. May I have your full name?"
Customer: "John Doe"
You: "Thank you. What email should I use?"
Customer: "john@example.com"
You: "And your phone number?"
Customer: "+1234567890"
You: "What's the issue you need help with?"
Customer: "My order hasn't arrived"
You: [NOW call create_support_ticket with all info]

For questions, ALWAYS search knowledge base first.
```

### Step 2: Update Function Description

In Retell dashboard → Functions → Edit `create_support_ticket`:

**Change description to:**
```
Create ticket ONLY AFTER collecting customer's full name, email, phone number, and issue description. You MUST ask for missing information.
```

### Step 3: Redeploy Your Updated Code

```bash
# Your code now validates and provides helpful error messages
git add .
git commit -m "Add validation for ticket creation endpoint"
git push

# Render will auto-deploy
```

---

## 🧪 Test It

### What Should Happen:

1. **Call** your assistant
2. **Say**: "I need help with my order"
3. **AI should ask**: "May I have your full name?"
4. **You provide**: "John Doe"
5. **AI should ask**: "What email should I use?"
6. **You provide**: "john@example.com"  
7. **AI should ask**: "What's your phone number?"
8. **You provide**: "+1234567890"
9. **AI should ask**: "What's the issue?"
10. **You describe** the problem
11. **AI creates ticket** with all info ✅

---

## 📊 Check If It's Working

### View Render Logs:
1. Go to: https://dashboard.render.com
2. Your service → Logs tab
3. Look for:

**✅ Success (after fix):**
```json
{
  "message": "Tool Call: create_support_ticket",
  "customer_name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890"
}
```

**❌ Still failing:**
```json
{
  "message": "create_support_ticket called with missing fields",
  "missingFields": ["customer_name", "email"]
}
```

If still failing, the system prompt needs to be more explicit.

---

## 📖 Full Guide

See `docs/RETELL_AI_CONFIGURATION.md` for complete setup instructions, examples, and troubleshooting.

---

## 🎯 Why This Happens

Retell AI's LLM needs **explicit instructions** to:
1. Know WHEN to call functions
2. Know WHAT information to collect first
3. Know HOW to extract info from conversation

Without clear instructions, it calls functions immediately with empty data.

---

## ⚡ Your Code Changes

I've updated your endpoint (`src/routes/nkiru.ts`) to:
- ✅ Validate all required fields
- ✅ Return helpful error messages if data missing
- ✅ Log exactly what data was received
- ✅ Help debug Retell AI integration

After redeploying, your service will handle missing data gracefully and tell Retell AI what's needed.

