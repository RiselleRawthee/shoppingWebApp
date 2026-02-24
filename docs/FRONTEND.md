# ShopLite — Frontend Architecture

## Overview

The frontend is a React 18 single-page application written in strict TypeScript, bundled with Vite, and styled with Tailwind CSS. State is managed entirely through custom React hooks — no Redux, Zustand, or Context API.

Entry point: `frontend/src/main.tsx`
Root component: `frontend/src/App.tsx`

---

## Directory Structure

```
frontend/src/
├── ui/                    Page-level components (one per route)
│   ├── ProductList.tsx        Browse catalogue with category filter
│   ├── ProductDetail.tsx      Product detail, add-to-cart, reviews
│   ├── Cart.tsx               Cart contents and total
│   └── NotFoundPage.tsx       404 fallback
├── components/            Reusable feature components
│   ├── ProductCard.tsx        Product card in grid view
│   ├── CartItemRow.tsx        Single row in cart list
│   ├── CategoryFilter.tsx     Pill button category selector
│   ├── ReviewSection.tsx      Reviews (SL-17 stub)
│   ├── ErrorBoundary.tsx      Class component — catches render errors
│   └── ui/                Atomic UI primitives
│       ├── Button.tsx         Primary / danger / ghost / pill variants
│       ├── Badge.tsx          Category / success / danger label
│       ├── Price.tsx          Formatted price (South African Rand)
│       ├── StockBadge.tsx     "N in stock" or "Out of stock"
│       ├── LoadingSpinner.tsx Centred loading message
│       ├── ErrorAlert.tsx     Red error banner
│       ├── EmptyState.tsx     Empty state with optional action link
│       ├── ProductImage.tsx   Image with optional hover-zoom
│       └── BackLink.tsx       Styled back-navigation link
├── hooks/                 Custom hooks (data + state)
│   ├── useProducts.ts         useProducts(category?) + useProduct(id)
│   ├── useCart.ts             Cart CRUD with session management
│   └── useReviews.ts          TODO stub — SL-17
├── api/
│   └── client.ts              Axios client with typed API methods
├── types/
│   └── index.ts               All shared TypeScript interfaces
├── test/
│   └── setup.ts               Vitest setup (imports @testing-library/jest-dom)
├── App.tsx                BrowserRouter + NavBar + Routes + ErrorBoundary
├── main.tsx               ReactDOM.createRoot entry point
└── index.css              Tailwind base/components/utilities directives
```

---

## Component Hierarchy

```
App.tsx
├── BrowserRouter
│   ├── NavBar (sticky header, active-route highlighting)
│   └── main (max-w-7xl container)
│       └── ErrorBoundary
│           └── Routes
│               ├── / → ProductList
│               │   ├── CategoryFilter
│               │   └── ProductCard (×N)
│               │       ├── ProductImage
│               │       ├── Badge
│               │       ├── Price
│               │       └── StockBadge
│               ├── /products/:id → ProductDetail
│               │   ├── BackLink
│               │   ├── ProductImage
│               │   ├── Badge
│               │   ├── Price
│               │   ├── StockBadge
│               │   ├── Button (Add to Cart)
│               │   └── ReviewSection       ← SL-17 stub
│               ├── /cart → Cart
│               │   ├── CartItemRow (×N)
│               │   │   ├── ProductImage
│               │   │   └── Price
│               │   └── Price (total)
│               └── * → NotFoundPage
│                   └── EmptyState
```

---

## Data Flow

```
Page (src/ui/)
    │  calls hook
    ▼
Hook (src/hooks/)
    │  calls API method
    ▼
API Client (src/api/client.ts)
    │  axios HTTP request
    ▼
Express Backend (localhost:8000)
```

**Golden rule:** Components never call the API client directly. All network traffic goes through hooks. All side-effect logic lives in hooks.

---

## Routing

Defined in `App.tsx` using React Router v7:

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `ProductList` | Product catalogue with category filter |
| `/products/:id` | `ProductDetail` | Single product detail + add to cart |
| `/cart` | `Cart` | Shopping cart view |
| `*` | `NotFoundPage` | 404 fallback |

**NavBar** highlights the active route by comparing `useLocation().pathname`.

**Parameter extraction pattern:**
```typescript
const { id } = useParams<{ id: string }>()
// then convert to number:
const { product } = useProduct(Number(id))
```

---

## State Management

No global state library. All state is local to hooks.

### useProducts — product list and single product

