# ShopLite Frontend — React/TypeScript Standards

## Stack

React 18 + TypeScript (strict) + Vite + Tailwind CSS + React Router v7
No class components (except `ErrorBoundary`). No `.js` or `.jsx` files — TypeScript only.

See `docs/FRONTEND.md` for the full component hierarchy and data-flow narrative.

---

## Folder Structure — Golden Rules

```
src/ui/              Page-level components — one per route, not reusable
src/components/      Reusable feature components (ProductCard, CartItemRow, etc.)
src/components/ui/   Atomic primitives (Button, Badge, Price, StockBadge, etc.)
src/hooks/           Custom hooks — own all data fetching and state
src/api/             Axios client — only place that makes HTTP calls
src/types/           Shared TypeScript interfaces — define types HERE first
```

**Rule:** Never put reusable UI in `src/ui/`. Never put page-level logic in `src/components/`.
**Rule:** Components never call the API directly — always through a hook.
**Rule:** Hooks never import from `src/ui/` — dependency flows downward only.

---

## Adding a New Feature — Type-First Order

When implementing a new feature (e.g. Reviews):
```
1. src/types/index.ts            add Review, ReviewListResponse interfaces
2. src/api/client.ts             add reviewsApi.list() and reviewsApi.create()
3. src/hooks/useReviews.ts       create hook returning { reviews, loading, error, submitReview }
4. src/components/ReviewSection.tsx  replace stub with real component
5. src/ui/ProductDetail.tsx      already renders <ReviewSection> — no change needed
6. ReviewSection.test.tsx        add co-located test file
```

---

## Component Standards

### Named Exports Only
```typescript
// CORRECT — named export
export function ProductCard({ product, to }: Props) { ... }

// WRONG — default export (except App.tsx and main.tsx)
export default function ProductCard(...) { ... }
```

### Inline Props Interface — Always Named `Props`
```typescript
// The interface is declared IMMEDIATELY above the function, always named Props
interface Props {
  product: Product
  to: string
}

export function ProductCard({ product, to }: Props) {
  return (...)
}
```

### One Component Per File
File name matches the component name in PascalCase: `ProductCard.tsx` exports `ProductCard`.

### No Inline Styles
Tailwind utility classes only. No `style={{}}`, no CSS modules, no styled-components.

### Async Event Handlers — void Operator Pattern
TypeScript prohibits `onClick` returning a `Promise`. Use the `void` operator:
```typescript
// CORRECT
<Button onClick={() => void handleAddToCart()}>Add to Cart</Button>

// WRONG — TypeScript error: Type 'Promise<void>' is not assignable to type 'void'
<Button onClick={handleAddToCart}>Add to Cart</Button>
```

### Loading / Error / Empty Guard Pattern
Check loading, error, and empty states before the main render (guard clauses):
```typescript
if (loading) return <LoadingSpinner message="Loading products..." />
if (error) return <ErrorAlert message={error} />
if (products.length === 0) return <EmptyState title="No products found" />
return ( /* main JSX */ )
```

---

## Hook Standards

### File Naming
`src/hooks/use{Entity}.ts` — e.g. `useProducts.ts`, `useCart.ts`, `useReviews.ts`

### Standard Return Shape
Every data-fetching hook must return `loading` and `error`:
```typescript
interface UseReviewsResult {
  reviews: Review[]
  averageRating: number
  totalReviews: number
  loading: boolean
  error: string | null
}
```

### Fetch Pattern — Always Reset State First
```typescript
useEffect(() => {
  setLoading(true)
  setError(null)          // clear previous error before every fetch
  reviewsApi.list(productId)
    .then((data) => {
      setReviews(data.reviews)
      setAverageRating(data.average_rating)
      setTotalReviews(data.total_reviews)
    })
    .catch(() => setError('Failed to load reviews'))   // user-friendly string only
    .finally(() => setLoading(false))
}, [productId])            // dependency array must list ALL variables that trigger re-fetch
```

### Mutation Hooks — useCallback Pattern
```typescript
const submitReview = useCallback(async (payload: CreateReviewRequest) => {
  setLoading(true)
  try {
    await reviewsApi.create(productId, payload)
    await fetchReviews()   // re-fetch after mutation
  } finally {
    setLoading(false)
  }
}, [productId, fetchReviews])
```

---

## Styling Standards

### Tailwind — Key Layout Classes
```
Container:    max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
Product grid: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
Card:         bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow
Stack:        space-y-4
Flex row:     flex items-center gap-4
```

