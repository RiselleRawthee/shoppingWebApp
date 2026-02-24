# ShopLite — Database Design

## Overview

PostgreSQL 16 via Prisma ORM. Three models: `Product`, `CartItem`, `Review`. Schema is the single source of truth — Prisma generates the TypeScript client from it.

- Schema: `backend/prisma/schema.prisma`
- Migrations: `backend/prisma/migrations/`
- Seed data: `backend/prisma/seed.ts`
- Prisma client singleton: `backend/src/lib/prisma.ts`

---

## Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Product {
  id          Int        @id @default(autoincrement())
  name        String     @db.VarChar(200)
  description String
  price       Float
  image_url   String     @db.VarChar(500)
  category    String     @db.VarChar(100)
  stock       Int        @default(0)
  cart_items  CartItem[]
  reviews     Review[]

  @@map("products")
}

model CartItem {
  id         Int      @id @default(autoincrement())
  session_id String   @db.VarChar(100)
  product_id Int
  quantity   Int      @default(1)
  created_at DateTime @default(now())
  product    Product  @relation(fields: [product_id], references: [id])

  @@index([session_id])
  @@map("cart_items")
}

model Review {
  id            Int      @id @default(autoincrement())
  product_id    Int
  reviewer_name String
  rating        Int
  comment       String?
  created_at    DateTime @default(now())
  product       Product  @relation(fields: [product_id], references: [id])

  @@unique([product_id, reviewer_name])
  @@map("reviews")
}
```

---

## Entity Relationship Diagram

```
┌─────────────────────────────────┐
│           products              │
│─────────────────────────────────│
│ id           INT  PK            │
│ name         VARCHAR(200)       │
│ description  TEXT               │
│ price        FLOAT              │
│ image_url    VARCHAR(500)       │
│ category     VARCHAR(100)       │
│ stock        INT  default 0     │
└──────────┬──────────────────────┘
           │ 1
           │
    ┌──────┴──────────────────────┐
    │                             │
    │ N                           │ N
┌───┴──────────────────────────┐  ┌──────────────────────────────┐
│         cart_items           │  │           reviews            │
│──────────────────────────────│  │──────────────────────────────│
│ id           INT  PK         │  │ id            INT  PK        │
│ session_id   VARCHAR(100)    │  │ product_id    INT  FK        │
│ product_id   INT  FK ────────┘  │ reviewer_name VARCHAR        │
│ quantity     INT  default 1  │  │ rating        INT  (1–5)     │
│ created_at   TIMESTAMP       │  │ comment       TEXT nullable  │
│                              │  │ created_at    TIMESTAMP      │
│ INDEX (session_id)           │  │                              │
└──────────────────────────────┘  │ UNIQUE (product_id,          │
                                  │         reviewer_name)       │
                                  └──────────────────────────────┘
