# Deployment Guide — Railway (Backend) + Vercel (Frontend)

Both platforms are **free** and have GitHub integration so every push auto-deploys.

---

## Part 1 — Deploy the Backend on Railway

### Step 1 — Create a Railway account
1. Go to [railway.app](https://railway.app) and sign up with GitHub.

### Step 2 — Create a new project
1. Click **New Project** → **Deploy from GitHub repo**.
2. Select the **FinanceTracker** repository.
3. Railway will detect the `Procfile` and start building automatically.

### Step 3 — Add a PostgreSQL database
1. In your Railway project dashboard, click **+ New** → **Database** → **PostgreSQL**.
2. Railway will create a database and automatically add a `DATABASE_URL` environment variable to your project. You don't need to configure this manually.

### Step 4 — Set environment variables
In the Railway project, go to your service → **Variables** tab and add:

| Variable | Value |
|---|---|
| `SECRET_KEY` | Generate one at https://djecrety.ir/ |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `your-app-name.up.railway.app` (Railway gives you this domain) |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` (add after Step 6) |
| `OPENAI_API_KEY` | Your OpenAI key (required for AI chat feature) |

> `DATABASE_URL` is set automatically by Railway — do **not** add it manually.

### Step 5 — Get your backend URL
Once the deploy finishes, Railway shows your URL (e.g. `https://financetracker-production.up.railway.app`).
Test it by visiting `https://your-url.up.railway.app/api/schema/swagger-ui/` — you should see the API docs.

---

## Part 2 — Deploy the Frontend on Vercel

### Step 6 — Create a Vercel account
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub.

### Step 7 — Import the project
1. Click **Add New** → **Project**.
2. Import the **FinanceTracker** repository.
3. When prompted for **Root Directory**, set it to `finance-tracker-frontend`.
4. Vercel will auto-detect that it's a Next.js project.

### Step 8 — Set environment variables
In Vercel project settings → **Environment Variables**, add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-url.up.railway.app/api` |

### Step 9 — Deploy
Click **Deploy**. Vercel will build and host the frontend.
Your app will be live at `https://your-app.vercel.app`.

---

## Part 3 — Final wiring

After both are deployed:
1. Copy your Vercel URL (e.g. `https://financetracker.vercel.app`).
2. Go back to Railway → **Variables** → update `CORS_ALLOWED_ORIGINS` to include your Vercel URL.
3. Railway will re-deploy automatically.

---

## Summary of free tiers

| Service | What it provides | Free limit |
|---|---|---|
| Railway | Django backend + auto-deploy | 5 USD/month credit (~500 hrs) |
| Railway PostgreSQL | Managed database | Included in credit |
| Vercel | Next.js frontend + auto-deploy | Unlimited for personal projects |

---

## Local development (no change needed)

The app still works locally exactly as before. Just run:

```bash
# Backend
python manage.py runserver

# Frontend (in finance-tracker-frontend/)
npm run dev
```

The frontend reads `NEXT_PUBLIC_API_URL` from `finance-tracker-frontend/.env.local` if it exists,
and falls back to `http://127.0.0.1:8000/api` — so local dev works without any extra config.
