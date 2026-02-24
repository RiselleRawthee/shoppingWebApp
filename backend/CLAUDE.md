# ShopLite Backend — Node.js/Express Standards

## Stack
Node.js 20 + Express 4 + TypeScript (strict) + Prisma ORM + PostgreSQL + Zod + Jest

## Architecture — Layered (Repository → Service → Controller → Router)

```
Request → Router → Controller → Service → Repository → Prisma → PostgreSQL
```

- **Router** (`src/routers/`) — route definitions only. Binds HTTP paths to controller methods.
- **Controller** (`src/controllers/`) — thin HTTP layer. Parses request, calls service, returns response. Always calls `next(err)` on failure.
- **Service** (`src/services/`) — business logic. Throws `AppError` for all expected failures (404, 409, 422, 501). No Prisma calls here.
- **Repository** (`src/repositories/`) — pure Prisma queries. No business logic, no error throwing.
- **Schemas** (`src/schemas/`) — Zod schemas with `.openapi()` extensions. Used for both request validation and OpenAPI spec generation.

## Error Handling
- **Always** use `AppError` for user-facing errors: `throw new AppError('Product not found', 404)`
- **Never** expose internal error details — unknown errors return `{ message: 'Internal server error' }`
- Controllers call `next(err)` and let the global `errorHandler` middleware format the response
- HTTP status codes: 200 (ok), 201 (created), 204 (deleted), 404 (not found), 409 (conflict), 422 (validation), 501 (not implemented)

## TypeScript Standards
- Strict mode enabled. **No `any` types. Ever.**
- All functions must have explicit return types.
- Use `interface` for object shapes, `type` for unions/aliases.
- Unused variables prefixed with `_` to satisfy `noUnusedParameters`.

## Validation
- All request bodies validated with Zod via the `validate(schema)` middleware.
- Zod schemas live in `src/schemas/` and are extended with `.openapi()` for Swagger docs.
- **Never** trust raw `req.body` — always run it through a schema first.

## Swagger / API Docs
- OpenAPI spec is generated from Zod schemas using `@asteasolutions/zod-to-openapi`.
- Docs served at `GET /api-docs`.
- When adding a new endpoint: add Zod schema → register path in `src/docs/swagger.ts` → the spec auto-updates.

## Database
- Prisma schema in `prisma/schema.prisma`. Run `npm run db:migrate` after any model changes.
- PrismaClient is a singleton in `src/lib/prisma.ts` — never instantiate it elsewhere.
- Seed data: `npm run db:seed`

## Testing
- **Unit tests** (`tests/unit/`) — test service layer with `jest-mock-extended` mocks. No DB required.
- **Integration tests** (`tests/integration/`) — test full HTTP stack with Supertest against real test DB (`DATABASE_URL_TEST`).
- Coverage threshold: 80% across statements, branches, functions, lines.

## Linting
- ESLint with TypeScript rules. Run: `npm run lint` or `npm run lint:fix`
- Runs automatically via Husky pre-commit hook.

## Key Commands
```bash
# From backend/
npm run dev              # start dev server with hot reload (tsx watch)
npm run build            # compile TypeScript to dist/
npm run test:unit        # unit tests (fast, no DB)
npm run test:integration # integration tests (requires docker-compose up -d)
npm test                 # all tests
npm run lint             # ESLint
npm run db:migrate       # apply Prisma migrations
npm run db:seed          # seed 10 products
npm run db:studio        # open Prisma Studio (DB GUI)
```
