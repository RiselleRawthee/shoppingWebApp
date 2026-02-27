# ShopLite Backend — Node.js/Express Standards

## Stack

Node.js 20 + Express 4 + TypeScript (strict) + Prisma ORM + PostgreSQL + Zod + Jest + Supertest

See `docs/BACKEND.md` for the full architecture narrative and endpoint reference.
See `backend/tests/CLAUDE.md` for test conventions.
See `backend/prisma/CLAUDE.md` for database and migration conventions.

---

## Architecture — Strict Layered Pattern

```
HTTP Request → Router → [validate middleware] → Controller → Service → Repository → Prisma → PostgreSQL
                                                                    ↓ AppError thrown
                                                              errorHandler middleware
```

Each layer has one job and must not exceed it:

### Router (`src/routers/`)
- Route bindings **only** — no logic, no business rules, no inline validation
- Pattern: `router.verb('/path', validate(Schema), controller.method)`
- Receives a typed controller via factory function parameter (DI)

### Controller (`src/controllers/`)
- Parse `req.params`, `req.query`, `req.body` → call service → send response
- **Always** use arrow function methods (preserves `this` binding for Express)
- **Always** wrap in `try/catch` and call `next(err)` on failure — never `throw`, never `res.status(500)`
- **Never** call Prisma directly. **Never** contain business logic.

### Service (`src/services/`)
- All business logic lives here and **only** here
- **Always** throws `AppError` for every expected failure (404, 409, 422, 501)
- **Never** calls `prisma` directly — always goes through the injected repository
- **Never** accesses `req`, `res`, or any HTTP concept

### Repository (`src/repositories/`)
- Pure Prisma queries — one method per database operation
- **Always** returns data or `null` — never throws, never makes business decisions
- **Never** calls `throw`. If Prisma throws, let it propagate naturally to the service.

### Schemas (`src/schemas/`)
- Zod schemas with `.openapi()` annotations — single source for validation and Swagger
- See "Validation" and "Swagger" sections below

---

## Adding a New Resource — Step-by-Step

When implementing a new entity (e.g. `Order`), follow this order exactly:

```
1.  backend/prisma/schema.prisma          add model, run npm run db:migrate
2.  src/repositories/order.repository.ts  class with PrismaClient injection
3.  src/services/order.service.ts         class with Repository injection
4.  src/controllers/order.controller.ts   class with Service injection (arrow methods)
5.  src/schemas/order.schema.ts           Zod request + response schemas with .openapi()
6.  src/routers/order.router.ts           createOrderRouter(controller) factory
7.  src/routers/index.ts                  add order router to createRootRouter
8.  src/docs/swagger.ts                   register schemas + register paths
9.  src/app.ts                            wire Repo → Service → Controller → Router
10. tests/unit/order.service.test.ts      mockDeep unit tests
11. tests/integration/order.test.ts       supertest integration tests
```

Never skip step 8 — the Swagger spec must always be up to date.

---

## Error Handling

### AppError
```typescript
// src/errors/AppError.ts — always use this for user-facing errors
throw new AppError('Product not found', 404)
throw new AppError('A review from this reviewer already exists', 409)
throw new AppError('Rating must be between 1 and 5', 422)
throw new AppError('Not implemented', 501)
```

### Global errorHandler (src/middleware/errorHandler.ts)
Registered as the **last** middleware in `app.ts`. Handles three cases:
- `AppError` → `res.status(err.statusCode).json({ message: err.message })`
- `ZodError` → `res.status(422).json({ message: 'Validation error', errors: [{field, message}] })`
- Unknown → `res.status(500).json({ message: 'Internal server error' })` + pino log

### HTTP Status Codes

| Code | Use case |
|------|---------|
| 200 | Successful GET |
| 201 | Successful POST — return the created resource |
| 204 | Successful DELETE — no body |
| 404 | Resource not found |
| 409 | Conflict — e.g. unique constraint violation (duplicate reviewer) |
| 422 | Validation failure or business rule violation |
| 501 | Stub / not yet implemented |
| 500 | Unexpected internal error (never throw this manually) |

### Prisma Unique Constraint → 409 Pattern
When creating a resource that has a unique constraint, catch Prisma's P2002 error in the service:
```typescript
import { Prisma } from '@prisma/client'

try {
  return await this.repo.create(data)
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new AppError('A review from this reviewer already exists for this product', 409)
  }
  throw error  // re-throw anything unexpected
}
```

---

## Validation

All request bodies must pass through the `validate(schema)` middleware before the controller runs.

```typescript
// In router — validate is applied per-route, before the controller method
router.post('/', validate(CreateReviewRequestSchema), controller.create)
router.put('/:id', validate(UpdateOrderSchema), controller.update)
```

