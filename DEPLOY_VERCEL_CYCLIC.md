# 🚀 Deploy UniSync to Vercel + Cyclic + Supabase

This guide deploys your UniSync app with:
- **Frontend** → Vercel (React static files)
- **Backend** → Cyclic (Node.js API - FREE, no credit card!)
- **Database** → Supabase (PostgreSQL)

---

## Prerequisites

- GitHub account
- Vercel account (free)
- Cyclic account (free)
- Supabase account (free)

---

## Step 1: Push Code to GitHub

1. Go to [github.com](https://github.com) and create a new repository (e.g., `unisync`)
2. Push your code:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/unisync
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/unisync.git
git push -u origin main
```

---

## Step 2: Set Up Supabase (Database)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **"New project"**
3. Fill in details:
   - **Name:** unisync
   - **Database Password:** Copy and save this password!
   - **Region:** Choose one close to you
4. Wait for setup (~2 minutes)

5. In Supabase dashboard, go to **Settings** → **Database**
6. Copy the **Connection string** ( URI) - it looks like:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

---

## Step 3: Deploy Backend to Cyclic

1. Go to [cyclic.sh](https://cyclic.sh) and sign up with GitHub
2. Click **"Link Your Repository"**
3. Select your `unisync` repo
4. In the **Configure App** section:
   - **Root Directory:** `server`
   - **Build Command:** Leave empty (Cyclic auto-detects)
   - **Start Command:** `node server.js`
5. Click **Link**

6. Go to **Environment Variables** and add:
   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | `postgresql://postgres:Macnitosh%4012@db.rwqhkghyqupucjuonkoi.supabase.co:5432/postgres` |
   | `JWT_SECRET` | `unisync_secret` |
   | `PORT` | `3000` |

7. Wait for deployment to complete (~1-2 minutes)
8. Click **"View App"** to see your live backend
9. Copy your Cyclic URL (e.g., `https://unisync.cyclic.app`) - you'll need it for the frontend

**Note:** Cyclic will automatically detect and run `node server.js` from the server/ directory.

---

## Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"Add New..."** → **"Project"**
3. Select your `unisync` repo
4. In **Configure Project**:
   - **Framework Preset:** Vite (or Leave empty - Vercel auto-detects)
   - **Build Command:** `cd client && npm install && npm run build`
   - **Output Directory:** `client/dist`
5. Click **Deploy**

6. Once deployed, go to **Settings** → **Environment Variables** and add:
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | Your Cyclic URL (e.g., `https://unisync.cyclic.app`) |

7. **Important:** Go to **Settings** → **General** → **Build & Development Settings** and update:
   - **Development Command:** Leave empty
   - **Install Command:** `npm install`
   - **Build Command:** `cd client && npm install && npm run build`
   - **Output Directory:** `client/dist`

8. Redeploy (if needed) to apply environment variables

---

**Important Note:** When deploying to Cyclic:
- Only the `server/` folder is deployed (set Root Directory to `server`)
- Cyclic will handle API requests only
- Vercel handles the frontend and proxies API calls to Cyclic via `vercel.json` rewrites

---

## Step 5: Update Frontend API Calls

The React app uses relative API paths like `/api/auth/register`. We'll need to either:

**Option A (Recommended):** Use Vercel rewrites to proxy API calls to Cyclic

Create a `vercel.json` in the root directory:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://YOUR-CYCLIC-URL/api/:path*" },
    { "source": "/socket.io/:path*", "destination": "https://YOUR-CYCLIC-URL/socket.io/:path*" }
  ]
}
```

Replace `YOUR-CYCLIC-URL` with your actual Cyclic URL (without trailing slash).

**Option B:** Build the frontend with the API URL baked in

Add environment variable in Vercel:
- `VITE_API_URL` = Your Cyclic URL

Then update client code to use this variable. (Not needed if using vercel.json Option A)

---

## Step 6: Test Your Live App

1. Go to your Vercel URL (e.g., `https://unisync.vercel.app`)
2. Try to register/login
3. The API calls should hit your Glitch backend
4. Data should be stored in Supabase

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API calls fail | Check Vercel rewrites or ensure VITE_API_URL is correct |
| Database errors | Verify DATABASE_URL in Cyclic is correct |
| CORS errors | The backend already allows all origins (`cors()`) |
| Build fails | Check Vercel build logs |
| Socket.io issues | Ensure Vercel rewrites include /socket.io |

---

## Updating Your App

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Both Vercel (frontend) and Cyclic (backend) will automatically redeploy!

---

**Your app is now live with free hosting!** 🎉