```

---

## Relationships

| Relationship | Type | Foreign Key | Notes |
|-------------|------|-------------|-------|
| Product → CartItem | One-to-many | `cart_items.product_id → products.id` | A product can appear in many carts |
| Product → Review | One-to-many | `reviews.product_id → products.id` | A product can have many reviews |

**Cascade behaviour:** Prisma defaults to `RESTRICT` — a `Product` cannot be deleted while it has associated `CartItem` or `Review` records. This is intentional for demo data integrity.

---

## Constraints and Indexes

| Table | Constraint / Index | Purpose |
|-------|--------------------|---------|
| `products` | PK on `id` | Row identity |
| `cart_items` | PK on `id` | Row identity |
| `cart_items` | INDEX on `session_id` | Fast cart lookups by session |
| `cart_items` | FK `product_id → products.id` | Referential integrity |
| `reviews` | PK on `id` | Row identity |
| `reviews` | FK `product_id → products.id` | Referential integrity |
| `reviews` | UNIQUE `(product_id, reviewer_name)` | One review per reviewer per product |

The unique constraint on `(product_id, reviewer_name)` is enforced at the database level. The service layer catches the Prisma unique constraint violation and re-throws as `AppError('...', 409)`.

---

## Design Decisions

### Session-based cart (no authentication)
There is no user model. Cart ownership is determined by a client-generated session ID (`shoplite-session-{random}`). The session ID is stored client-side (in memory, generated at module load) and sent with every cart request. This simplifies the demo — no login required.

### Review rating range
The `rating` column is a plain `Int` with no DB-level check constraint. The 1–5 range is enforced by the Zod schema (`z.number().int().min(1).max(5)`) in the API validation layer. If the service layer is bypassed, invalid ratings could be stored — a deliberate simplification for the demo.

### Price as Float
Product prices are stored as `Float`. For production financial data, `Decimal` would be preferred. The demo does not require cent-accurate arithmetic.

### Separate test database
Integration tests run against a completely separate PostgreSQL database (`shoplite_test`), not a test schema within the same database. This avoids schema permission issues and allows `dropdb`/`createdb` for clean resets.

---

## Prisma Usage Rules

1. **Never instantiate `PrismaClient` directly** in application code. Always import the singleton:
   ```typescript
   import { prisma } from '../lib/prisma'
   ```

2. **All Prisma calls belong in repositories** (`src/repositories/`). Services and controllers must not call `prisma` directly.

3. **Never write raw SQL** — use the Prisma query API. Raw queries break type safety and schema tracking.

4. **After any `schema.prisma` change**, run:
   ```bash
   npm run db:migrate   # creates and applies a new migration file
   npm run db:generate  # regenerates the TypeScript client (usually automatic with migrate)
   ```

5. **Migration files are committed to git** (`prisma/migrations/`). Never edit existing migration files.

---

## Migrations

Current migration: `20260223135920_init`

Creates all three tables with their constraints and indexes in a single migration. This is the initial schema migration for the entire project.

To create a new migration after a schema change:
```bash
cd backend
npm run db:migrate     # prompts for a migration name
# e.g. "add_review_index"
```

---

## Seed Data

File: `backend/prisma/seed.ts`

The seed script is idempotent — it deletes all existing data (in FK-safe order) before re-inserting:
1. Delete all Reviews
2. Delete all CartItems
3. Delete all Products
4. Create 10 products

**10 seeded products:**

| # | Name | Category | Price | Stock |
|---|------|----------|-------|-------|
| 1 | Wireless Noise-Cancelling Headphones | Electronics | R2,999.99 | 15 |
| 2 | Mechanical Keyboard | Electronics | R1,499.99 | 30 |
| 3 | 27" 4K Monitor | Electronics | R8,999.99 | 8 |
| 4 | 7-Port USB Hub | Electronics | R499.99 | 50 |
| 5 | 1080p Webcam | Electronics | R899.99 | 20 |
| 6 | Smart LED Desk Lamp | Lighting | R699.99 | 40 |
| 7 | Ergonomic Office Chair | Furniture | R5,499.99 | 5 |
| 8 | Height-Adjustable Standing Desk | Furniture | R12,999.99 | 3 |
| 9 | Aluminium Laptop Stand | Accessories | R349.99 | 60 |
| 10 | Cable Management Kit | Accessories | R149.99 | 100 |

Images are sourced from Unsplash URLs. Stock levels vary to demonstrate the "Out of stock" UI state.

Run seed:
```bash
cd backend
npm run db:seed
```

---

## Database Commands

```bash
# Apply schema changes as a new migration
npm run db:migrate

# Regenerate Prisma client after schema change (usually not needed separately)
npm run db:generate

# Seed the development database with sample products
npm run db:seed

# Open Prisma Studio — visual DB browser
npm run db:studio

# Direct psql access (dev database)
psql postgresql://shoplite:shoplite@localhost:5432/shoplite

# Direct psql access (test database)
psql postgresql://shoplite:shoplite@localhost:5432/shoplite_test
```

---

## Test Database Setup

Integration tests use a separate database to avoid corrupting development data.

**How the switch happens:**
`backend/tests/integration/envSetup.ts` runs in Jest's `setupFiles` (before any modules load) and overrides `DATABASE_URL`:

```typescript
// envSetup.ts — runs BEFORE modules load, so Prisma picks up the test URL
import dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '../../.env') })
process.env['DATABASE_URL'] = process.env['DATABASE_URL_TEST'] ?? ''
```

This is critical — the Prisma singleton is created on first import. If `DATABASE_URL` is not set before the first import, Prisma connects to the wrong database.

**Test database management:**
Each integration test file runs `clearDatabase()` in `beforeEach`:

```typescript
// tests/integration/setup.ts
export const clearDatabase = async (): Promise<void> => {
  await testPrisma.review.deleteMany()      // must be first (FK)
  await testPrisma.cartItem.deleteMany()    // must be second (FK)
  await testPrisma.product.deleteMany()     // must be last (referenced by FK)
}
```

The deletion order respects foreign key constraints.
