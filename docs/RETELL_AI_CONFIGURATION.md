# 🔧 Retell AI Configuration Guide

## Problem: Retell AI Not Passing Parameters

If you're seeing errors like "customerName should not be empty", it means Retell AI is calling your functions but not extracting/passing the required parameters from the conversation.

---

## ✅ Solution: Proper Retell AI Function Configuration

### Step 1: Configure Functions in Retell Dashboard

Go to: https://app.retellai.com → Your Assistant → Functions

---

### Function 1: Search Knowledge Base

```json
{
  "name": "search_knowledge_base",
  "description": "Search the company's knowledge base for information about products, services, pricing, policies, or any customer questions. Use this FIRST before answering questions.",
  "url": "https://YOUR-DEPLOYMENT-URL.onrender.com/api/v1/nkiru/tools/search-knowledge-base",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The customer's question or search query. Be specific and include relevant context."
      },
      "clientId": {
        "type": "string",
        "description": "Optional client identifier for multi-tenant systems"
      }
    },
    "required": ["query"]
  },
  "speak_on_send": false,
  "speak_during_execution": true,
  "execution_message_description": "Let me search our knowledge base for that information..."
}
```

**✅ Test:**
```bash
curl -X POST https://your-app.onrender.com/api/v1/nkiru/tools/search-knowledge-base \
  -H "Content-Type: application/json" \
  -d '{"query": "What are your delivery charges?"}'
```

---

### Function 2: Create Support Ticket (CRITICAL - Read Carefully)

```json
{
  "name": "create_support_ticket",
  "description": "Create a support ticket when you cannot help the customer or they request human assistance. IMPORTANT: You MUST collect ALL required information from the customer BEFORE calling this function: their full name, email address, phone number, a brief subject, and detailed description of their issue.",
  "url": "https://YOUR-DEPLOYMENT-URL.onrender.com/api/v1/nkiru/tools/create-support-ticket",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "customer_name": {
        "type": "string",
        "description": "The customer's full name. REQUIRED. Ask: 'May I have your full name please?'"
      },
      "email": {
        "type": "string",
        "description": "The customer's email address. REQUIRED. Ask: 'What email address should we use to contact you?'"
      },
      "phoneNumber": {
        "type": "string",
        "description": "The customer's phone number. REQUIRED. Ask: 'What's the best phone number to reach you?'"
      },
      "subject": {
        "type": "string",
        "description": "Brief subject line summarizing the issue. REQUIRED. Summarize the customer's main concern in 5-10 words."
      },
      "description": {
        "type": "string",
        "description": "Detailed description of the customer's issue or request. REQUIRED. Include all relevant details from your conversation."
      }
    },
    "required": ["customer_name", "email", "phoneNumber", "subject", "description"]
  },
  "speak_on_send": false,
  "speak_during_execution": true,
  "execution_message_description": "Let me create that support ticket for you..."
}
```

**✅ Test:**
```bash
curl -X POST https://your-app.onrender.com/api/v1/nkiru/tools/create-support-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "subject": "Delivery inquiry for large order",
    "description": "Customer wants to know about bulk delivery pricing for 200kg of goods to Lagos"
  }'
```

---

## 🎯 Step 2: Update Assistant System Prompt

**CRITICAL**: Your assistant prompt must explicitly instruct the AI to collect information before calling functions.

### Recommended System Prompt:

```
You are a helpful and professional customer service assistant for [YOUR COMPANY NAME].

## YOUR CORE RESPONSIBILITIES:

1. **Answer Questions Using Knowledge Base**
   - ALWAYS use the search_knowledge_base function when customers ask about products, services, pricing, policies, or procedures
   - Search BEFORE answering - don't guess or make up information
   - If the knowledge base has no information, acknowledge it and offer to create a ticket

2. **Create Support Tickets When Needed**
   - Create tickets when:
     * You cannot find the answer in the knowledge base
     * The issue is complex and requires human expertise
     * Customer explicitly requests to speak with someone
     * The matter is urgent or sensitive
   
   - **BEFORE calling create_support_ticket, you MUST collect:**
     * Customer's full name
     * Email address
     * Phone number
     * Clear description of their issue
   
   - If customer doesn't provide all information, ASK for it:
     * "I'd be happy to create a support ticket. May I have your full name?"
     * "What email address should we use to contact you?"
     * "And what's the best phone number to reach you at?"

3. **Be Conversational and Natural**
   - Keep responses concise (1-2 sentences when possible)
   - Be friendly and empathetic
   - Don't mention function names to customers
   - Confirm information back to customers

## EXAMPLE CONVERSATIONS:

### Good Example - Knowledge Base Search:
Customer: "What are your delivery charges?"
You: [calls search_knowledge_base with query="delivery charges"]
You: "Our delivery charges are $50 per 20kg of goods. For orders over 100 pounds, we can provide custom pricing."

### Good Example - Creating Ticket:
Customer: "I need help with my order"
You: "I'd be happy to help you with that. Let me create a support ticket so our team can assist you personally. May I have your full name?"
Customer: "John Doe"
You: "Thank you, John. What email address should we use to contact you?"
Customer: "john@example.com"
You: "Great, and what's the best phone number to reach you?"
Customer: "+1234567890"
You: "Perfect. Can you describe the issue with your order?"
Customer: "My package hasn't arrived yet and it's been 2 weeks"
You: [calls create_support_ticket with all collected information]
You: "I've created support ticket #12345 for you. Our team will reach out within 24 hours to help track your package."

### Bad Example - Don't Do This:
Customer: "I need help"
You: [calls create_support_ticket with empty fields] ❌ NO! Collect information first!

## IMPORTANT RULES:

- NEVER call create_support_ticket without ALL required information
- ALWAYS search knowledge base before saying "I don't know"
- Keep your responses natural and conversational
- Don't use technical jargon or mention "functions" or "tools"
- If unsure, search the knowledge base or create a ticket

## TONE:
Professional, friendly, helpful, and efficient.
```

