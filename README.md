# LinkPulse CRM Monorepo

Production starter for BeamLink Tech's LinkPulse CRM.

## Stack

- `frontend/`: Next.js 16 (App Router + Tailwind)
- `api/`: Laravel 9 headless API
- `database`: PostgreSQL (configured in `api/.env`)
- `queue/cache`: Redis (configured in `api/.env`)

## Quick Start

1. API setup
   - `cd api`
   - `copy .env.example .env`
   - update DB credentials
   - `php artisan key:generate`
   - `php artisan migrate`
   - `php artisan serve`

2. Frontend setup
   - `cd frontend`
   - `copy .env.example .env.local`
   - `npm run dev`

## Deploy on Netlify

The CRM UI and API routes deploy from `frontend/` using the Netlify Next.js plugin. See **[NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md)** for env vars, Firebase domains, and custom domain steps.

Quick summary: connect repo → set `NEXT_PUBLIC_APP_URL` + Firebase + `FIREBASE_ADMIN_SERVICE_ACCOUNT_B64` → redeploy.

## QR code (customer scan)

The QR code is **not** generated inside Firebase. It is a link to your landing page:

- Local dev: `http://localhost:3000/qr` (phones on the same Wi‑Fi only)
- Production: `https://your-domain.com/qr`

On the **Dashboard**, the **QR code** panel shows a scannable image and copyable link. Set `NEXT_PUBLIC_APP_URL` in `frontend/.env.local` to your public site URL before printing codes.

You can also create a QR at [https://www.qr-code-generator.com](https://www.qr-code-generator.com) using that same URL.

## QR → CRM flow

1. Customer scans QR → `/qr` form
2. Submit → Firestore `qr_submissions`
3. Dashboard → **Sync now** → Laravel CRM + `feedback_submissions`
4. View → **Feedback** in CRM (`/feedback`)

## API Endpoints (v1)

- `GET/POST /api/v1/clients`
- `GET/PATCH/DELETE /api/v1/clients/{id}`
- `GET /api/v1/feedback-submissions`
- `GET /api/v1/loyalty-accounts`
- `POST /api/v1/loyalty-accounts/{id}/award-points`
- `GET/POST /api/v1/communication-logs`
- `POST /api/v1/public/qr-submissions` (sync secret header)

## Weekly emails (SMTP)

In `api/.env`, configure real SMTP (Gmail app password, SendGrid, Mailgun, etc.):

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=...
MAIL_FROM_NAME="LinkPulse"
QUEUE_CONNECTION=redis
```

Run queue worker (emails are queued):

```bash
cd api
php artisan queue:work
```

Scheduler sends weekly updates (Mondays 09:00 UTC):

```bash
php artisan schedule:work
```

## Implemented Domain Rules

- Dual-context client profile (`retail` / `corporate`)
- Communication log pipeline entity with delivery status tracking
- Margin-weighted loyalty award:
  - points = `transaction_amount * margin_coefficient`
