# NKIRU Voice Automation System Design & Action Plan
## Microservice Architecture with NKIRU Platform Integration

**Prepared by:** Farouk Adedamola  
**Date:** January 5, 2026  
**Timeline:** 4 Weeks  
**Architecture:** Microservice (Standalone Backend)  
**Stack:** Node.js + Express + TypeScript + Retell AI + NKIRU API Integration

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [NKIRU API Integration Analysis](#nkiru-api-integration-analysis)
3. [Data Flow & Integration Points](#data-flow--integration-points)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [API Endpoints Design](#api-endpoints-design)
7. [4-Week Action Plan](#4-week-action-plan)
8. [NKIRU API Requirements Documentation](#nkiru-api-requirements-documentation)

---

## System Architecture Overview

### Architecture Pattern: Microservice

The Voice Automation service operates as a **standalone microservice** that integrates with:
- **Retell AI** - Voice call handling and AI assistant
- **NKIRU Platform** - FAQ knowledge base and ticket management
- **Internal Services** - RAG, call management, storage

```
┌─────────────────────────────────────────────────────────────┐
│                    Voice Automation Service                  │
│                  (Node.js + Express + TS)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │ Retell AI    │    │ NKIRU API    │    │ Internal      │ │
│  │ Integration  │    │ Integration  │    │ Services      │ │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘ │
│         │                    │                    │         │
│         │                    │                    │         │
│  ┌──────▼───────────────────▼───────────────────▼───────┐ │
│  │           Core Service Layer                            │ │
│  │  • Call Manager  • RAG Service  • Handoff Service      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Database Layer                              │ │
│  │  • PostgreSQL (Calls, Config)  • Pinecone (RAG)         │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Retell AI Service** - Voice call orchestration
2. **NKIRU API Client** - FAQ retrieval and ticket creation
3. **RAG Service** - Knowledge base search using NKIRU FAQs
4. **Handoff Service** - Ticket creation and human escalation
5. **Call Manager** - Call lifecycle management
6. **Webhook Handler** - Real-time event processing

---

## NKIRU API Integration Analysis

### Required Integrations

#### 1. **FAQ Integration** (Primary - RAG Knowledge Base)
**Purpose:** Populate RAG knowledge base with NKIRU FAQs for AI responses

**API Endpoints:**
- `GET /faq` - Retrieve client FAQs
- `POST /faq` - Add/Update FAQs (optional for MVP)

**Integration Flow:**
```
Voice Call → User Query → RAG Search → NKIRU FAQ API → Return Answer
```

**Data Needed:**
- Client FAQs (question/answer pairs)
- Client ID for scoping
- API Key for authentication

**Implementation:**
- Fetch FAQs on service startup (cache)
- Periodic sync (every 24 hours or on-demand)
- Use FAQs to populate Pinecone vector database
- Search FAQs during RAG queries

#### 2. **Ticket Creation** (Primary - Human Handoff)
**Purpose:** Create support tickets when AI cannot resolve or user requests human

**API Endpoints:**
- `POST /tickets/create` - Create ticket
- `POST /tickets/add/comment/{ticketId}` - Add comment
- `POST /tickets/close/{ticketId}` - Close ticket
- `GET /tickets/{ticketId}` - Get ticket details

**Integration Flow:**
```
Handoff Trigger → Generate Summary → Create Ticket → Return Ticket ID
```

**Data Needed:**
- Customer information (name, email, phone)
- Call context (transcript, summary)
- Issue description
- Category classification

**Implementation:**
- Trigger on handoff function call
- Generate ticket from call transcript
- Include call recording URL (if available)
- Link ticket to call record

#### 3. **File Upload** (Secondary - Call Recordings)
**Purpose:** Upload call recordings to NKIRU storage

**API Endpoints:**
- `POST /media-upload/file-upload` - Upload file
- `POST /media-upload/get-file` - Retrieve file URL

**Implementation:**
- Upload call recordings after call ends
- Store file key in ticket when creating
- Optional for MVP (can defer)

---

## Data Flow & Integration Points

### Flow 1: Inbound Call with FAQ Query

```
1. Inbound Call → Retell AI
2. Retell AI → Webhook (call_started)
3. User asks question → Retell AI processes
4. Retell AI → Function Call (search_knowledge_base)
5. Voice Service → RAG Service
6. RAG Service → Pinecone Search (using NKIRU FAQs)
7. RAG Service → Return answer
8. Retell AI → Speak answer to user
9. Call ends → Store transcript & recording
```

### Flow 2: Human Handoff with Ticket Creation

```
1. User requests human OR AI detects need
2. Retell AI → Function Call (request_human_handoff)
3. Voice Service → Handoff Service
4. Handoff Service → Generate call summary
5. Handoff Service → NKIRU API (POST /tickets/create)
   - Include: customer info, transcript, summary, category
6. NKIRU API → Returns ticket ID
7. Handoff Service → Store ticket ID in call record
8. Retell AI → Inform user ticket created
9. Call ends → Store artifacts
```

### Flow 3: FAQ Sync (Background Job)

```
1. Scheduled Job (Daily) → NKIRU API Client
2. NKIRU API Client → GET /faq (with API key)
3. NKIRU API → Returns FAQs array
4. NKIRU API Client → Process FAQs
5. RAG Service → Generate embeddings
6. RAG Service → Update Pinecone index
7. Log sync status
```

---

## Technology Stack

### Core Stack
- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL 15+
- **Vector DB:** Pinecone (RAG)

### External Services
- **Voice Platform:** Retell AI
- **Platform Integration:** NKIRU API
- **Storage:** AWS S3 (or NKIRU S3 via API)

### Development Tools
- **Package Manager:** npm/yarn
- **Testing:** Jest + Supertest
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript
- **API Client:** Axios
- **Environment:** dotenv

---

## Database Schema

### Calls Table
```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retell_call_id VARCHAR(255) UNIQUE NOT NULL,
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  phone_number VARCHAR(20),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'initiated',
  assistant_id VARCHAR(255),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration INTEGER,
  recording_url TEXT,
  transcript TEXT,
  summary TEXT,
  handoff_requested BOOLEAN DEFAULT FALSE,
  handoff_reason TEXT,
  nkiru_ticket_id VARCHAR(255),
  nkiru_ticket_number VARCHAR(100),
  client_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Call Events Table
```sql
CREATE TABLE call_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  occurred_at TIMESTAMP DEFAULT NOW()
);
```

### FAQ Cache Table (NKIRU FAQs)
```sql
CREATE TABLE nkiru_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nkiru_faq_id VARCHAR(255) UNIQUE NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  embedding_id VARCHAR(255),
  last_synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nkiru_faqs_client_id ON nkiru_faqs(client_id);
CREATE INDEX idx_nkiru_faqs_synced ON nkiru_faqs(last_synced_at);
```

---

## API Endpoints Design

### Voice Service Endpoints

#### Call Management
```
POST   /api/v1/calls/outbound          # Initiate outbound call
GET    /api/v1/calls                    # List calls
GET    /api/v1/calls/:id                # Get call details
GET    /api/v1/calls/:id/transcript     # Get transcript
GET    /api/v1/calls/:id/artifacts      # Get all artifacts
```

#### Webhooks
```
POST   /webhooks/retell                 # Retell AI webhooks
```

#### NKIRU Integration
```
POST   /api/v1/nkiru/faqs/sync          # Manual FAQ sync
GET    /api/v1/nkiru/faqs               # Get cached FAQs
GET    /api/v1/nkiru/tickets/:ticketId  # Get ticket details
```

#### Health & Monitoring
```
GET    /health                          # Health check
GET    /metrics                         # Basic metrics
```

---

## 4-Week Action Plan

See detailed day-by-day breakdown in the document. Key milestones:

### Week 1: Foundation & NKIRU Integration Setup
- Project setup & NKIRU API client
- Database setup & FAQ integration
- Retell AI integration & RAG setup

### Week 2: Core Voice Features & Webhooks
- Assistant configuration & function calling
- Webhook handler implementation
- Call management & RAG integration

### Week 3: Handoff Integration & Ticket Creation
- Ticket service implementation
- Handoff service implementation
- Call artifact storage

### Week 4: Testing, Validation & Documentation
- Integration testing
- Nigerian English validation
- Monitoring & FAQ sync automation
- Documentation & deployment prep

---

## NKIRU API Requirements Documentation

### Required from NKIRU Platform

#### 1. API Credentials
- Production API Key
- Staging API Key (provided)
- Client ID
- Base URLs (Production & Staging)

#### 2. FAQ Access
**Endpoint:** `GET /faq`

**Authentication:** `X-API-Key: <api-key>` or `Authorization: Bearer <jwt-token>`

**Usage:**
- Fetch FAQs on service startup
- Sync daily (background job)
- Use for RAG knowledge base
- Scope by `clientId`

#### 3. Ticket Creation
**Endpoint:** `POST /tickets/create`

**Usage:**
- Create ticket on handoff request
- Include call transcript as description
- Include call recording URL (if available)
- Link ticket ID to call record

### Integration Patterns

#### Pattern 1: FAQ Sync (Background Job)
```typescript
async function syncFAQs() {
  const faqs = await nkiruClient.getFAQs(clientId);
  // Process and store in database
  // Generate embeddings
  // Update Pinecone index
}
```

#### Pattern 2: Ticket Creation on Handoff
```typescript
async function handleHandoff(callId: string) {
  const call = await getCall(callId);
  const summary = await generateSummary(call.transcript);
  
  const ticket = await nkiruClient.createTicket({
    customerName: call.customerName,
    email: call.customerEmail,
    phoneNumber: call.phoneNumber,
    subject: `Voice Call Support - ${call.retellCallId}`,
    description: summary,
    category: classifyCategory(call.transcript)
  });
  
  await updateCall(callId, { nkiruTicketId: ticket._id });
  return ticket;
}
```

### Error Handling

**NKIRU API Errors:**
- 401 Unauthorized - Invalid API key
- 404 Not Found - Resource not found
- 500 Server Error - Retry with exponential backoff

**Implementation:**
- Retry logic for transient failures
- Fallback to cached FAQs if API unavailable
- Log all API errors
- Alert on repeated failures

---

## Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=development

# Retell AI
RETELL_API_KEY=your_retell_api_key
RETELL_ASSISTANT_ID=your_assistant_id

# NKIRU API
NKIRU_API_BASE_URL=https://stage-api.withnkiru.com
NKIRU_API_KEY=your_nkiru_api_key
NKIRU_CLIENT_ID=your_client_id

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/voice_automation

# Pinecone (RAG)
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=nkiru-faqs
PINECONE_ENVIRONMENT=us-east1-gcp

# OpenAI (Embeddings)
OPENAI_API_KEY=your_openai_key

# Webhook
WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_URL=https://your-domain.com/webhooks/retell

# Logging
LOG_LEVEL=info
```

---

## Success Checklist

### Week 1
- [ ] Project structure created
- [ ] NKIRU API client implemented
- [ ] FAQs fetched and stored
- [ ] RAG service with Pinecone working
- [ ] Retell AI client integrated

### Week 2
- [ ] Assistant configured with functions
- [ ] Webhook handler implemented
- [ ] Inbound/outbound calls working
- [ ] RAG queries returning FAQ answers

### Week 3
- [ ] Ticket service implemented
- [ ] Handoff creates tickets in NKIRU
- [ ] Call artifacts stored
- [ ] End-to-end handoff flow working

### Week 4
- [ ] All tests passing
- [ ] Nigerian English validated
- [ ] FAQ sync automated
- [ ] Documentation complete
- [ ] Ready for deployment

---

## Next Steps After MVP

1. **Multi-tenancy** - Support multiple NKIRU clients
2. **Advanced Analytics** - Call analytics dashboard
3. **Ticket Updates** - Real-time ticket status sync
4. **File Upload** - Upload call recordings to NKIRU
5. **Agent Integration** - Direct agent handoff via NKIRU

---

**Document Version:** 1.0  
**Last Updated:** January 5, 2026  
**Status:** Ready for Implementation