### Colour Palette — Stay Consistent
| Role | Tailwind class | Usage |
|------|---------------|-------|
| Primary | `blue-600` | Buttons, active nav, links |
| Success / in-stock | `green-600` | "In stock", checkout |
| Danger / error | `red-500` | "Out of stock", remove, errors |
| Page background | `gray-50` | Body, image placeholders |
| Card border | `gray-200` | Dividers, card outlines |
| Heading text | `gray-900` | Product names, headings |
| Secondary text | `gray-500` | Labels, descriptions |

### Price — Always Use the `<Price>` Component
```typescript
// CORRECT — formats as R299.99 (South African Rand, 2 decimal places)
<Price amount={product.price} size="md" />

// WRONG — never format prices manually
<span>R{product.price}</span>
```

### Variant Components — Record Pattern
When building a component with multiple visual states, use a `Record` lookup. TypeScript will error if you add a new variant but forget to add its classes:
```typescript
const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  danger:  'text-red-500 hover:text-red-700',
}
// TypeScript error if a variant is missing from the Record
```

### Hover Zoom — Requires `group` on Parent
`ProductImage` with `hoverZoom` uses `group-hover:scale-105`. The parent must have the `group` class:
```typescript
// CORRECT
<div className="aspect-square bg-gray-50 overflow-hidden group">
  <ProductImage src={...} alt={...} size="card" hoverZoom />
</div>

// WRONG — hover zoom silently does nothing without group on parent
<div className="aspect-square bg-gray-50 overflow-hidden">
  <ProductImage hoverZoom />
</div>
```

---

## TypeScript Standards

- Strict mode enabled. **No `any` types — ever.**
- All API response types defined in `src/types/index.ts` — add types here first, before implementing
- `interface` for object shapes (not `type`)
- Event handlers named `handle{Event}`: `handleAddToCart`, `handleCategoryChange`, `handleSubmit`
- Environment variables: `import.meta.env.VITE_API_URL` — never hardcode `localhost`
- All Vite env vars must be prefixed `VITE_` and defined in `frontend/.env`

---

## Testing Standards

Framework: Vitest + React Testing Library + @testing-library/jest-dom

### Test File Location
Co-located beside the component, same directory:
```
src/components/ProductCard.tsx
src/components/ProductCard.test.tsx    ← same directory
```

### vi.fn() — Not jest.fn()
This codebase uses Vitest, not Jest. The mock function is `vi.fn()`:
```typescript
// CORRECT
const onChange = vi.fn()
expect(onChange).toHaveBeenCalledWith('Electronics')

// WRONG — jest is not defined in Vitest
const onChange = jest.fn()
```

### MemoryRouter — Required for Link/useNavigate Components
Any component that uses `<Link>`, `<NavLink>`, or `useNavigate` must be wrapped in `<MemoryRouter>`:
```typescript
render(
  <MemoryRouter>
    <ProductCard product={mockProduct} to="/products/1" />
  </MemoryRouter>
)
```

### Test User Behaviour, Not Implementation
```typescript
// CORRECT — assert what the user sees
expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
expect(screen.getByRole('link')).toHaveAttribute('href', '/products/1')
expect(screen.getByRole('button')).toBeDisabled()

// WRONG — never assert on internal state or CSS implementation details
expect(component.state.loading).toBe(false)
expect(wrapper.find('.text-blue-600')).toHaveLength(1)
```

### Page-Level Tests — Mock the Hook
When testing `src/ui/` page components, mock the hook, not the underlying API client:
```typescript
vi.mock('../../hooks/useProducts', () => ({
  useProducts: () => ({ products: [mockProduct], total: 1, loading: false, error: null }),
}))
```

### Mock Product Template
Use this minimal shape for mock data:
```typescript
const mockProduct: Product = {
  id: 1,
  name: 'Wireless Headphones',
  description: 'Premium headphones',
  price: 299.99,
  image_url: 'https://example.com/img.jpg',
  category: 'Electronics',
  stock: 25,
}
```

---

## Running the App

**Always use Docker Compose from the repo root — never `npm run dev` to serve the application:**
```bash
docker compose up --build   # first run — builds and serves frontend at http://localhost:5173
docker compose up           # subsequent runs
```

## Key Commands

```bash
# From frontend/ — for development tasks (linting, testing, type-checking)
npm test           # Vitest watch mode
npm test -- --run  # Vitest single run (CI)
npm run lint       # ESLint check
npm run build      # tsc type-check + Vite production build
```

Pre-commit: Husky + lint-staged auto-runs `eslint --fix` on all `src/**/*.{ts,tsx}` files.