```
useProducts(category?: string)
  returns: { products, total, loading, error }
  re-fetches when category changes (useEffect dependency)

useProduct(id: number)
  returns: { product, loading, error }
  re-fetches when id changes
```

### useCart — session-based cart

```
useCart()
  returns: { items, totalPrice, itemCount, loading, addToCart, removeFromCart }
```

The cart session ID is generated once at module load time:
```typescript
const SESSION_ID = 'shoplite-session-' + Math.random().toString(36).slice(2)
```

This ID persists for the lifetime of the page session. `addToCart` and `removeFromCart` both call the API then re-fetch the cart state.

### useReviews — SL-17 stub

File exists as a placeholder. When implemented it should expose:
`{ reviews, averageRating, totalReviews, loading, error, submitReview }`

---

## API Client

File: `frontend/src/api/client.ts`

A thin axios wrapper. The base URL is resolved from the Vite environment variable:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})
```

**Exported namespaces:**

```typescript
productsApi.list(category?)   → Promise<ProductListResponse>
productsApi.get(id)           → Promise<Product>

cartApi.get(sessionId)        → Promise<CartResponse>
cartApi.add(payload)          → Promise<CartResponse>
cartApi.remove(sessionId, itemId) → Promise<void>
```

Error handling is left to hooks — the client itself does not catch errors. Hooks catch and set an `error` state string.

---

## TypeScript

All shared types are in `frontend/src/types/index.ts`:

```typescript
Product             { id, name, description, price, image_url, category, stock }
ProductListResponse { products: Product[], total: number }
CartItem            { id, session_id, product_id, quantity, product: Product }
CartResponse        { items: CartItem[], total_price: number, item_count: number }
AddToCartRequest    { product_id, quantity, session_id }
```

Review types are not yet defined — they will be added as part of SL-17.

**Rules:**
- No `any` types
- All API response types defined in `src/types/index.ts`
- Props interface always declared inline above the component as `interface Props { ... }`
- Event handlers named `handle{Event}` (e.g. `handleAddToCart`, `handleCategoryChange`)
- Environment variables: always `import.meta.env.VITE_*` — never hardcode URLs

---

## Styling

Tailwind CSS utility classes only. No inline styles, no CSS modules, no styled-components.

### Layout

```
Container:    max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
Product grid: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
Stack:        space-y-4
Flex row:     flex items-center gap-4
```

### Colour Palette

| Role | Class | Usage |
|------|-------|-------|
| Primary action | `blue-600` | Buttons, links, active states, NavBar brand |
| Success / in-stock | `green-600` | "In stock" badge, checkout button |
| Danger / error | `red-500` | "Out of stock", remove button, error alerts |
| Background | `gray-50` | Page background, image placeholder |
| Borders | `gray-200` | Cards, dividers |
| Text primary | `gray-900` | Headings, product names |
| Text secondary | `gray-500` | Labels, descriptions, counts |

### Variant-based Component Styling

Components with variants use a `Record<variant, className>` lookup to keep conditionals out of JSX:

```typescript
const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
  danger:  'text-red-500 hover:text-red-700 disabled:opacity-50',
  ghost:   'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50',
  pill:    'rounded-full text-sm font-medium transition-colors',
}
```

### Common Patterns

```
Card:         bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow
Active pill:  bg-blue-600 text-white
Inactive pill: bg-gray-100 text-gray-700 hover:bg-gray-200
Hover zoom:   group-hover:scale-105 transition-transform duration-300  (parent must have group class)
Disabled:     disabled:opacity-50 disabled:cursor-not-allowed
```

---

## Components Reference

### Page Components (`src/ui/`)

**ProductList**
- State: `activeCategory` (string | undefined)
- Hook: `useProducts(activeCategory)`
- Renders: `LoadingSpinner` | `ErrorAlert` | `CategoryFilter` + `ProductCard` grid
- Category constants defined locally as `CATEGORIES` array

**ProductDetail**
- Params: `id` from `useParams`
- Hooks: `useProduct(Number(id))`, `useCart()`
- Local state: `added` (boolean — shows "Added to cart!" for 2s)
- Renders: `BackLink`, product image, `Badge`, `Price`, `StockBadge`, `Button`, `ReviewSection`

**Cart**
- Hook: `useCart()`
- Empty state: renders `EmptyState` with link to `/`
- Renders: item count heading, `CartItemRow` list, total `Price`, checkout button (placeholder)

**NotFoundPage**
- No hooks
- Renders: `EmptyState` with link back to `/`

### Composite Components (`src/components/`)

**ProductCard** — `Props: { product: Product, to: string }`
- A React Router `<Link>` wrapping image + badge + name + price + stock
- Uses `group` class for hover-zoom on the image

**CartItemRow** — `Props: { item: CartItem, onRemove: (id: number) => void, loading?: boolean }`
- Thumbnail, product name, quantity, line total, remove button
- Remove button is disabled while `loading`

**CategoryFilter** — `Props: { categories: Category[], activeValue?: string, onChange: (value: string) => void }`
- Renders pill buttons; highlights active via blue-600 class
- Calls `onChange(cat.label)` on click

**ReviewSection** — `Props: { productId: number }` (param named `_productId` in stub)
- SL-17 stub — renders "Reviews coming soon."
- Will be replaced with full review list + submission form

**ErrorBoundary** — class component (only class component in the codebase)
- `getDerivedStateFromError` sets `hasError: true`
- Renders error message with "Try again" button that resets state
- Wraps all routes in `App.tsx`

### Atomic Primitives (`src/components/ui/`)

| Component | Props | Notes |
|-----------|-------|-------|
| `Button` | `variant?, disabled?, loading?, fullWidth?, type?, onClick?` | Shows "Loading..." and disables when `loading` |
| `Badge` | `label, variant?` (category/success/danger) | Text-only, uppercase, small |
| `Price` | `amount, size?` (sm/md/lg), `className?` | Formats as `R{amount.toFixed(2)}` — South African Rand |
| `StockBadge` | `stock` | Green if >0, red if 0 |
| `LoadingSpinner` | `message?` | Centred div with text; no actual spinner animation |
| `ErrorAlert` | `message` | Red bordered box with `role="alert"` |
| `EmptyState` | `emoji?, title, message?, action?` | Centred with optional `Link` action |
| `ProductImage` | `src, alt, size?` (thumbnail/card/detail), `hoverZoom?` | Use `hoverZoom` + `group` on parent for zoom effect |
| `BackLink` | `to, label?` | Small blue link, `inline-block` |

---

## Testing

Framework: Vitest + React Testing Library + @testing-library/jest-dom

**Test co-location:** test files sit beside their component:
```
ProductCard.tsx
ProductCard.test.tsx    ← same directory
```

**Setup:** `src/test/setup.ts` imports `@testing-library/jest-dom` to add matchers like `toBeInTheDocument()`.

**Vitest config** in `vite.config.ts`:
```typescript
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  globals: true,          // no need to import describe/it/expect
}
```

**Test patterns:**

```typescript
// Always wrap components that use <Link> in MemoryRouter
render(
  <MemoryRouter>
    <ProductCard product={mockProduct} to="/products/1" />
  </MemoryRouter>
)

