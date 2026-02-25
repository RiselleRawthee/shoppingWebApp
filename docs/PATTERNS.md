# ShopLite — Design Patterns Reference

This document captures the recurring patterns used throughout the codebase. When adding new functionality, follow these patterns exactly to maintain consistency.

---

## Backend Patterns

### 1. Repository Pattern

Repositories are pure data-access objects. They wrap Prisma queries and return data or `null`. They never throw errors, never contain business logic, and never know about HTTP.

```typescript
// src/repositories/product.repository.ts
import { PrismaClient, Product, Prisma } from '@prisma/client'

export class ProductRepository {
  // Constructor receives PrismaClient via dependency injection
  constructor(private readonly db: PrismaClient) {}

  // Returns data or null — never throws
  async findById(id: number): Promise<Product | null> {
    return this.db.product.findUnique({ where: { id } })
  }

  // Optional filter via argument — repository stays general-purpose
  async findAll(category?: string): Promise<Product[]> {
    return this.db.product.findMany({
      where: category ? { category } : undefined,
      orderBy: { id: 'asc' },
    })
  }

  // Create returns the created record
  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.db.product.create({ data })
  }
}
```

**Rules:**
- Constructor always takes `PrismaClient` (or a scoped client type)
- Method names: `findById`, `findAll`, `findByX`, `create`, `update`, `delete`
- Return type is always `T`, `T | null`, or `T[]` — never `void` on reads
- Never call `throw` — let Prisma errors propagate naturally up to the service

---

### 2. Service Pattern

Services contain all business logic. They receive repositories via constructor injection and throw `AppError` for every expected failure. They never access `req`/`res` or instantiate Prisma.

```typescript
// src/services/product.service.ts
import { Product } from '@prisma/client'
import { AppError } from '../errors/AppError'
import type { ProductRepository } from '../repositories/product.repository'

export class ProductService {
  // Constructor receives Repository — not PrismaClient
  constructor(private readonly repo: ProductRepository) {}

  async listProducts(category?: string): Promise<{ products: Product[]; total: number }> {
    const products = await this.repo.findAll(category)
    return { products, total: products.length }
  }

  async getProduct(id: number): Promise<Product> {
    const product = await this.repo.findById(id)
    // All expected failures use AppError with an HTTP status code
    if (!product) throw new AppError('Product not found', 404)
    return product
  }
}
```

**Rules:**
- Constructor takes the repository interface — enables easy mocking in unit tests
- Use `throw new AppError(message, statusCode)` for all expected failures
- Use standard HTTP status codes: 404 (not found), 409 (conflict), 422 (business rule violation)
- Never call `prisma` directly — always go through the repository
- Never return HTTP responses or set status codes

---

### 3. Controller Pattern

Controllers are thin HTTP adapters. They parse the request, call the service, and send the response. All errors are forwarded to `next(err)` — no error formatting in controllers.

```typescript
// src/controllers/product.controller.ts
import { Request, Response, NextFunction } from 'express'
import type { ProductService } from '../services/product.service'

export class ProductController {
  constructor(private readonly service: ProductService) {}

  // Arrow function syntax — preserves `this` when used as route handler
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Always use String() when accessing req.params or req.query
      // @types/express@^5 returns string | string[] for both
      const category = req.query['category'] ? String(req.query['category']) : undefined
      const result = await this.service.listProducts(category)
      res.json(result)
    } catch (err) {
      next(err)   // Never throw — always next(err)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(String(req.params['id'] ?? ''), 10)
      const product = await this.service.getProduct(id)
      res.json(product)
    } catch (err) {
      next(err)
    }
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.createProduct(req.body)
      res.status(201).json(result)   // 201 for created resources
    } catch (err) {
      next(err)
    }
  }

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(String(req.params['id'] ?? ''), 10)
      await this.service.deleteProduct(id)
      res.status(204).send()         // 204 for successful deletes
    } catch (err) {
      next(err)
    }
  }
}
```

**Rules:**
- Use arrow function syntax for methods so `this` is bound correctly when passed to Express
- Always `try/catch` and always `next(err)` — never `throw` or `res.status(500)`
- Param access: `String(req.params['key'])` (bracket notation + String cast — `@types/express@^5`)
- Status codes: 200 (default GET/POST), 201 (created), 204 (deleted)
- Never format error responses — that belongs to `errorHandler` middleware

---

### 4. Router Pattern

Routers contain only route bindings. Validation middleware is applied inline.

