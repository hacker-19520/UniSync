# Deploy UniSync to Render (Step by Step)

## Step 1: Push Code to GitHub

If you haven't already:

1. Go to https://github.com and create repo named `unisync`
2. Run these commands in your project folder:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/unisync.git
git push -u origin main
```

---

## Step 2: Create Render Account

1. Go to https://render.com
2. Click **"Sign Up"** → use your **GitHub** account
3. Verify your email

---

## Step 3: Deploy Using Blueprint

1. In Render dashboard, click **"New +"** (blue button top right)
2. Select **"Blueprint"**
3. Click **"Connect"** beside your GitHub account
4. Select your `unisync` repository
5. Click **"Apply Blueprint"**

---

## Step 4: Add Environment Variables

After deployment starts, you'll need to add:

1. Click on your `unisync` service (in the dashboard)
2. Go to **"Environment"** tab
3. Add these variables:

| Key | Value |
|----|-------|
| `DATABASE_URL` | `postgresql://postgres:Macnitosh%4012@db.rwqhkghyqupucjuonkoi.supabase.co:5432/postgres` |
| `PORT` | `10000` |
| `JWT_SECRET` | (leave empty - Render auto-generates) |

4. Click **"Save Changes"**

---

## Step 5: Wait for Deploy

1. Go to **"Logs"** tab to watch progress
2. Wait for green "Deploy complete" message
3. Click the URL in the dashboard (e.g., `https://unisync.onrender.com`)

---

## Step 6: Deploy Frontend to Vercel (Separate)

If you want the frontend on Vercel (faster, better caching):

1. Go to https://vercel.com and sign up with GitHub
2. Click **"Add New..."** → **"Project"**
3. Select your `unisync` repository
4. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | Your Render URL (e.g., `https://unisync.onrender.com`) |
6. Click **"Deploy"**

---

## Step 7: Update Vercel Rewrites (If Using API Proxy)

In your Vercel project settings, add a rewrite to proxy API calls:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://unisync.onrender.com/api/$1" }
  ]
}
```

Alternatively, update your client's API base URL to point directly to Render.

---

## Troubleshooting

- **Build fails?** Check the logs - common issue is missing packages
- **Database error?** Verify DATABASE_URL is correct (no quotes)
- **App sleeps?** Free tier sleeps after 15 min - this is normal

---

**Your app will be live at something like https://unisync.onrender.com**