---

## 🧪 Step 3: Test Your Configuration

### Test 1: Knowledge Base Search

1. Call your assistant
2. Ask: "What are your delivery charges?"
3. **Expected**: AI searches knowledge base and provides answer
4. **Check logs**: Should see search_knowledge_base called

### Test 2: Ticket Creation (Full Flow)

1. Call your assistant
2. Say: "I need help with something complex"
3. **AI should ask** for your name
4. **Provide**: "John Doe"
5. **AI should ask** for email
6. **Provide**: "john@example.com"
7. **AI should ask** for phone
8. **Provide**: "+1234567890"
9. **AI should ask** about your issue
10. **Describe** your problem
11. **Expected**: AI creates ticket with all information
12. **Check logs**: Should see create_support_ticket with complete data

---

## 🔍 Debugging

### View Real-Time Logs on Render

```bash
# In Render dashboard → Your Service → Logs tab
# Or use Render CLI:
render logs --service your-service-name --tail
```

### What to Look For:

**✅ Good Log (Success):**
```json
{
  "message": "Tool Call: create_support_ticket",
  "customer_name": "John Doe",
  "email": "john@example.com",
  "subject": "Delivery inquiry",
  "hasDescription": true
}
```

**❌ Bad Log (Missing Data):**
```json
{
  "message": "Tool Call: create_support_ticket",
  "customer_name": "",
  "email": "",
  "missingFields": ["customer_name", "email", "phoneNumber", "subject", "description"]
}
```

---

## 🛠️ Common Issues & Fixes

### Issue 1: AI Calls Function Without Collecting Info

**Problem**: AI immediately calls create_support_ticket with empty fields

**Solution**: 
- Update system prompt to emphasize collecting info FIRST
- Add explicit examples in prompt
- Mark all fields as "required" in function parameters
- Add detailed parameter descriptions

---

### Issue 2: AI Doesn't Extract Information from Conversation

**Problem**: Customer provides info but AI doesn't pass it to function

**Solution**:
- Make parameter descriptions more explicit
- Use clearer field names (customer_name vs name)
- Add examples in system prompt
- Test with Retell AI's function testing tool

---

### Issue 3: Email Validation Fails

**Problem**: NKIRU API rejects email as invalid

**Solution**:
- In your prompt, tell AI to verify email format
- Example: "Please confirm your email address is john@example.com"

---

## 📋 Checklist Before Going Live

- [ ] Both functions configured in Retell dashboard
- [ ] URLs point to your deployed Render service
- [ ] System prompt emphasizes collecting information
- [ ] System prompt includes example conversations
- [ ] Tested knowledge base search with real questions
- [ ] Tested ticket creation with full conversation flow
- [ ] Checked logs show proper data being passed
- [ ] Confirmed tickets appear in NKIRU dashboard

---

## 🎯 Quick Fix for Current Issue

Your immediate problem is that Retell AI is NOT collecting customer information before calling create_support_ticket.

**Fix Now:**

1. **Go to Retell Dashboard** → Your Assistant → Functions
2. **Edit create_support_ticket function**
3. **Update the description** to:
   ```
   Create a support ticket ONLY AFTER collecting: customer's full name, email, phone number, issue subject, and detailed description. You MUST ask for each piece of information if not provided.
   ```
4. **Update your system prompt** with the example above
5. **Test again** - the AI should now ask for information first

---

## 💡 Pro Tips

1. **Be Explicit**: Retell AI needs VERY clear instructions about when and how to collect information
2. **Add Examples**: Show the AI exactly how a good conversation should flow
3. **Test Thoroughly**: Make multiple test calls with different scenarios
4. **Monitor Logs**: Watch your Render logs during test calls to see what data is being passed
5. **Iterate**: Adjust your prompt based on real conversation outcomes

---

**Need Help?** 
- Check Render logs for detailed error messages
- Test functions directly with curl to verify they work
- Review Retell AI documentation on custom functions
- Contact Retell AI support if AI behavior seems incorrect

