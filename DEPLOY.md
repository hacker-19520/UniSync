# 🚀 Deploy UniSync to Render (Free Hosting)

This guide will deploy your UniSync app to **Render.com** with a **persistent SQLite database** that survives server restarts.

---

## Step 1: Push Code to GitHub

1. Go to [github.com](https://github.com) and create a new repository (e.g., `unisync`)
2. Push your code:

```bash
cd /Users/ahmad/Desktop/unisync
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/unisync.git
git push -u origin main
```

---

## Step 2: Create Render Account

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account and select the `unisync` repo
4. Render will auto-detect the `render.yaml` file

---

## Step 3: Configure Environment Variables

After the blueprint is detected, add these in the Render dashboard:

| Variable | Value | Required? |
|----------|-------|-----------|
| `JWT_SECRET` | Auto-generated | ✅ Yes |
| `DB_PATH` | `/opt/render/project/src/server/data/database.sqlite` | ✅ Yes |
| `SMTP_USER` | Your Gmail address | ❌ Optional |
| `SMTP_PASS` | Your Gmail App Password | ❌ Optional |
| `SMTP_FROM` | `UniSync <noreply@unisync.com>` | ❌ Optional |

> **Note:** If you don't add SMTP credentials, OTP codes will be printed in the server logs (check Render logs to see them).

---

## Step 4: Add Persistent Disk

1. In your Render dashboard, go to your **UniSync service**
2. Click **"Disks"** tab
3. The disk is already configured in `render.yaml`:
   - **Name:** `unisync-data`
   - **Mount Path:** `/opt/render/project/src/server/data`
   - **Size:** 1 GB (free tier)

This ensures your SQLite database persists across deployments.

---

## Step 5: Deploy

1. Click **"Create Blueprint"**
2. Render will:
   - Install server dependencies
   - Build the React frontend
   - Start the Node.js server
   - Mount the persistent disk
3. Wait for the build to complete (~2-3 minutes)

---

## Step 6: Access Your Live App

Once deployed, Render will give you a URL like:

```
https://unisync.onrender.com
```

Your app is now live with:
- ✅ Frontend (React) served from the same server
- ✅ Backend API running
- ✅ SQLite database on persistent disk
- ✅ Free SSL certificate

---

## Updating Your App

Whenever you push changes to GitHub:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will **automatically redeploy** your app!

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database resets on deploy | Check that `DB_PATH` env var is set and disk is mounted |
| Build fails | Check Render logs for npm install errors |
| OTP not sending | Without SMTP, check Render logs for mock OTP codes |
| CORS errors | The server already allows all origins (`cors()`) |

---

## Alternative: Turso (SQLite Cloud)

If you prefer a dedicated cloud database instead of Render's disk:

1. Sign up at [turso.tech](https://turso.tech)
2. Create a database: `turso db create unisync`
3. Get the connection URL: `turso db show unisync --url`
4. Install the client: `npm install @libsql/client`
5. Replace `sqlite3` with `@libsql/client` in `database.js`

---

**Your app will stay online 24/7 on Render's free tier!** 🎉

