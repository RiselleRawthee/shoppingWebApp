# ShopLite Backend — Prisma & Database Conventions

## Overview

Prisma is the exclusive data access layer. All database interactions go through the Prisma client —
no raw SQL, no other ORMs, no direct pg driver calls.

- Schema: `prisma/schema.prisma` — single source of truth for database structure
- Migrations: `prisma/migrations/` — append-only history of all schema changes
- Seed: `prisma/seed.ts` — idempotent seed script for development data
- Client singleton: `src/lib/prisma.ts` — the only place PrismaClient is instantiated

---

## Adding a New Model — Full Workflow

```
1. Edit prisma/schema.prisma          add the new model
2. npm run db:migrate                  generates and applies the migration SQL
3. npm run db:generate                 regenerates the Prisma TypeScript client (usually auto)
4. Add repository class               src/repositories/{entity}.repository.ts
5. Update tests/integration/setup.ts  add deleteMany() to clearDatabase() in FK-safe order
6. Update prisma/seed.ts              if the model needs seed data
```

After step 2, Prisma will ask for a migration name. Use descriptive snake_case:
- `add_reviews_table`
- `add_order_status_column`
- `add_product_rating_index`

---

## Model Conventions

Every model must follow these conventions:

```prisma
model Review {
  // Primary key — always autoincrement Int
  id            Int      @id @default(autoincrement())

  // Foreign keys — Int, matches the referenced model's PK type
  product_id    Int

  // String fields — always specify VarChar length for bounded data
  reviewer_name String   @db.VarChar(200)

  // Unbounded text — no VarChar annotation needed
  comment       String?

  // Numbers — use Int or Float as appropriate
  rating        Int

  // Timestamps — always include created_at with now() default
  created_at    DateTime @default(now())

  // Relations — declare on both sides of the relationship
  product       Product  @relation(fields: [product_id], references: [id])

  // Composite unique constraints — for business uniqueness rules
  @@unique([product_id, reviewer_name])

  // Indexes — on any field used in WHERE clauses
  @@index([product_id])

  // Table name — snake_case plural, map from PascalCase model name
  @@map("reviews")
}
```

### Naming Rules
| Item | Convention | Example |
|------|-----------|---------|
| Model name | PascalCase singular | `Review`, `CartItem` |
| Table name (`@@map`) | snake_case plural | `reviews`, `cart_items` |
| Field names | snake_case | `product_id`, `created_at`, `reviewer_name` |
| Relation fields | camelCase | `product`, `cartItems`, `reviews` |

### Field Type Rules
- `@id @default(autoincrement())` — always Int primary keys
- `@db.VarChar(N)` — required for all String fields with known maximum lengths
- `String?` — optional fields marked with `?`
- `DateTime @default(now())` — timestamps always use `@default(now())`
- `Float` for prices (simplified demo — use `Decimal` in production financial apps)

---

## Migration Rules

**Migrations are append-only history. Never edit an existing migration file.**

```
prisma/migrations/
├── 20260223135920_init/
│   └── migration.sql     ← never edit this
└── 20260301_add_reviews/  ← new migration goes here
    └── migration.sql
```

- Migration files are committed to git as part of the same PR as the schema change
- After merging a PR with a new migration, other developers run `npm run db:migrate` to apply it
- If a migration has a typo or mistake, create a new corrective migration — do not edit the old one
- After any migration, run `npm run test:integration` to confirm the schema change does not break existing tests

---

## Prisma Client Rules

```typescript
// CORRECT — import the singleton
import { prisma } from '../lib/prisma'

// WRONG — never instantiate PrismaClient directly in application code
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()  // ← DO NOT DO THIS
```

```typescript
// CORRECT — Prisma query API
const reviews = await prisma.review.findMany({ where: { product_id: id } })

// WRONG — never write raw SQL
const reviews = await prisma.$queryRaw`SELECT * FROM reviews WHERE product_id = ${id}`
```

```typescript
// CORRECT — Prisma calls belong in repositories only
class ReviewRepository {
  constructor(private readonly db: PrismaClient) {}
  async findByProduct(productId: number) {
    return this.db.review.findMany({ where: { product_id: productId } })
  }
}

// WRONG — services must never call prisma directly
class ReviewService {
  async getReviews(productId: number) {
    return prisma.review.findMany(...)  // ← DO NOT DO THIS
  }
}
```

---

## Unique Constraint Violations

When a Prisma write violates a unique constraint, Prisma throws `PrismaClientKnownRequestError`
with code `P2002`. The service layer must catch this and convert it to a 409 AppError:

```typescript
// In the service (not the repository)
import { Prisma } from '@prisma/client'
import { AppError } from '../errors/AppError'

try {
  return await this.repo.create(data)
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new AppError('A review from this reviewer already exists for this product', 409)
  }
  throw error   // re-throw anything else
}
```

---

## Seed File Conventions

The seed file (`prisma/seed.ts`) must be idempotent — safe to run multiple times:

```typescript
// seed.ts — always delete in FK-safe order before re-creating
async function main() {
  // 1. Delete dependent records first
  await prisma.review.deleteMany()
  await prisma.cartItem.deleteMany()
  // 2. Delete parent records last
  await prisma.product.deleteMany()
  // 3. Re-create
  await prisma.product.createMany({ data: products })
}
```

Run: `npm run db:seed` from `backend/`

The seed script creates **10 products** across 4 categories (Electronics, Lighting, Furniture, Accessories).
If you need to add seed data for a new entity (e.g. sample reviews), add it to this file after the products block.

---

## clearDatabase in Tests — FK Order

`tests/integration/setup.ts` must delete records in FK-safe order:

```typescript
export const clearDatabase = async (): Promise<void> => {
  await testPrisma.review.deleteMany()      // deletes first — references products
  await testPrisma.cartItem.deleteMany()    // deletes second — references products
  await testPrisma.product.deleteMany()     // deletes last — referenced by both
}
```

**When you add a new model that has a FK to `products`** (or any other existing model), add its
`deleteMany()` call to `clearDatabase()` before the model it references. Failure to do this will
cause FK constraint violations in integration tests.

---

## Key Commands

```bash
# From backend/
npm run db:migrate    # create migration from schema changes + apply to dev DB
npm run db:generate   # regenerate Prisma TypeScript client types
npm run db:seed       # seed 10 products (idempotent)
npm run db:studio     # open Prisma Studio — visual DB browser
```
