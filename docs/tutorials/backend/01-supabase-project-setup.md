# B-01: Create Supabase Project & Configure Environment

> **Goal:** Set up your Supabase project, get your credentials, and configure all `.env` files.  
> **Time Estimate:** 30 minutes  
> **Prerequisites:** None — this is the first step.

---

## What You'll Learn

- What Supabase provides (Database, Auth, Storage, Realtime)
- How to create a Supabase project
- How environment variables connect your code to Supabase
- How to configure both frontend and backend `.env` files

---

## Step 1: Create a Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** and sign up (GitHub login works)
3. Click **"New Project"**
4. Fill in:
   - **Name:** `annotator-platform`
   - **Database Password:** Generate a strong one — **save this password somewhere safe!**
   - **Region:** Choose the closest to your users
   - **Plan:** Free tier is fine for development
5. Click **"Create new project"** and wait ~2 minutes for it to provision

---

## Step 2: Get Your Credentials

Once your project is ready, go to **Settings → API** in the Supabase dashboard.

You need these 4 values:

| Credential | Where to Find It | What It Does |
|-----------|------------------|--------------|
| **Project URL** | Settings → API → Project URL | Base URL for all Supabase API calls |
| **Anon Key** | Settings → API → Project API Keys → `anon` `public` | Public key for client-side calls (safe to expose) |
| **Service Role Key** | Settings → API → Project API Keys → `service_role` `secret` | **SECRET** — server-side only, bypasses Row Level Security |
| **Database URL** | Settings → Database → Connection string → URI | Direct PostgreSQL connection string |

> [!CAUTION]
> **NEVER expose `service_role` key in your frontend code.** It bypasses all security. It goes ONLY in the backend `.env`.

---

## Step 3: Configure Root `.env`

Create a `.env` file at the project root (`c:\data_base\.env`) by copying the example:

```bash
# In your terminal at c:\data_base
copy .env.example .env
```

Now edit `.env` with your real values:

```env
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database (get from Supabase → Settings → Database → Connection string)
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-DB-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# JWT (generate a random secret — you can use: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=paste-your-generated-secret-here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Supabase (get from Supabase → Settings → API)
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=eyJhbG...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your-service-role-key

# OAuth (skip for now, we'll set these up later)
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=
OAUTH_GITHUB_CLIENT_ID=
OAUTH_GITHUB_CLIENT_SECRET=

# Redis (optional — skip for now)
REDIS_URL=

# Email (optional — skip for now)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

### How to generate JWT_SECRET:

Open your terminal and run:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste it as your `JWT_SECRET`.

---

## Step 4: Configure Frontend `.env.local`

Create `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-anon-key
```

> [!NOTE]
> Next.js requires `NEXT_PUBLIC_` prefix for any env var that needs to be accessible in the browser.  
> Variables without this prefix are only available on the server side.

---

## Step 5: Configure Backend `.env`

Create `apps/backend/.env`:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-DB-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

JWT_SECRET=paste-your-generated-secret-here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=eyJhbG...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your-service-role-key
```

---

## Step 6: Verify `.gitignore`

Make sure `.env` files are **NOT** committed to git. Check your `.gitignore`:

```bash
# In root .gitignore, these should exist:
.env
.env.local
.env*.local
```

If they're missing, add them.

---

## Step 7: Verify Connection

To quickly test that your Supabase connection works, you can run this in your terminal:

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
);
supabase.from('_test').select('*').then(res => {
  console.log('Connection successful!', res.status);
}).catch(err => {
  console.error('Connection failed:', err.message);
});
"
```

You should see `Connection successful! 200` (even though the table doesn't exist, a 200 means the connection works).

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Project URL, Anon Key, Service Role Key, and Database URL saved
- [ ] Root `.env` configured
- [ ] `apps/frontend/.env.local` configured  
- [ ] `apps/backend/.env` configured
- [ ] `.gitignore` includes `.env` files
- [ ] Connection test passes

---

## What's Next?

→ [**B-02:** Run SQL Schemas & Verify Tables in Supabase](./02-database-schema-setup.md)
