# Trattoria Test — Italian Food Order App

Next.js 16 food ordering app backed by **Turso** (libSQL cloud). Customers browse 10 Italian dishes, create an account, and place orders via **Stripe** hosted checkout. An admin role can view all orders and advance their status.

## Tech stack

- **Next.js 16** App Router + TypeScript + Tailwind CSS v4
- **Turso** (libSQL) via Drizzle ORM
- **NextAuth v4** — email/password, JWT sessions
- **Stripe** — hosted checkout, webhook for payment confirmation

## Features

- 10 seeded Italian menu items with photos
- Cart stored in browser localStorage (no login needed to browse)
- Pickup or delivery orders with phone number
- Stripe hosted checkout (test mode); orders placed directly when Stripe is not configured
- Order history per customer
- Admin API to view all orders and advance status (pending → confirmed → preparing → delivered)

---

## Local setup

**Prerequisites:** Node.js 20+, a Turso database (see [turso.tech](https://turso.tech)).

```bash
git clone <your-repo>
cd food-order
cp .env.example .env.local
# Fill in .env.local — see the comments in .env.example
npm install
npm run db:setup   # push schema + seed 10 menu items
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `TURSO_DATABASE_URL` | Yes | `libsql://your-db.turso.io` or `file:./local.db` for local |
| `TURSO_AUTH_TOKEN` | Cloud only | Turso auth token (not needed for `file:` URLs) |
| `NEXTAUTH_SECRET` | Yes | Random string — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | App public URL — `http://localhost:3000` locally |
| `STRIPE_SECRET_KEY` | Optional | `sk_test_...` from Stripe dashboard — omit to skip payment |
| `STRIPE_WEBHOOK_SECRET` | With Stripe | `whsec_...` from Stripe dashboard endpoint |
| `ADMIN_EMAIL` | Seed only | Email for the admin account seed script |
| `ADMIN_PASSWORD` | Seed only | Password for the admin account (min 8 chars) |

---

## Admin account

Create the admin user (after `db:setup`):

```bash
# set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local first
npx tsx src/db/seed-admin.ts
```

This creates a new user or promotes an existing one to the `admin` role. Log in with those credentials — admin API endpoints at `/api/admin/orders` will be accessible.

---

## Database scripts

| Script | Action |
|---|---|
| `npm run db:push` | Apply schema to DB (Turso or local) |
| `npm run db:seed` | Insert 10 Italian menu items (skips if already seeded) |
| `npm run db:setup` | `db:push` + `db:seed` |

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USER/food-order.git
git push -u origin master
```

### 2. Create Vercel project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Click **Deploy** (first deploy will fail without env vars — that's expected)

### 3. Add environment variables in Vercel

In your Vercel project → **Settings → Environment Variables**, add all 8 variables from `.env.example`. Set `NEXTAUTH_URL` to your Vercel deployment URL (e.g. `https://food-order-abc.vercel.app`).

Leave `STRIPE_WEBHOOK_SECRET` blank for now — set it in step 4.

Redeploy after adding vars.

### 4. Set up Stripe webhook

1. Go to [Stripe dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. **Add endpoint**
   - URL: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`
3. After saving, copy the **Signing secret** (`whsec_...`)
4. Add it as `STRIPE_WEBHOOK_SECRET` in Vercel env vars → **Redeploy**

### 5. Seed admin on production

The Turso cloud DB is already seeded (menu items). To create the admin account, run the seed script once with the production env:

```bash
# In your local .env.local, temporarily point to the production Turso DB
# and set ADMIN_EMAIL / ADMIN_PASSWORD, then:
npx tsx src/db/seed-admin.ts
```

---

## Project structure

```
src/
  app/
    (main)/          # Home, /menu, /cart, /checkout, /orders
    api/             # /api/checkout, /api/orders, /api/admin/orders, /api/webhooks/stripe
    login/ register/
  components/        # cart-view, menu-grid, order-list, providers
  db/                # schema, Drizzle client, seed scripts
  lib/               # auth, stripe, orders, format, constants
```

## Known limitations

- No admin UI pages — admin access is via the API only (`/api/admin/orders`)
- Prices are in USD; currency is not configurable
- No order cancellation or refund flow
