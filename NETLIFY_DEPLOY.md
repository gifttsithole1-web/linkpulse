# Deploy LinkPulse on Netlify

This project’s **production app** is the Next.js site in `frontend/`. It talks to **Firebase Firestore** (not the Laravel `api/` folder on Netlify). Netlify runs the site and serverless handlers for `/api/*` and server actions.

## Prerequisites

- Git repo pushed to GitHub, GitLab, or Bitbucket
- [Netlify](https://www.netlify.com/) account
- Firebase project with Firestore enabled
- Firebase service account JSON (for `FIREBASE_ADMIN_SERVICE_ACCOUNT_B64`)
- Brevo API key (optional, for email)

## 1. Connect the site

1. Netlify → **Add new site** → **Import an existing project**
2. Pick your repository
3. Build settings (auto-read from `netlify.toml` at repo root):
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Plugin:** `@netlify/plugin-nextjs` (already in `frontend/package.json`)

4. Deploy once (it will fail until env vars are set — that’s expected).

## 2. Environment variables

In **Site configuration → Environment variables**, add:

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_APP_URL` | Yes | Public site URL, e.g. `https://your-site.netlify.app` or custom domain (no trailing slash). Used for QR codes. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Usually `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase web app ID |
| `FIREBASE_ADMIN_SERVICE_ACCOUNT_B64` | Yes | Base64 of the **entire** service account JSON file (see below) |
| `BREVO_API_KEY` | For email | `xkeysib-...` from Brevo |
| `BREVO_SENDER_EMAIL` | For email | Verified sender in Brevo |
| `BREVO_SENDER_NAME` | Optional | e.g. `Beamlink` |

**Encode service account (PowerShell):**

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\serviceAccountKey.json"))
```

Paste the single-line output into `FIREBASE_ADMIN_SERVICE_ACCOUNT_B64`.

**Scopes:** Use **All scopes** (or at least Production) for these variables. Redeploy after saving.

## 3. Firebase console

1. **Authentication → Settings → Authorized domains**  
   Add:
   - `your-site.netlify.app`
   - Your custom domain when you add one

2. **Firestore rules**  
   Deploy from your machine (not Netlify):

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

   (Run from the folder that contains `firestore.rules`, if you have one in the repo.)

3. **QR landing**  
   After deploy, open `https://YOUR_SITE/qr` and test a submission, then **Sync now** on the dashboard.

## 4. Custom domain (optional)

1. Netlify → **Domain management** → add domain  
2. Update DNS per Netlify instructions  
3. Set `NEXT_PUBLIC_APP_URL` to `https://yourdomain.com`  
4. Add the custom domain to Firebase **Authorized domains**  
5. **Trigger deploy** (clear cache if QR links still show the old URL)

## 5. Local check before pushing

```bash
cd frontend
npm run build
```

## 6. What is *not* on Netlify

| Component | Where it runs |
|-----------|----------------|
| Laravel `api/` | Separate host (or unused if you’re Firebase-only) |
| PostgreSQL / Redis | Not required for Firebase-only CRM |
| Firestore data | Google Firebase |
| Email (Brevo) | Brevo API from Netlify functions |

## Troubleshooting

| Issue | Fix |
|--------|-----|
| Build fails: missing env | Add all `NEXT_PUBLIC_*` and `FIREBASE_ADMIN_*` vars, redeploy |
| CRM pages empty / 500 | Check function logs in Netlify; verify service account has Firestore access |
| QR works but sync fails | `FIREBASE_ADMIN_SERVICE_ACCOUNT_B64` wrong or truncated |
| Wrong QR link | Set `NEXT_PUBLIC_APP_URL` to production URL, redeploy |
| Function timeout | Netlify Pro may be needed for heavy jobs; default is often enough for this app |

## CLI deploy (optional)

```bash
npm install -g netlify-cli
cd frontend
netlify login
netlify init   # link site from repo root; confirm base = frontend
netlify deploy --prod
```

Set env vars with `netlify env:set KEY value` or in the dashboard.
