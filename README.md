# NKIRU Call Microservice

Voice Automation Microservice integrating Retell AI with NKIRU Platform for AI-powered customer support calls.

## Features

- ✅ Inbound and outbound voice calls via Retell AI
- ✅ RAG integration using NKIRU FAQs
- ✅ Human handoff with automatic ticket creation
- ✅ Call recording and transcript storage
- ✅ Real-time webhook processing

## Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Vector DB:** Pinecone (RAG)
- **Voice Platform:** Retell AI
- **Platform Integration:** NKIRU API

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+ (recommended) or npm 10+
- PostgreSQL 15+
- Pinecone account
- Retell AI account
- NKIRU API credentials

### Installation

1. **Install pnpm** (if you don't have it):

   ```bash
   # Using npm
   npm install -g pnpm

   # Using Homebrew (macOS)
   brew install pnpm

   # Using curl
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   ```

2. Clone the repository

```bash
git clone <repository-url>
cd NKIRU-call-micro
```

3. Install dependencies

```bash
pnpm install
```

4. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your credentials
```

5. Set up database

```bash
# Create PostgreSQL database
createdb nkiru_voice_automation

# Database tables will be created automatically on first run
```

6. **Set up Local Webhook Tunnel (ngrok)**
   To receive call events from Retell AI during local development, you need a public URL:

   ```bash
   # 1. Install ngrok (if not installed)
   brew install ngrok/ngrok/ngrok

   # 2. Add your authtoken (get it from https://dashboard.ngrok.com)
   ngrok config add-authtoken YOUR_TOKEN

   # 3. Start the tunnel on port 7720
   ngrok http 7720
   ```

   Copy the `Forwarding` URL (e.g., `https://a1b2.ngrok-free.app`) and:
   - Update `WEBHOOK_URL` in your `.env` to `https://a1b2.ngrok-free.app/webhooks/retell`
   - Register this URL in [Retell Dashboard](https://dashboard.retellai.com/webhooks).

7. **Set up Retell Assistant**
   Initialize or update your AI assistant with the NKIRU system prompt:

   ```bash
   pnpm setup:assistant
   ```

   _Note: If creating a new assistant, ensure you've set a valid `llm_id` in `scripts/setup-assistant.ts` and update your `.env` with the generated `RETELL_ASSISTANT_ID`, if youre updating an assitant please copy the agent id to the env , if youre creating a new one use comment out the agent id._

8. **Start development server**
   ```bash
   pnpm dev
   ```

## Project Structure

```
NKIRU-call-micro/
├── src/
│   ├── config/          # Configuration files
│   ├── services/        # Business logic services
│   │   ├── nkiru/       # NKIRU API integration
│   │   ├── retell/      # Retell AI integration
│   │   └── rag/         # RAG service
│   ├── routes/          # Express routes
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   └── index.ts         # Entry point
├── dist/                # Compiled JavaScript
├── tests/               # Test files
└── docs/                # Documentation
```

## Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking
- `pnpm setup:assistant` - Create or update Retell AI assistant configuration

**Note:** All scripts work with `pnpm`, `npm`, or `yarn`, but `pnpm` is recommended for better performance.

## Environment Variables

See `.env.example` for all required environment variables.

## Documentation

- **[MVP Plan](./docs/MVP_Plan.md)** - 4-week implementation plan and deliverables
- **[System Design & Action Plan](./docs/System_Design_Action_Plan.md)** - Complete system architecture, integration details, and day-by-day action plan
- **[Project Setup Guide](./PROJECT_SETUP.md)** - Detailed setup instructions

## API Documentation

API documentation will be available at `/api/docs` (when implemented).

## License

ISC

## Author

Farouk Adedamola
