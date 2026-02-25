# ShopLite Backend — Test Conventions

## Test Architecture

```
tests/
├── unit/              Service layer tests — no DB, no HTTP, fast
│   ├── product.service.test.ts
│   ├── cart.service.test.ts
│   └── review.service.test.ts    ← add alongside every new service
└── integration/       Full HTTP stack tests — real test DB, real app instance
    ├── envSetup.ts        CRITICAL: sets DATABASE_URL before any module loads
    ├── setup.ts           helpers: clearDatabase(), createProduct(), testPrisma
    ├── products.test.ts
    ├── cart.test.ts
    └── reviews.test.ts        ← add alongside every new router
```

**Run order:** `npm test` runs unit then integration, sequentially. Never run integration tests with parallel workers.

---

## Unit Tests (`tests/unit/`)

Unit tests cover the **service layer only**. They verify business logic in isolation — no database, no HTTP server.

### Structure Pattern

```typescript
// tests/unit/review.service.test.ts
import { mockDeep, MockProxy } from 'jest-mock-extended'
import { Prisma } from '@prisma/client'
import type { ReviewRepository } from '../../src/repositories/review.repository'
import { ReviewService } from '../../src/services/review.service'

// Minimal mock data — only required fields
const mockReview = {
  id: 1,
  product_id: 1,
  reviewer_name: 'Jane Doe',
  rating: 4,
  comment: 'Great!',
  created_at: new Date(),
}

const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'A test product',
  price: 99.99,
  image_url: 'https://example.com/img.jpg',
  category: 'Electronics',
  stock: 10,
}

describe('ReviewService', () => {
  let repo: MockProxy<ReviewRepository>
  let service: ReviewService

  beforeEach(() => {
    // Re-create fresh mocks before every test — prevents state leakage
    repo = mockDeep<ReviewRepository>()
    service = new ReviewService(repo)
  })

  describe('getReviews', () => {
    it('returns reviews list with aggregates', async () => {
      repo.findByProduct.mockResolvedValue([mockReview])

      const result = await service.getReviews(1)

      expect(result.reviews).toHaveLength(1)
      expect(result.average_rating).toBe(4)
      expect(result.total_reviews).toBe(1)
      expect(repo.findByProduct).toHaveBeenCalledWith(1)
    })

    it('returns empty result when product has no reviews', async () => {
      repo.findByProduct.mockResolvedValue([])

      const result = await service.getReviews(1)

      expect(result.reviews).toHaveLength(0)
      expect(result.average_rating).toBe(0)
      expect(result.total_reviews).toBe(0)
    })
  })

  describe('createReview', () => {
    it('creates and returns the review', async () => {
      repo.create.mockResolvedValue(mockReview)

      const result = await service.createReview(1, {
        reviewer_name: 'Jane Doe',
        rating: 4,
        comment: 'Great!',
      })

      expect(result).toEqual(mockReview)
    })

    it('throws 404 when product does not exist', async () => {
      repo.productExists.mockResolvedValue(false)

      await expect(service.createReview(999, { reviewer_name: 'Jane', rating: 3 }))
        .rejects.toMatchObject({ statusCode: 404, message: 'Product not found' })
    })

    it('throws 409 when reviewer has already reviewed this product', async () => {
      // Simulate Prisma unique constraint violation (P2002)
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '6.0.0', meta: {} }
      )
      repo.create.mockRejectedValue(prismaError)

      await expect(service.createReview(1, { reviewer_name: 'Jane', rating: 3 }))
        .rejects.toMatchObject({ statusCode: 409 })
    })
  })
})
```

### Mock Patterns

```typescript
// Success — return a value
repo.findById.mockResolvedValue(mockProduct)

// Not found — return null
repo.findById.mockResolvedValue(null)

// DB constraint violation (unique key)
repo.create.mockRejectedValue(
  new Prisma.PrismaClientKnownRequestError('Unique constraint', {
    code: 'P2002',
    clientVersion: '6.0.0',
    meta: {},
  })
)

// Unexpected DB error
repo.findAll.mockRejectedValue(new Error('Connection refused'))

// Verify call args
expect(repo.create).toHaveBeenCalledWith({ product_id: 1, reviewer_name: 'Jane', rating: 4, comment: undefined })
```

### Error Assertion Pattern

```typescript
// Assert both the statusCode and the message
await expect(service.getProduct(999)).rejects.toMatchObject({
  statusCode: 404,
  message: 'Product not found',
})

// Assert only the status code when the exact message is less important
await expect(service.createReview(1, data)).rejects.toMatchObject({ statusCode: 409 })
```

### Coverage Requirements

The jest config enforces **80% minimum** across statements, branches, functions, and lines.
Every new service **must** have unit tests before the PR is raised.

Required test cases per service method:
- Happy path (success)
- Not found → 404 (for any method that fetches by ID)
- Conflict → 409 (for any create method with a unique constraint)
- Validation failure → 422 (for business rule checks in services)

---

## Integration Tests (`tests/integration/`)

Integration tests cover the **full HTTP stack** — a real Express app instance, real Prisma, real test database.

### Critical: envSetup.ts

**Do not modify `tests/integration/envSetup.ts`.** It must run before any module is imported:

