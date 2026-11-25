# Trattoria Test — Italian Food Order App

Next.js 16 food ordering app backed by **Turso** (libSQL cloud). Customers browse Italian dishes, create an account, and place orders via **Stripe** hosted checkout. A protected admin panel lets staff manage orders, users, and the menu.

## Tech stack

- **Next.js 16** App Router + TypeScript + Tailwind CSS v4
- **Turso** (libSQL) via Drizzle ORM
- **NextAuth v4** — email/password, JWT sessions
- **Stripe** — hosted checkout, webhook for payment confirmation
- **Vercel Blob** — image storage for menu items

## Features

**Customer**
- Browse 10 seeded Italian menu items with photos
- Cart stored in browser localStorage (no login needed to browse)
- Pickup or delivery orders with phone number
- Stripe hosted checkout (test mode); orders placed directly when Stripe is not configured
- Order history per customer

**Admin** (protected — `/admin` only)
- View all orders, advance status (pending → confirmed → preparing → delivered)
- Manage user accounts: list, promote/demote admin role, delete
- Manage menu items: add, edit (name, description, price, image), delete
- Upload dish images directly from the browser (stored on Vercel Blob)

---

## Local setup

**Prerequisites:** Node.js 20+, a Turso database (see [turso.tech](https://turso.tech)).

```bash
git clone https://github.com/kappasan21/food-order.git
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
| `BLOB_READ_WRITE_TOKEN` | Admin images | From Vercel → Storage → Blob → `.env.local` tab |
| `ADMIN_EMAIL` | Seed only | Email for the admin account seed script |
| `ADMIN_PASSWORD` | Seed only | Password for the admin account (min 8 chars) |

---

## Admin account

Create the admin user (after `db:setup`):

```bash
# set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local first
npx tsx src/db/seed-admin.ts
```

This creates a new user or promotes an existing one to the `admin` role. Log in with those credentials and visit `/admin`.

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

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
2. Framework preset: **Next.js** (auto-detected) → **Deploy**

### 3. Add environment variables in Vercel

Vercel → **Settings → Environment Variables** — add all 9 vars from `.env.example`.
Set `NEXTAUTH_URL` to your Vercel deployment URL (e.g. `https://food-order-abc.vercel.app`).

### 4. Set up Vercel Blob (for menu image uploads)

Vercel → **Storage** → **Create Database** → **Blob** → give it a name → **Create**.
Copy the `BLOB_READ_WRITE_TOKEN` from the `.env.local` tab → add to Vercel env vars.

### 5. Set up Stripe webhook

1. [Stripe dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks) → **Add endpoint** (or **Create event destination**)
2. URL: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
3. Event: `checkout.session.completed`
4. Copy the **Signing secret** (`whsec_...`) → add as `STRIPE_WEBHOOK_SECRET` in Vercel → **Redeploy**

### 6. Seed admin on production

```bash
# Set TURSO_DATABASE_URL (cloud), ADMIN_EMAIL, ADMIN_PASSWORD in .env.local, then:
npx tsx src/db/seed-admin.ts
```

---

## Project structure

```
src/
  app/
    (main)/          # Home, /menu, /cart, /checkout, /orders
    (admin)/         # /admin, /admin/orders, /admin/users, /admin/menu
    api/             # /api/checkout, /api/orders, /api/admin/*, /api/webhooks/stripe
    login/ register/
  components/        # cart-view, menu-grid, order-list, providers
  db/                # schema, Drizzle client, seed scripts
  lib/               # auth, stripe, orders, format, constants
```

## Known limitations

- No pagination on admin lists
- No bulk actions in admin
- Prices are in USD; currency is not configurable
- No order cancellation or refund flow