// Spy functions: vi.fn() (not jest.fn() — this is Vitest)
const onChange = vi.fn()
fireEvent.click(screen.getByRole('button', { name: 'Electronics' }))
expect(onChange).toHaveBeenCalledWith('Electronics')

// Assert user-visible text, not internal state
expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
expect(screen.getByRole('button')).toBeDisabled()
```

**Tested components** (all have `.test.tsx` files):
`ProductCard`, `CartItemRow`, `CategoryFilter`, `Button`, `Badge`, `Price`, `StockBadge`, `LoadingSpinner`, `ErrorAlert`, `EmptyState`

**Not currently tested:** page components, `ReviewSection`, `ErrorBoundary`, `ProductImage`, `BackLink`, hooks, API client.

---

## Environment Variables

Defined in `frontend/.env` (not committed to git):

```
VITE_API_URL=http://localhost:8000
```

Accessed in code:
```typescript
import.meta.env.VITE_API_URL   // ← always use this form
// Never: 'http://localhost:8000'
```

All Vite environment variables must be prefixed `VITE_` to be exposed to client code.

---

## Build and Tooling

```bash
npm run dev      # Vite dev server with HMR (http://localhost:5173)
npm run build    # tsc type-check + vite build → dist/
npm run preview  # Preview production build locally
npm test         # Vitest (watch mode)
npm test -- --run  # Vitest (single run, for CI)
npm run lint     # ESLint
```

**Vite dev proxy:** `/api/*` requests are proxied to `http://localhost:8000` with the `/api` prefix stripped. This is an alternative to `VITE_API_URL` for local development.

**Pre-commit:** Husky + lint-staged runs `eslint --fix` on all `src/**/*.{ts,tsx}` files before each commit.