```typescript
// envSetup.ts — sets DATABASE_URL to the test DB BEFORE Prisma creates its client
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(__dirname, '../../.env') })
process.env['DATABASE_URL'] = process.env['DATABASE_URL_TEST'] ?? ''
```

This file is in `setupFiles` in `jest.config.js`. If you add a new integration test file, it
automatically inherits this setup — no changes needed.

### Standard Test File Structure

```typescript
// tests/integration/reviews.test.ts
import request from 'supertest'
import { buildApp } from '../../src/app'
import { clearDatabase, createProduct, testPrisma } from './setup'

const app = buildApp()   // create once per file — not inside describe/it

beforeEach(async () => {
  await clearDatabase()  // always wipe before each test
})

afterAll(async () => {
  await testPrisma.$disconnect()  // always disconnect after all tests in the file
})

describe('POST /products/:productId/reviews', () => {
  describe('happy path', () => {
    it('creates a review and returns 201', async () => {
      const product = await createProduct()

      const res = await request(app)
        .post(`/products/${product.id}/reviews`)
        .send({ reviewer_name: 'Jane Doe', rating: 4, comment: 'Great!' })
        .expect(201)

      expect(res.body.reviewer_name).toBe('Jane Doe')
      expect(res.body.rating).toBe(4)
      expect(res.body.product_id).toBe(product.id)
    })
  })

  describe('validation', () => {
    it('returns 422 when rating is 0', async () => {
      const product = await createProduct()

      const res = await request(app)
        .post(`/products/${product.id}/reviews`)
        .send({ reviewer_name: 'Jane', rating: 0 })
        .expect(422)

      expect(res.body.message).toBe('Validation error')
    })

    it('returns 422 when rating is 6', async () => {
      const product = await createProduct()
      await request(app)
        .post(`/products/${product.id}/reviews`)
        .send({ reviewer_name: 'Jane', rating: 6 })
        .expect(422)
    })

    it('returns 422 when reviewer_name is missing', async () => {
      const product = await createProduct()
      await request(app)
        .post(`/products/${product.id}/reviews`)
        .send({ rating: 4 })
        .expect(422)
    })
  })

  describe('error cases', () => {
    it('returns 404 when product does not exist', async () => {
      await request(app)
        .post('/products/9999/reviews')
        .send({ reviewer_name: 'Jane', rating: 4 })
        .expect(404)
    })

    it('returns 409 when the same reviewer submits twice', async () => {
      const product = await createProduct()
      const payload = { reviewer_name: 'Jane', rating: 4 }

      await request(app).post(`/products/${product.id}/reviews`).send(payload).expect(201)
      await request(app).post(`/products/${product.id}/reviews`).send(payload).expect(409)
    })
  })
})

describe('GET /products/:productId/reviews', () => {
  it('returns empty list for product with no reviews', async () => {
    const product = await createProduct()

    const res = await request(app)
      .get(`/products/${product.id}/reviews`)
      .expect(200)

    expect(res.body).toEqual({ reviews: [], average_rating: 0, total_reviews: 0 })
  })

  it('returns reviews with correct average', async () => {
    const product = await createProduct()
    // Seed reviews via the API to go through full validation
    await request(app).post(`/products/${product.id}/reviews`).send({ reviewer_name: 'A', rating: 3 })
    await request(app).post(`/products/${product.id}/reviews`).send({ reviewer_name: 'B', rating: 5 })

    const res = await request(app).get(`/products/${product.id}/reviews`).expect(200)

    expect(res.body.total_reviews).toBe(2)
    expect(res.body.average_rating).toBe(4)
  })
})
```

### clearDatabase — Always in FK Order

```typescript
// tests/integration/setup.ts
export const clearDatabase = async (): Promise<void> => {
  await testPrisma.review.deleteMany()      // 1st: no FK dependencies
  await testPrisma.cartItem.deleteMany()    // 2nd: depends on products
  await testPrisma.product.deleteMany()     // 3rd: referenced by both above
}
```

**Never delete products before reviews or cartItems** — the FK constraint will throw.
When a new model is added that depends on `products`, add its `deleteMany()` before the product deletion.

### Integration Test Helpers (from `setup.ts`)

```typescript
createProduct(overrides?: Partial<Prisma.ProductCreateInput>)
// Creates a product with sensible defaults. Pass overrides for specific test scenarios:
const product = await createProduct({ category: 'Furniture', stock: 0 })

testPrisma
// The PrismaClient instance connected to the test DB.
// Use to directly read/verify DB state after API calls:
const reviews = await testPrisma.review.findMany({ where: { product_id: product.id } })
expect(reviews).toHaveLength(1)
```

### Coverage Requirements for Integration Tests

Every new route must have integration tests covering:
- Happy path (correct status code and response shape)
- 404 — resource not found
- 422 — validation failure (at least 2–3 field-level cases)
- 409 — conflict (for any POST with a unique constraint)
- Edge cases specific to the feature

---

## --runInBand Is Mandatory

Integration tests share a single PostgreSQL database. Running them in parallel causes data
corruption between test files. The `npm run test:integration` script uses `--runInBand`.

**Never remove `--runInBand` from `jest.config.js` or the npm script.**

If an integration test is slow, optimise the test (fewer round-trips, targeted seed data) rather
than enabling parallelism.
