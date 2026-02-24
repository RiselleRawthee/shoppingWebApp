# ShopLite — Backend Architecture

## Overview

The backend is a Node.js/Express REST API written in strict TypeScript. It follows a strict four-layer architecture:
**Router → Controller → Service → Repository → Prisma → PostgreSQL**

Entry point: `backend/src/index.ts`
App factory: `backend/src/app.ts` (exports `buildApp()`)

---

## Directory Structure

```
backend/src/
├── controllers/       HTTP request handlers (thin layer)
│   ├── product.controller.ts
│   ├── cart.controller.ts
│   └── review.controller.ts
├── services/          Business logic
│   ├── product.service.ts
│   ├── cart.service.ts
│   └── review.service.ts          ← stub (throws 501)
├── repositories/      Data access via Prisma
│   ├── product.repository.ts
│   ├── cart.repository.ts
│   └── review.repository.ts       ← stub (empty methods)
├── routers/           Route definitions
│   ├── index.ts                   ← assembles all routers
│   ├── product.router.ts
│   ├── cart.router.ts
│   └── review.router.ts
├── schemas/           Zod schemas (validation + OpenAPI source)
│   ├── product.schema.ts
│   ├── cart.schema.ts
│   └── review.schema.ts
├── middleware/
│   ├── errorHandler.ts            ← global error handler (must be last)
│   ├── requestLogger.ts           ← pino logger + pinoHttp
│   └── validate.ts                ← Zod validation middleware
├── errors/
│   └── AppError.ts                ← typed error with statusCode
├── lib/
│   └── prisma.ts                  ← PrismaClient singleton
├── config/
│   └── env.ts                     ← typed env vars (throws on missing)
├── docs/
│   └── swagger.ts                 ← OpenAPI registry + spec builder
├── app.ts                         ← buildApp() factory with DI wiring
└── index.ts                       ← server start (binds port)
```

---

## Layered Architecture

```
HTTP Request
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│  Router (src/routers/)                                   │
│  Route bindings only — no logic                          │
│  router.get('/products', controller.list)                │
│  router.post('/cart', validate(schema), controller.add)  │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼ (if POST/PUT, runs validate middleware first)
┌──────────────────────────────────────────────────────────┐
│  validate(schema) middleware                             │
│  Calls schema.parse(req.body) → 422 on failure          │
│  Replaces req.body with parsed (typed) result           │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Controller (src/controllers/)                           │
│  Parses req.params, req.query, req.body                  │
│  Calls service method                                    │
│  Sends JSON response                                     │
│  Always calls next(err) on failure — never throws        │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Service (src/services/)                                 │
│  All business logic lives here                           │
│  Throws AppError for expected failures (404, 409, etc.)  │
│  Never calls Prisma directly                             │
│  Never accesses req/res objects                          │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Repository (src/repositories/)                          │
│  Pure Prisma queries — one method per DB operation       │
│  Returns data or null — never throws, never decides      │
│  No business logic                                       │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Prisma (src/lib/prisma.ts)                              │
│  Singleton PrismaClient                                  │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
                      PostgreSQL
```

**If an error occurs at any layer**, the controller catches it and calls `next(err)`. The global `errorHandler` middleware (registered last in `app.ts`) formats and sends the response.

---

## Dependency Injection

All dependencies are wired manually in `app.ts` inside `buildApp()`. There is no DI container.

```typescript
// app.ts — buildApp()
const productRepo = new ProductRepository(prisma)
const productService = new ProductService(productRepo)
const productController = new ProductController(productService)

const cartRepo = new CartRepository(prisma)
const cartService = new CartService(cartRepo)
const cartController = new CartController(cartService)

const reviewRepo = new ReviewRepository(prisma)
const reviewService = new ReviewService(reviewRepo)
const reviewController = new ReviewController(reviewService)

app.use(createRootRouter({ product: productController, cart: cartController, review: reviewController }))
```

**Rule:** Constructor parameters are always typed interfaces or classes — never instantiated inline inside a class.

---

## Middleware Chain

Middleware is applied in this exact order in `app.ts`. Order is significant.

```
1. helmet()                  — security headers (X-Frame-Options, CSP, etc.)
2. cors({ origin: ... })     — CORS, restricted to localhost:5173
3. rateLimit(...)            — 100 requests / 15 min per IP
4. pinoHttp (httpLogger)     — structured request logging
5. morgan('dev')             — concise request log for dev console
6. express.json()            — parse JSON request bodies
7. routes (createRootRouter) — all API routes
8. errorHandler              — global error handler (MUST be last)
```

---

## Error Handling

### AppError

All expected (user-facing) errors use `AppError`:

```typescript
// src/errors/AppError.ts
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  constructor(message: string, statusCode: number) { ... }
}
```

Usage in services:
```typescript
if (!product) throw new AppError('Product not found', 404)
throw new AppError('A review from this reviewer already exists', 409)
throw new AppError('Rating must be between 1 and 5', 422)
```

### Global errorHandler

Registered as the final middleware in `app.ts`:

| Error type | Response |
|-----------|---------|
| `AppError` | `{ message }` with `err.statusCode` |
| `ZodError` | 422 `{ message: 'Validation error', errors: [{field, message}] }` |
| Unknown | 500 `{ message: 'Internal server error' }` + pino log |

### HTTP Status Codes

