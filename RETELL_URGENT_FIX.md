# 🚨 URGENT: Retell AI Configuration Fixes

## 🔴 TWO Critical Issues Found

### Issue 1: Knowledge Base Search Always Fails
**Error in logs**: `"Missing query"`
**Problem**: Retell AI is NOT passing the `query` parameter

### Issue 2: Ticket Creation Gets Stuck in Loop  
**Problem**: AI asks for details repeatedly but never passes them to the function

---

## 🎯 THE SOLUTION: Update Retell AI Configuration

### Step 1: Fix Function Definitions in Retell Dashboard

Go to: **https://app.retellai.com** → Your Assistant → **Functions**

---

#### ✅ Function 1: `search_knowledge_base` (FIXED)

**Replace your current configuration with this:**

```json
{
  "name": "search_knowledge_base",
  "description": "Search the company knowledge base for answers. Call this IMMEDIATELY when customer asks a question about products, services, pricing, delivery, or policies. Extract the customer's question and pass it as the query parameter.",
  "url": "https://YOUR-APP.onrender.com/api/v1/nkiru/tools/search-knowledge-base",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The customer's question or search terms. Extract this from what the customer just said. Examples: 'delivery charges', 'return policy', 'product availability'"
      }
    },
    "required": ["query"]
  },
  "speak_on_send": false,
  "speak_during_execution": false
}
```

**Key Changes**:
- ✅ Removed `execution_message` - not needed
- ✅ Made `query` description more explicit
- ✅ Added examples so AI knows what to extract

---

#### ✅ Function 2: `create_support_ticket` (FIXED)

**Replace your current configuration with this:**

```json
{
  "name": "create_support_ticket",
  "description": "Create a support ticket. CRITICAL: You MUST collect ALL of these details from the customer BEFORE calling this function: full name, email, phone number, and description. If ANY are missing, ASK for them one at a time. Do not call this function until you have collected everything.",
  "url": "https://YOUR-APP.onrender.com/api/v1/nkiru/tools/create-support-ticket",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "customer_name": {
        "type": "string",
        "description": "Customer's full name. Extract from when they tell you their name. Example: 'John Doe'"
      },
      "email": {
        "type": "string",
        "description": "Customer's email address. Extract from when they provide their email. Example: 'john@example.com'"
      },
      "phoneNumber": {
        "type": "string",
        "description": "Customer's phone number with country code. Extract from when they provide their number. Example: '+1234567890' or '0706790208'"
      },
      "subject": {
        "type": "string",
        "description": "Brief summary of the issue in 5-10 words. Create this from the customer's description. Example: 'Delivery cost inquiry' or 'Missing package complaint'"
      },
      "description": {
        "type": "string",
        "description": "Full description of the customer's issue. Combine everything they told you about their problem. Example: 'Customer wants to know delivery charges for 50kg shipment to Lagos'"
      }
    },
    "required": ["customer_name", "email", "phoneNumber", "subject", "description"]
  },
  "speak_on_send": false,
  "speak_during_execution": false
}
```

**Key Changes**:
- ✅ More explicit parameter descriptions
- ✅ Added "Extract from when..." instructions
- ✅ Added concrete examples
- ✅ Made description emphasize collecting info FIRST

---

### Step 2: Fix System Prompt (MUCH SHORTER & CLEARER)

**Replace your entire system prompt with this streamlined version:**

```
You are a professional customer service assistant for PROXY.

## CORE RULES:

### 1. Answering Questions
- When customer asks about products, services, pricing, delivery, or policies → IMMEDIATELY call search_knowledge_base with their question
- Extract the key question and pass it as the query parameter
- Example: Customer says "How much is delivery?" → You call search_knowledge_base with query="delivery charges"
- If search finds nothing, offer to create a ticket

### 2. Creating Tickets
When creating a ticket, collect information ONE ITEM AT A TIME:

**Step 1**: "May I have your full name?"
**Step 2**: "What email address should I use?"  
**Step 3**: "What's the best phone number to reach you?"
**Step 4**: Let them describe their issue

ONLY call create_support_ticket AFTER you have ALL four pieces of information.

## GOOD EXAMPLE:

Customer: "What are delivery charges?"
You: [Call search_knowledge_base with query="delivery charges"]
You: "Our delivery is $50 per 20kg of goods."

## GOOD EXAMPLE 2:

Customer: "I need help with my order"
You: "I'll create a support ticket. May I have your full name?"
Customer: "John Doe"
You: "Thank you. What email should I use?"
Customer: "john@example.com"
You: "And your phone number?"
Customer: "+1234567890"
You: "What's the issue with your order?"
Customer: "It hasn't arrived after 2 weeks"
You: [Call create_support_ticket with: customer_name="John Doe", email="john@example.com", phoneNumber="+1234567890", subject="Missing order", description="Order hasn't arrived after 2 weeks"]
You: "I've created ticket for you. Our team will contact you within 24 hours."

## BAD EXAMPLE (DON'T DO THIS):

Customer: "I need help"
You: [Calls create_support_ticket immediately] ❌ NO! Ask for their info first!

Customer: "May I have your full name? What's your email? What's your phone number?" ❌ NO! Ask ONE at a time!

## TONE:
Professional, friendly, concise. Keep responses to 1-2 sentences.
```