```typescript
// src/routers/product.router.ts
import { Router } from 'express'
import type { ProductController } from '../controllers/product.controller'
import { validate } from '../middleware/validate'
import { CreateProductSchema } from '../schemas/product.schema'

export const createProductRouter = (controller: ProductController): Router => {
  const router = Router()

  // GET routes: no validation middleware needed
  router.get('/', controller.list)
  router.get('/:id', controller.getById)

  // POST/PUT routes: validate body before controller
  router.post('/', validate(CreateProductSchema), controller.create)

  return router
}
```

**Rules:**
- Factory function that receives a typed controller (enables DI)
- Apply `validate(schema)` middleware on routes with a request body
- No business logic, no direct Prisma calls, no error handling

---

### 5. Zod Schema + OpenAPI Pattern

Every request body and API response has a Zod schema. The same schema is used for runtime validation and for Swagger documentation generation.

```typescript
// src/schemas/review.schema.ts
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)  // Must be called once per schema file

// Request body schema — used by validate() middleware
export const CreateReviewRequestSchema = z.object({
  reviewer_name: z.string().min(1).openapi({ example: 'Jane Doe' }),
  rating: z.number().int().min(1).max(5).openapi({ example: 4 }),
  comment: z.string().optional().openapi({ example: 'Great product!' }),
}).openapi('CreateReviewRequest')   // Name appears in Swagger UI

// Response schema — used in swagger.ts to describe the response shape
export const ReviewResponseSchema = z.object({
  id: z.number().int().openapi({ example: 1 }),
  product_id: z.number().int().openapi({ example: 1 }),
  reviewer_name: z.string().openapi({ example: 'Jane Doe' }),
  rating: z.number().int().openapi({ example: 4 }),
  comment: z.string().nullable().openapi({ example: 'Great product!' }),
  created_at: z.string().openapi({ example: '2025-01-01T00:00:00.000Z' }),
}).openapi('ReviewResponse')

// Derive TypeScript type from schema — single source of truth
export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>
```

**Rules:**
- Call `extendZodWithOpenApi(z)` at the top of each schema file
- Use `.openapi({ example: ... })` on every field
- Use `.openapi('SchemaName')` on every exported schema object — this is the name in Swagger UI
- Export both the schema (`*Schema`) and the inferred type (`type *`)
- Register schemas and paths in `src/docs/swagger.ts` — Swagger UI auto-updates

---

### 6. AppError Pattern

```typescript
// Throw with a descriptive message and the appropriate HTTP status code
throw new AppError('Product not found', 404)
throw new AppError('A review from this reviewer already exists for this product', 409)
throw new AppError('Rating must be between 1 and 5', 422)
throw new AppError('Not implemented', 501)

// The global errorHandler in src/middleware/errorHandler.ts handles formatting:
// AppError  → res.status(err.statusCode).json({ message: err.message })
// ZodError  → res.status(422).json({ message: 'Validation error', errors: [...] })
// Unknown   → res.status(500).json({ message: 'Internal server error' }) + log
```

---

## Frontend Patterns

### 7. Component Pattern

Every component is a named export function. Props interface is declared inline above the function.

```typescript
// src/components/ProductCard.tsx
import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { Badge } from './ui/Badge'
import { Price } from './ui/Price'
import { StockBadge } from './ui/StockBadge'
import { ProductImage } from './ui/ProductImage'

// Interface always named Props, always inline above the component
interface Props {
  product: Product
  to: string
}

export function ProductCard({ product, to }: Props) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-gray-50 overflow-hidden">
        <ProductImage src={product.image_url} alt={product.name} size="card" hoverZoom />
      </div>
      <div className="p-4">
        <Badge label={product.category} />
        <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <Price amount={product.price} size="md" />
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </Link>
  )
}
```

**Rules:**
- Named exports only (no default exports for components)
- `interface Props { ... }` declared immediately above the function
- No inline styles — Tailwind utilities only
- No data fetching inside components — use hooks
- No direct API calls — hooks call the API client

---

### 8. Variant Styling Pattern

Components with multiple visual variants use a `Record<variant, className>` lookup:

