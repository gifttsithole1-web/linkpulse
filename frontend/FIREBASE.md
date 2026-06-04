# LinkPulse — Firebase-only CRM

The Next.js app stores all CRM data in **Cloud Firestore**. Laravel is optional and no longer required for day-to-day use.

## Collections

| Collection | Purpose |
|------------|---------|
| `clients` | Contacts & companies (loyalty embedded on each doc) |
| `communication_logs` | Messages & campaigns |
| `feedback_submissions` | QR and linked feedback |
| `settings` | Doc `app` — margin, weekly updates toggle |
| `qr_submissions` | Public QR buffer before sync |

## Setup

1. Create a Firebase project and enable **Firestore**.
2. Register a **Web app** → copy config into `.env.local`.
3. **Project settings → Service accounts → Generate key** → base64-encode into `FIREBASE_ADMIN_SERVICE_ACCOUNT_B64`.
4. Deploy rules and indexes:

```bash
cd frontend
firebase deploy --only firestore:rules,firestore:indexes
```

(Requires [Firebase CLI](https://firebase.google.com/docs/cli) logged in and `firebase init firestore` pointing at this folder.)

## Security

- Public users may **create** `qr_submissions` only.
- All CRM reads/writes go through the **Next.js server** (Admin SDK).
- Do not expose Admin credentials to the browser.

## Brevo email

Add to `.env.local`:

- `BREVO_API_KEY` — from Brevo → SMTP & API → API keys
- `BREVO_SENDER_EMAIL` — verified sender in Brevo
- `BREVO_SENDER_NAME` — optional (default LinkPulse)

Email campaigns and client “Log message” (email channel) send via Brevo when configured. Free tier: **300 emails/day**.

**Gmail Promotions tab:** 1:1 “Log message” emails use a plain personal template. Bulk campaigns use a newsletter template (often still land in Promotions). For Primary inbox long-term, use a **custom domain** in Brevo (not `@gmail.com`) with SPF/DKIM/DMARC, and set `BREVO_SENDER_NAME` to a person’s name (e.g. `Dorothy @ Beamlink`).

## QR flow

1. `/qr` writes to `qr_submissions` with `syncedToCrm: false`.
2. `POST /api/qr/sync` ingests into `clients` + `feedback_submissions`.
3. Dashboard **Sync now** uses the same endpoint.