**Why This Works Better**:
- ✅ **Shorter** - AI can process faster
- ✅ **More explicit** - Shows exact conversation flow
- ✅ **Concrete examples** - AI learns from patterns
- ✅ **Clear "bad" examples** - Shows what NOT to do
- ✅ **Step-by-step** - AI knows the exact order

---

## 🧪 Test After Making Changes

### Test 1: Knowledge Base Search

**You**: "What are your delivery charges?"

**Expected**:
1. ✅ AI calls `search_knowledge_base` with `query="delivery charges"`
2. ✅ AI reads the result and tells you the answer
3. ✅ Check logs - should see successful search

**If it fails**: The function definition needs the `query` parameter properly configured

---

### Test 2: Ticket Creation

**You**: "I need help with something"

**Expected Conversation Flow**:
1. ✅ AI: "May I have your full name?"
2. **You**: "John Doe"
3. ✅ AI: "What email should I use?"
4. **You**: "john@example.com"
5. ✅ AI: "What's your phone number?"
6. **You**: "+1234567890"
7. ✅ AI: "What do you need help with?"
8. **You**: "My order is missing"
9. ✅ AI calls `create_support_ticket` with ALL fields filled
10. ✅ AI: "Ticket created! We'll contact you soon."

**Check Render Logs** - Should see:
```json
{
  "message": "Tool Call: create_support_ticket",
  "customer_name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "subject": "Missing order",
  "hasDescription": true
}
```

---

## 🔍 Why Your Current Setup Fails

### Problem 1: Search Fails
Your logs show:
```json
{
  "name": "search_knowledge_base",
  "arguments": "{\"execution_message\":\"Let me check...\"}"
}
```

**Missing**: The `query` parameter!

Retell is using `execution_message` (the message the AI speaks) but NOT extracting the actual search query. The function definition needs clearer instructions.

---

### Problem 2: Ticket Loop
Your logs show:
```json
{
  "name": "create_support_ticket",
  "args": {}
}
```

**Empty args!** The AI has the information from the conversation but isn't mapping it to the function parameters.

The prompt was too verbose and confusing. The AI couldn't tell:
1. When to call the function
2. What data to extract
3. How to map conversation to parameters

---

## 📋 Deployment Checklist

- [ ] Update `search_knowledge_base` function in Retell dashboard
- [ ] Update `create_support_ticket` function in Retell dashboard  
- [ ] Replace system prompt with shorter, clearer version
- [ ] Test knowledge base search - ask 3 different questions
- [ ] Test ticket creation - go through full flow
- [ ] Check Render logs - verify data is being passed correctly
- [ ] Make a real test call - verify everything works end-to-end

---

## 🚀 Priority Order

1. **First**: Update function definitions (fixes parameter passing)
2. **Second**: Update system prompt (fixes AI behavior)
3. **Third**: Test both scenarios
4. **Fourth**: Monitor logs during test calls

---

## 💡 Pro Tips

1. **Be Explicit**: Retell AI needs VERY clear instructions about what data to extract
2. **Show Examples**: The AI learns better from concrete examples than abstract rules
3. **One Thing at a Time**: For ticket creation, emphasize collecting info sequentially
4. **Test Thoroughly**: Make 5-10 test calls with different scenarios
5. **Watch Logs**: Your Render logs show exactly what data Retell is sending

---

## 🆘 If Still Not Working

### Check Function URLs
Make sure URLs in Retell point to your actual Render deployment:
```
https://YOUR-APP-NAME.onrender.com/api/v1/nkiru/tools/search-knowledge-base
https://YOUR-APP-NAME.onrender.com/api/v1/nkiru/tools/create-support-ticket
```

### Test Endpoints Directly
```bash
# Test search
curl -X POST https://your-app.onrender.com/api/v1/nkiru/tools/search-knowledge-base \
  -H "Content-Type: application/json" \
  -d '{"query": "delivery charges"}'

# Should return FAQ results

# Test ticket creation
curl -X POST https://your-app.onrender.com/api/v1/nkiru/tools/create-support-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "email": "test@example.com",
    "phoneNumber": "+1234567890",
    "subject": "Test ticket",
    "description": "Testing the endpoint"
  }'

# Should create ticket in NKIRU
```

### Contact Retell Support
If AI still doesn't extract parameters correctly, Retell's team can help debug function calling behavior.

---

## 📚 References

- Full configuration guide: `docs/RETELL_AI_CONFIGURATION.md`
- Retell AI Docs: https://docs.retellai.com/
- Your API endpoints: `src/routes/nkiru.ts`

---

**Need help?** Check your Render logs - they show exactly what data Retell is (or isn't) sending! 🔍