```typescript
// src/components/ui/Button.tsx
interface Props {
  children: React.ReactNode
  variant?: 'primary' | 'danger' | 'ghost' | 'pill'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

// Record ensures all variants are covered (TypeScript error if one is missing)
const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
  danger:  'text-red-500 hover:text-red-700 disabled:opacity-50',
  ghost:   'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50',
  pill:    'rounded-full text-sm font-medium transition-colors',
}

export function Button({ children, variant = 'primary', disabled = false, loading = false, fullWidth = false, type = 'button', onClick }: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`py-2 px-4 rounded-xl font-semibold transition-colors ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}
```

**Rules:**
- Default variant is always specified (e.g. `variant = 'primary'`)
- `Record<NonNullable<Props['variant']>, string>` — TypeScript enforces all variants are covered
- Keep class strings readable — don't condense to a single enormous ternary

---

### 9. Hook Pattern

Hooks own data fetching, loading state, and error state. They are the only place that calls the API client.

```typescript
// src/hooks/useProducts.ts
import { useState, useEffect } from 'react'
import { productsApi } from '../api/client'
import type { Product } from '../types'

interface UseProductsResult {
  products: Product[]
  total: number
  loading: boolean
  error: string | null
}

export function useProducts(category?: string): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    productsApi
      .list(category)
      .then((data) => {
        setProducts(data.products)
        setTotal(data.total)
      })
      .catch(() => setError('Failed to load products'))  // user-friendly message only
      .finally(() => setLoading(false))
  }, [category])   // re-fetch when category changes

  return { products, total, loading, error }
}
```

**Rules:**
- Named export, file named `use{Entity}.ts`
- Always return `{ ..., loading: boolean, error: string | null }`
- `setLoading(true)` and `setError(null)` at the start of every fetch
- `.catch(() => setError('...')` — user-friendly message, not the raw error object
- Dependency array in `useEffect` must list all variables that trigger a re-fetch
- Mutation hooks (addToCart, removeFromCart) use `useCallback` with `fetchX` as a dependency

---

### 10. Page Component Pattern

Page components (in `src/ui/`) wire hooks to the UI. They handle the loading/error/empty states.

```typescript
// src/ui/ProductList.tsx
import { useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { CategoryFilter } from '../components/CategoryFilter'
import { ProductCard } from '../components/ProductCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorAlert } from '../components/ui/ErrorAlert'

const CATEGORIES = [
  { label: 'All' },
  { label: 'Electronics' },
  { label: 'Furniture' },
  { label: 'Lighting' },
  { label: 'Accessories' },
]

export function ProductList() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined)
  const { products, total, loading, error } = useProducts(activeCategory)

  // Event handlers named handle{Event}
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat === 'All' ? undefined : cat)
  }

  // Loading and error states handled before main render
  if (loading) return <LoadingSpinner message="Loading products..." />
  if (error) return <ErrorAlert message={error} />

  return (
    <div>
      <CategoryFilter categories={CATEGORIES} activeValue={activeCategory} onChange={handleCategoryChange} />
      <p className="text-sm text-gray-500 mb-4">{total} products</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} to={`/products/${product.id}`} />
        ))}
      </div>
    </div>
  )
}
```

**Rules:**
- No reusable components live in `src/ui/` — pages are not imported by other pages or components
- Handle loading, error, and empty states early (guard clauses before main return)
- Event handlers named `handle{Event}` (camelCase)
- Data constants (like CATEGORIES) defined at the module level, not inside the component

---

## Testing Patterns

### 11. Backend Unit Test Pattern

Unit tests cover the service layer. Repositories are mocked with `jest-mock-extended`.

```typescript
// tests/unit/product.service.test.ts
import { mockDeep, MockProxy } from 'jest-mock-extended'
import { Product } from '@prisma/client'
import type { ProductRepository } from '../../src/repositories/product.repository'
import { ProductService } from '../../src/services/product.service'

// Mock product for reuse across tests
const mockProduct: Product = {
  id: 1,
  name: 'Test Product',
  description: 'A test product',
  price: 99.99,
  image_url: 'https://example.com/image.jpg',
  category: 'Electronics',
  stock: 10,
}

describe('ProductService', () => {
  let repo: MockProxy<ProductRepository>
  let service: ProductService

  beforeEach(() => {
    repo = mockDeep<ProductRepository>()   // creates typed mock
    service = new ProductService(repo)
    // No need to clearAllMocks — mockDeep creates fresh mocks each time
  })

  describe('getProduct', () => {
    it('returns product when found', async () => {
      repo.findById.mockResolvedValue(mockProduct)

      const result = await service.getProduct(1)

      expect(result).toEqual(mockProduct)
      expect(repo.findById).toHaveBeenCalledWith(1)
    })

    it('throws 404 AppError when product not found', async () => {
      repo.findById.mockResolvedValue(null)

      await expect(service.getProduct(99)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Product not found',
      })
    })
  })
})
```

**Rules:**
- Use `mockDeep<RepositoryType>()` from `jest-mock-extended`
- Re-create mocks in `beforeEach` to avoid state leakage between tests
- Assert both the return value and the mock calls (`toHaveBeenCalledWith`)
- For error assertions: `rejects.toMatchObject({ statusCode: N, message: '...' })`
- No database, no HTTP — pure logic testing

---

### 12. Backend Integration Test Pattern

Integration tests cover the full HTTP stack using Supertest against the real test database.

```typescript
// tests/integration/products.test.ts
import request from 'supertest'
import { buildApp } from '../../src/app'
import { clearDatabase, createProduct, testPrisma } from './setup'

