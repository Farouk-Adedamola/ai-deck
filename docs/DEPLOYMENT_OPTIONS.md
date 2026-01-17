# Alternative Deployment Options

Railway removed their free tier. Here are the best alternatives:

---

## 🆓 Option 1: Render (RECOMMENDED)

**Best for**: Production-ready apps with database

### Pros:
- ✅ Free PostgreSQL database included
- ✅ Easy setup, auto-deploy from GitHub
- ✅ Good documentation
- ✅ 750 hours/month free

### Cons:
- ⚠️ Cold starts after 15 mins inactivity
- ⚠️ Database deleted after 90 days inactivity

### Setup:
See `docs/DEPLOY_RENDER.md` for full guide.

**Quick Start:**
1. Push code to GitHub
2. Connect repo to Render
3. Add PostgreSQL database
4. Set environment variables
5. Deploy!

**URL**: https://render.com

---

## 🚀 Option 2: Fly.io

**Best for**: Low latency, stays warm longer

### Pros:
- ✅ More generous free tier (3 VMs)
- ✅ No cold starts (stays warm)
- ✅ Better for global apps
- ✅ Can attach external database

### Cons:
- ⚠️ No free database (must use external)
- ⚠️ Slightly more complex setup

### Setup:

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Set secrets
fly secrets set DATABASE_URL="your_database_url"
fly secrets set PINECONE_API_KEY="your_key"
fly secrets set OPENAI_API_KEY="your_key"
fly secrets set RETELL_API_KEY="your_key"
fly secrets set NKIRU_API_KEY="your_key"

# Deploy
fly deploy
```

**Database Options for Fly.io:**
1. **Neon** (free tier): https://neon.tech
2. **Supabase** (free tier): https://supabase.com
3. **PlanetScale** (free tier): https://planetscale.com

**URL**: https://fly.io

---

## ☁️ Option 3: Google Cloud Run

**Best for**: Pay-as-you-go, scales to zero

### Pros:
- ✅ Only pay for actual usage
- ✅ Scales automatically
- ✅ Very generous free tier (2M requests/month)
- ✅ No cold start limits

### Cons:
- ⚠️ More complex setup
- ⚠️ Need Google Cloud account
- ⚠️ No free database (use external)

### Setup:

```bash
# Install gcloud CLI
# See: https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Create Dockerfile (we'll do this below)
# Build and deploy
gcloud run deploy nkiru-call-service \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

**URL**: https://cloud.google.com/run

---

## 🟦 Option 4: Azure Container Apps

**Best for**: Enterprise, existing Azure users

### Pros:
- ✅ $200 free credits
- ✅ Scales well
- ✅ Good for enterprise

### Cons:
- ⚠️ Complex setup
- ⚠️ Credits expire after 30 days
- ⚠️ Overkill for small projects

**URL**: https://azure.microsoft.com/en-us/products/container-apps

---

## 🔵 Option 5: DigitalOcean App Platform

**Best for**: Simple deployment with managed database

### Pros:
- ✅ $200 free credits (60 days)
- ✅ Managed PostgreSQL available
- ✅ Simple interface
- ✅ Good documentation

### Cons:
- ⚠️ Free credits expire
- ⚠️ Database costs ~$7/month after credits

### Setup:
1. Sign up at https://www.digitalocean.com
2. Create new app from GitHub
3. Add managed PostgreSQL ($7/month, or use free credits)
4. Configure environment variables
5. Deploy

**URL**: https://www.digitalocean.com/products/app-platform

---

## 🐳 Option 6: Self-Host (Always Free)

**Best for**: You have a spare server/VPS

### Options:
1. **Home Server** (Raspberry Pi, old laptop)
2. **Oracle Cloud Free Tier** (2 VMs forever free)
3. **AWS EC2 Free Tier** (12 months)
4. **Google Cloud Free Tier** (3 months)

### Requirements:
- Docker installed
- Public IP or ngrok tunnel
- Basic Linux knowledge

### Quick Setup with Docker:

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/nkiru-call-micro.git
cd nkiru-call-micro

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "7720:7720"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/nkiru_db
      - PINECONE_API_KEY=${PINECONE_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - RETELL_API_KEY=${RETELL_API_KEY}
      - NKIRU_API_KEY=${NKIRU_API_KEY}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=nkiru_db
      - POSTGRES_PASSWORD=password
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy app files
COPY . .

# Generate Prisma client
RUN pnpm prisma:generate

# Build TypeScript
RUN pnpm build

# Expose port
EXPOSE 7720

# Start app
CMD ["pnpm", "start"]
EOF

# Create .env file
cp .env.example .env
# Edit .env with your values

# Start services
docker-compose up -d
```

---

## 📊 Comparison Table

| Platform | Free Tier | Database | Cold Starts | Difficulty |
|----------|-----------|----------|-------------|------------|
| **Render** | ✅ 750hrs | ✅ Free (90d) | ⚠️ Yes (15min) | ⭐ Easy |
| **Fly.io** | ✅ 3 VMs | ❌ External only | ✅ No | ⭐⭐ Medium |
| **Cloud Run** | ✅ 2M reqs | ❌ External only | ⚠️ Yes | ⭐⭐⭐ Hard |
| **Railway** | ❌ Paid only | ✅ Included | ✅ No | ⭐ Easy |
| **DigitalOcean** | ✅ $200 (60d) | ⚠️ $7/mo | ✅ No | ⭐⭐ Medium |
| **Self-Host** | ✅ Always free | ✅ You control | ✅ No | ⭐⭐⭐ Hard |

---

## 🎯 Recommendation

### For You: Start with **Render** 🏆

**Why:**
1. ✅ Completely free (no credit card needed)
2. ✅ Free PostgreSQL database included
3. ✅ Easiest setup (similar to Railway)
4. ✅ Auto-deploys from GitHub
5. ✅ Good for development/testing

**Upgrade Path:**
- Start on Render free tier
- If cold starts become an issue:
  - Set up cron job to keep it warm (free)
  - OR upgrade to Render paid ($7/month) - no cold starts
  - OR migrate to Fly.io (more generous free tier)

---

## 🔗 External Database Options (If Needed)

If you choose Fly.io or Cloud Run, use one of these free databases:

### 1. **Neon** (Recommended)
- Free tier: 10 GB storage
- Serverless PostgreSQL
- No cold starts
- https://neon.tech

### 2. **Supabase**
- Free tier: 500 MB database
- Includes auth, storage, real-time
- https://supabase.com

### 3. **PlanetScale**
- Free tier: 5 GB storage
- MySQL (not PostgreSQL)
- Would need to adjust Prisma schema
- https://planetscale.com

### 4. **ElephantSQL**
- Free tier: 20 MB (very small!)
- PostgreSQL
- https://www.elephantsql.com

---

## 📝 Next Steps

1. **Choose a platform** (Render recommended)
2. **Follow the deployment guide**:
   - Render: `docs/DEPLOY_RENDER.md`
   - Fly.io: See Option 2 above
3. **Test your deployment**
4. **Configure Retell AI** with your new URL
5. **Make your first call!** 🎉
