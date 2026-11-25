# Trattoria Test — Italian Food Order App

Next.js food ordering application for a **test environment**, backed by **Turso** (libSQL). Users create accounts, browse 10 sample Italian dishes, add items to a cart, and place orders that store both **user identity** and **menu item snapshots**.

## Features

- Next.js App Router + TypeScript + Tailwind CSS
- Turso database via Drizzle ORM
- Email/password accounts with NextAuth
- 10 seeded Italian menu items (photo, name, price, description)
- Cart stored in browser localStorage
- Orders linked to user ID, name, and email
- Order line items store menu item details at order time

## What I need from you

To run this against **Turso cloud**, please provide or create:

1. **Turso database**
   - Create one at [turso.tech](https://turso.tech) or with the Turso CLI
2. **Environment values**
   - `TURSO_DATABASE_URL` — e.g. `libsql://your-db-name-org.turso.io`
   - `TURSO_AUTH_TOKEN` — database auth token
   - `NEXTAUTH_SECRET` — any long random string
   - `NEXTAUTH_URL` — e.g. `http://localhost:3000`

For quick local testing without Turso cloud, you can use a local SQLite file instead:

```env
TURSO_DATABASE_URL=file:./local.db
NEXTAUTH_SECRET=local-dev-secret-change-me
NEXTAUTH_URL=http://localhost:3000
```

## Setup

```bash
cd O:/2026/food-order
cp .env.example .env.local
# Edit .env.local with your values

npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database schema

| Table | Purpose |
| --- | --- |
| `users` | Registered customers |
| `menu_items` | Italian dishes |
| `orders` | Order header with user info (`user_id`, `user_name`, `user_email`) |
| `order_items` | Snapshot of each dish ordered (name, description, price, image, quantity) |

This makes it clear **who** ordered **what**, even if menu prices change later.

## Scripts

- `npm run db:push` — apply schema to Turso/local DB
- `npm run db:seed` — insert 10 Italian menu items (skips if menu already exists)
- `npm run db:setup` — push schema + seed menu

## Questions for you

Before extending this beyond the test environment, it would help to know:

1. **Payments** — Skip for now, or integrate Stripe/PayPal later?
2. **Order workflow** — Is `pending` enough, or do you want statuses like `confirmed`, `preparing`, `delivered`?
3. **Admin panel** — Do staff need a dashboard to view/manage all orders?
4. **Delivery options** — Pickup only, delivery address, or table number?
5. **Authentication** — Is email/password fine, or do you want Google/social login?
6. **Language/currency** — Keep EUR and English, or switch to JPY/Japanese?

## Project structure

```
src/
  app/
    (main)/          # Home, menu, cart, orders
    api/             # Auth, menu, orders
    login/ register/
  components/
  db/                # Schema, seed, client
  lib/               # Auth + formatting helpers
```