const app = buildApp()

beforeEach(async () => {
  await clearDatabase()   // wipes in FK-safe order: reviews → cartItems → products
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

describe('GET /products', () => {
  it('returns empty list when no products exist', async () => {
    const res = await request(app).get('/products').expect(200)
    expect(res.body).toEqual({ products: [], total: 0 })
  })

  it('returns all products', async () => {
    await createProduct({ name: 'Product A' })
    await createProduct({ name: 'Product B' })

    const res = await request(app).get('/products').expect(200)

    expect(res.body.total).toBe(2)
    expect(res.body.products).toHaveLength(2)
  })

  it('filters by category', async () => {
    await createProduct({ category: 'Electronics' })
    await createProduct({ category: 'Furniture' })

    const res = await request(app).get('/products?category=Electronics').expect(200)

    expect(res.body.total).toBe(1)
    expect(res.body.products[0].category).toBe('Electronics')
  })
})

describe('GET /products/:id', () => {
  it('returns 404 for unknown product', async () => {
    const res = await request(app).get('/products/999').expect(404)
    expect(res.body.message).toBe('Product not found')
  })
})
```

**Rules:**
- `buildApp()` is called once per file — it creates a fresh app instance
- `clearDatabase()` in `beforeEach` — always start with a clean slate
- `testPrisma.$disconnect()` in `afterAll`
- Test the HTTP response shape, not internal implementation
- Tests MUST run with `--runInBand` (no parallel workers) — shared test DB

---

### 13. Frontend Component Test Pattern

Frontend tests use Vitest + React Testing Library. Test user-visible behaviour, not implementation.

```typescript
// src/components/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProductCard } from './ProductCard'
import type { Product } from '../types'

// Create a minimal mock object with required fields
const mockProduct: Product = {
  id: 1,
  name: 'Wireless Headphones',
  description: 'Premium headphones',
  price: 299.99,
  image_url: 'https://example.com/img.jpg',
  category: 'Electronics',
  stock: 25,
}

describe('ProductCard', () => {
  // Helper to avoid repeating the render + MemoryRouter wrapper
  const renderCard = () =>
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} to="/products/1" />
      </MemoryRouter>
    )

  it('renders product name', () => {
    renderCard()
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
  })

  it('formats price as South African Rand', () => {
    renderCard()
    expect(screen.getByText('R299.99')).toBeInTheDocument()
  })

  it('links to the correct product URL', () => {
    renderCard()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/1')
  })

  it('calls onChange when category button clicked', () => {
    const onChange = vi.fn()    // vi.fn() — not jest.fn() (this is Vitest)
    render(<CategoryFilter categories={[{ label: 'Electronics' }]} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Electronics' }))
    expect(onChange).toHaveBeenCalledWith('Electronics')
  })
})
```

**Rules:**
- Wrap components that use `<Link>` or `useNavigate` with `<MemoryRouter>`
- Use `vi.fn()` (Vitest) — not `jest.fn()`
- Query by accessible roles and text: `getByRole`, `getByText`, `getByLabelText`
- Avoid querying by class names or implementation details
- Test file lives beside the component: `Button.tsx` + `Button.test.tsx`

---

## Dependency Injection Summary

ShopLite uses manual constructor injection throughout. No DI container.

```
app.ts wires everything:

prisma (singleton)
  └─► ProductRepository(prisma)
        └─► ProductService(productRepo)
              └─► ProductController(productService)
                    └─► productRouter(productController)

  └─► CartRepository(prisma)
        └─► CartService(cartRepo)
              └─► CartController(cartService)
                    └─► cartRouter(cartController)

  └─► ReviewRepository(prisma)
        └─► ReviewService(reviewRepo)
              └─► ReviewController(reviewService)
                    └─► reviewRouter(reviewController)

All routers → createRootRouter() → app.use()
```

This structure makes every layer independently testable by substituting the constructor argument with a mock.
