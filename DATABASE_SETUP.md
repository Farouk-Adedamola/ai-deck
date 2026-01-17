# Database Setup Guide for Beginners

This guide will help you set up PostgreSQL database for the NKIRU Call Microservice.

## Step 1: Install PostgreSQL

### macOS (using Homebrew - Recommended)

1. **Install Homebrew** (if you don't have it):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install PostgreSQL**:
   ```bash
   brew install postgresql@15
   ```

3. **Start PostgreSQL service**:
   ```bash
   brew services start postgresql@15
   ```

### Alternative: macOS (using Postgres.app)

1. Download Postgres.app from: https://postgresapp.com/
2. Install and open the app
3. Click "Initialize" to create a new server

### Windows

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Follow the installation wizard
4. Remember the password you set for the `postgres` user
5. PostgreSQL will start automatically as a service

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Verify PostgreSQL Installation

Open your terminal and run:

```bash
psql --version
```

You should see something like: `psql (PostgreSQL) 15.x`

## Step 3: Create Database User (Optional but Recommended)

### macOS/Linux:

```bash
# Switch to postgres user
sudo -u postgres psql

# Or if using Homebrew on macOS:
psql postgres
```

Then in the PostgreSQL prompt:

```sql
-- Create a new user (replace 'your_username' and 'your_password' with your choice)
CREATE USER your_username WITH PASSWORD 'your_password';

-- Grant privileges
ALTER USER your_username CREATEDB;

-- Exit
\q
```

### Windows:

1. Open "SQL Shell (psql)" from Start Menu
2. Press Enter for all defaults (or enter your postgres password)
3. Run the same SQL commands above

## Step 4: Create the Database

### Option A: Using Command Line (macOS/Linux)

```bash
# Using createdb command
createdb nkiru_voice_automation

# Or if you need to specify user:
createdb -U your_username nkiru_voice_automation
```

### Option B: Using psql

```bash
# Connect to PostgreSQL
psql postgres

# Or with username:
psql -U your_username postgres
```

Then in the PostgreSQL prompt:

```sql
-- Create database
CREATE DATABASE nkiru_voice_automation;

-- Connect to the new database
\c nkiru_voice_automation

-- Exit
\q
```

### Option C: Windows (using pgAdmin)

1. Open pgAdmin (installed with PostgreSQL)
2. Right-click on "Databases" → "Create" → "Database"
3. Name: `nkiru_voice_automation`
4. Click "Save"

## Step 5: Update Your .env File

Open `.env` file in the project root and update the `DATABASE_URL`:

### If you created a custom user:
```bash
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/nkiru_voice_automation
```

### If using default postgres user:
```bash
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/nkiru_voice_automation
```

### Format Explanation:
```
postgresql://[username]:[password]@[host]:[port]/[database_name]
```

**Example:**
```bash
DATABASE_URL=postgresql://john:secret123@localhost:5432/nkiru_voice_automation
```

## Step 6: Test Database Connection

The database tables will be created automatically when you start the application for the first time!

But you can test the connection manually:

```bash
# Connect to your database
psql nkiru_voice_automation

# Or with username:
psql -U your_username nkiru_voice_automation
```

If you see a prompt like `nkiru_voice_automation=#`, you're connected! Type `\q` to exit.

## Step 7: Verify Tables Are Created

When you run the application for the first time (`npm run dev`), it will automatically create these tables:

- `calls` - Stores call records
- `call_events` - Stores call events
- `nkiru_faqs` - Stores cached FAQs
- `service_config` - Stores service configuration

To verify tables were created:

```bash
psql nkiru_voice_automation

# List all tables
\dt

# View a table structure
\d calls

# Exit
\q
```

## Common Issues & Solutions

### Issue 1: "psql: command not found"

**Solution:** Add PostgreSQL to your PATH:

**macOS (Homebrew):**
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Windows:** PostgreSQL should be in PATH automatically. If not, add:
`C:\Program Files\PostgreSQL\15\bin` to your PATH environment variable.

### Issue 2: "password authentication failed"

**Solution:** 
- Check your password in `.env` file
- Try resetting the postgres password:
  ```bash
  psql postgres
  ALTER USER postgres PASSWORD 'new_password';
  ```

### Issue 3: "database does not exist"

**Solution:** Make sure you created the database:
```bash
createdb nkiru_voice_automation
```

### Issue 4: "connection refused"

**Solution:** Make sure PostgreSQL is running:

**macOS (Homebrew):**
```bash
brew services start postgresql@15
```

**Windows:** Check Services → PostgreSQL should be running

**Linux:**
```bash
sudo systemctl start postgresql
```

## Quick Reference Commands

```bash
# Start PostgreSQL (macOS Homebrew)
brew services start postgresql@15

# Stop PostgreSQL (macOS Homebrew)
brew services stop postgresql@15

# Connect to database
psql nkiru_voice_automation

# List all databases
psql -l

# Drop database (if you need to start over)
dropdb nkiru_voice_automation

# Create database again
createdb nkiru_voice_automation
```

## Next Steps

Once your database is set up:

1. ✅ Database created
2. ✅ `.env` file updated with `DATABASE_URL`
3. ✅ Run `npm install` (if you haven't already)
4. ✅ Run `npm run dev` - Tables will be created automatically!

## Need Help?

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Check the application logs if tables aren't being created
- Make sure your `.env` file has the correct `DATABASE_URL`

---

**Note:** The application will automatically create all necessary tables when it starts for the first time. You don't need to run SQL scripts manually!