The `validate` middleware:
1. Calls `schema.parse(req.body)` — Zod parses and coerces the body
2. Replaces `req.body` with the typed, parsed result
3. Returns 422 with field-level errors on failure

**Never** access `req.body` without first running it through a Zod schema.

---

## Swagger / OpenAPI Registration Checklist

Every new endpoint requires all three of these steps — missing any one breaks the Swagger UI:

**Step 1 — Define Zod schema in `src/schemas/`:**
```typescript
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
extendZodWithOpenApi(z)   // call once per schema file

export const CreateReviewRequestSchema = z.object({
  reviewer_name: z.string().min(1).openapi({ example: 'Jane Doe' }),
  rating: z.number().int().min(1).max(5).openapi({ example: 4 }),
  comment: z.string().optional().openapi({ example: 'Great product!' }),
}).openapi('CreateReviewRequest')   // name shown in Swagger UI
```

**Step 2 — Register the schema in `src/docs/swagger.ts`:**
```typescript
registry.register('CreateReviewRequest', CreateReviewRequestSchema)
```

**Step 3 — Register the path in `src/docs/swagger.ts`:**
```typescript
registry.registerPath({
  method: 'post',
  path: '/products/{productId}/reviews',
  tags: ['Reviews'],
  request: { body: { content: { 'application/json': { schema: CreateReviewRequestSchema } } } },
  responses: {
    201: { description: 'Review created', content: { 'application/json': { schema: ReviewResponseSchema } } },
    409: { description: 'Duplicate reviewer' },
    422: { description: 'Validation error' },
  },
})
```

---

## TypeScript Standards

Strict mode is enabled. Violations cause build failures — fix them, do not suppress.

- **No `any` types — ever.** Use `unknown` and narrow, or define a proper interface.
- All functions must have explicit return types
- `interface` for object shapes, `type` for unions and aliases
- `noUnusedLocals` and `noUnusedParameters` are both `true`

### req.params / req.query — @types/express@^5 Quirk
`req.params` and `req.query` return `string | string[]` in `@types/express@^5`. Always use bracket notation and wrap with `String()`:
```typescript
// CORRECT
const id = parseInt(String(req.params['id'] ?? ''), 10)
const category = req.query['category'] ? String(req.query['category']) : undefined

// WRONG — TypeScript error with @types/express@^5
const id = parseInt(req.params.id, 10)
const category = req.query.category as string
```

### Unused Parameters — prefix with `_`
```typescript
// noUnusedParameters will error on unused params — prefix with _
const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => { ... }
```

### TS6138 — Unused Private Class Fields
Plain constructor injection avoids the TS6138 error on unused private fields:
```typescript
// CORRECT — TypeScript does not flag this
constructor(private readonly repo: ProductRepository) {}

// WRONG — TS6138 error if _repo is never explicitly used
constructor(private readonly _repo: ProductRepository) {}
```

### ts-jest Imports — No `.js` Extensions
ts-jest compiles to CommonJS. Import paths must not have file extensions:
```typescript
// CORRECT
import { ProductService } from '../../src/services/product.service'

// WRONG — module resolution failure in ts-jest
import { ProductService } from '../../src/services/product.service.js'
```

### jest.config — Must Be `.js` Not `.ts`
ts-jest cannot compile its own configuration file. Use `jest.config.js` (CommonJS format).

---

## Dependency Injection — How It Works

All wiring happens in `src/app.ts` inside `buildApp()`. There is no DI container:

```typescript
// app.ts — manual constructor injection
const productRepo = new ProductRepository(prisma)
const productService = new ProductService(productRepo)
const productController = new ProductController(productService)
// repeat for cart, review, any new resource
```

When adding a new resource, add these three lines (Repo → Service → Controller) and pass the
controller to `createRootRouter`.

---

## Middleware Chain

Order in `app.ts` is significant — do not reorder:

```
helmet()            security headers
cors(...)           restricted to localhost:5173
rateLimit(...)      100 req / 15 min per IP
httpLogger          pino structured logging
morgan('dev')       concise terminal logging
express.json()      JSON body parsing
routes              all API routers
errorHandler        MUST be last
```

---

## Running the App

**Always use Docker Compose from the repo root — never `npm run dev` to serve the application:**
```bash
docker compose up --build   # first run — builds images, runs migrations, seeds DB, starts all services
docker compose up           # subsequent runs
```

## Key Commands

```bash
# From backend/ — for development tasks (linting, testing, DB management)
npm run build            # tsc → dist/
npm run test:unit        # Jest unit tests (fast, no DB)
npm run test:integration # Jest integration tests (requires db-test Docker container on localhost:5433)
npm test                 # unit then integration (sequential)
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run db:migrate       # apply Prisma migrations to the Docker dev DB (localhost:5432)
npm run db:seed          # seed 10 products into the Docker dev DB
npm run db:studio        # Prisma Studio GUI — connects to localhost:5432
```