| Code | Meaning | When to use |
|------|---------|-------------|
| 200 | OK | Successful GET |
| 201 | Created | Successful POST (return the created resource) |
| 204 | No Content | Successful DELETE |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate (e.g. reviewer already submitted a review) |
| 422 | Unprocessable Entity | Validation failure (Zod or business rule) |
| 501 | Not Implemented | Stub endpoints |
| 500 | Internal Server Error | Unexpected failures only |

---

## Validation

All request bodies are validated using Zod schemas before reaching controllers.

1. Define schema in `src/schemas/*.schema.ts` with `.openapi()` annotations
2. Apply middleware in router: `router.post('/', validate(CreateXSchema), controller.create)`
3. The `validate` middleware parses the body and replaces `req.body` with the typed result

```typescript
// src/middleware/validate.ts
export const validate = (schema: ZodSchema): RequestHandler =>
  (req, res, next) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(422).json({ message: 'Validation error', errors: error.errors.map(...) })
        return
      }
      next(error)
    }
  }
```

---

## Swagger / OpenAPI

The API is self-documenting. Swagger UI is served at `GET /api-docs`.

**How it works:**
1. Zod schemas in `src/schemas/` are annotated with `.openapi({ example: ... })` and `.openapi('SchemaName')`
2. Schemas and paths are registered in `src/docs/swagger.ts` using `OpenAPIRegistry`
3. The spec is generated with `OpenApiGeneratorV3` and passed to `swagger-ui-express`

**Rule:** When adding a new endpoint, you must:
1. Add/update Zod schema in `src/schemas/`
2. Register the path in `src/docs/swagger.ts`
3. The Swagger UI at `/api-docs` will auto-reflect the changes

---

## All Endpoints

### Products

| Method | Path | Query | Response | Errors |
|--------|------|-------|----------|--------|
| GET | `/products` | `?category=Electronics` (optional) | `{ products: Product[], total: number }` | — |
| GET | `/products/:id` | — | `Product` | 404 |

### Cart

| Method | Path | Body | Response | Errors |
|--------|------|------|----------|--------|
| GET | `/cart/:sessionId` | — | `{ items: CartItem[], total_price: number, item_count: number }` | — |
| POST | `/cart` | `{ session_id, product_id, quantity? }` | `CartItem` (201) | 404 product, 422 |
| DELETE | `/cart/:sessionId/:itemId` | — | 204 No Content | 404 |

### Reviews (SL-17 — currently stub, returns 501)

| Method | Path | Body | Response | Errors |
|--------|------|------|----------|--------|
| GET | `/products/:productId/reviews` | — | `{ reviews: Review[], average_rating: number, total_reviews: number }` | 404 product |
| POST | `/products/:productId/reviews` | `{ reviewer_name, rating (1–5), comment? }` | `Review` (201) | 409 duplicate, 422, 404 product |

### System

| Method | Path | Response |
|--------|------|---------|
| GET | `/health` | `{ status: 'ok' }` |
| GET | `/api-docs` | Swagger UI |

---

## TypeScript Configuration

File: `backend/tsconfig.json`

**Strict settings enabled:**

| Setting | Effect |
|---------|--------|
| `strict: true` | Enables all strict type checks |
| `noUnusedLocals: true` | Error on declared-but-unused variables |
| `noUnusedParameters: true` | Error on unused function parameters (prefix with `_` to suppress) |
| `noImplicitReturns: true` | All code paths must have a return statement |
| `noFallthroughCasesInSwitch: true` | Switch cases must break or return |

**Rules enforced by config:**
- No `any` types — ever
- All functions must have explicit return types
- `interface` for object shapes, `type` for unions/aliases
- Unused parameters: prefix with `_` (e.g. `_next: NextFunction`, `_req: Request`)

**Known `@types/express@^5` quirk:**
`req.params` and `req.query` return `string | string[]` (not just `string`). Always access params using bracket notation and wrap with `String()`:
```typescript
// Correct
const id = parseInt(String(req.params['id'] ?? ''), 10)
const category = req.query['category'] ? String(req.query['category']) : undefined

// Wrong (TypeScript error with @types/express@^5)
const id = parseInt(req.params.id, 10)
```

---

## Environment Configuration

File: `backend/src/config/env.ts`

All environment variables are accessed through a typed `env` object. The `required()` helper throws at startup if a mandatory variable is missing — no silent undefined values.

```typescript
export const env = {
  port: parseInt(process.env['PORT'] ?? '8000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  databaseUrl: required('DATABASE_URL'),   // throws if missing
  isProduction: process.env['NODE_ENV'] === 'production',
  isDevelopment: process.env['NODE_ENV'] !== 'production',
}
```

**Environment files:**
- `backend/.env` — development (`DATABASE_URL`, `DATABASE_URL_TEST`)
- Never committed to git

---

## Logging

Two loggers run in parallel:
- **pino-http** (`src/middleware/requestLogger.ts`) — structured JSON logging, colourised in dev
- **morgan** — concise `dev` format for quick reading in terminal

Log levels:
- `info` — successful requests
- `warn` — 4xx responses
- `error` — 5xx responses (with full error object)

The `logger` export from `requestLogger.ts` is used in `errorHandler.ts` for unhandled errors.

---

## PrismaClient Singleton

File: `backend/src/lib/prisma.ts`

A single `PrismaClient` instance is shared across the entire process:

```typescript
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({ log: isDevelopment ? ['warn', 'error'] : ['error'] })

if (isDevelopment) globalForPrisma.prisma = prisma
```

**Rule:** Never call `new PrismaClient()` anywhere else. Import `prisma` from `src/lib/prisma.ts`. The singleton is passed into repositories via constructor injection.
