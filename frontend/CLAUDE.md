# ShopLite Frontend — React/TypeScript Standards

## Stack
React 18 + TypeScript (strict) + Vite + Tailwind CSS. No class components (except `ErrorBoundary`). No `.js` or `.jsx` files — TypeScript only.

## Folder Structure
- `src/ui/` — page-level components (one per route). These compose reusable components. No logic here beyond wiring hooks to UI.
- `src/components/` — reusable feature components (`ProductCard`, `CartItemRow`, `CategoryFilter`, etc.)
- `src/components/ui/` — atomic/primitive components (`Button`, `Badge`, `Price`, `StockBadge`, `ProductImage`, `LoadingSpinner`, `ErrorAlert`, `EmptyState`, `BackLink`)
- `src/hooks/` — custom hooks for data fetching and state
- `src/api/` — API client (axios)
- `src/types/` — shared TypeScript interfaces

**Rule: never put reusable UI in `src/ui/`. Never put page-level logic in `src/components/`.**

## Component Standards
- Functional components only (except `ErrorBoundary`), with explicit TypeScript prop types.
- One component per file. File name matches component name (`PascalCase`).
- Props interface defined inline above the component: `interface Props { ... }`
- **No inline styles**. Use Tailwind utility classes only.
- No data fetching or business logic in components — extract to hooks.

## Hooks
- Custom hooks live in `src/hooks/`. Naming: `use{Entity}.ts`
- Hooks own: data fetching, loading state, error state, and side-effect logic.
- Components call hooks; hooks call `src/api/client.ts`.
- Never call the API directly from a component.

## TypeScript Standards
- Strict mode is enabled. **No `any` types. Ever.**
- All API response types must be defined in `src/types/index.ts`.
- Prefer `interface` over `type` for object shapes.
- Event handlers should be named `handle{Event}` (e.g. `handleSubmit`, `handleAddToCart`).

## Environment Variables
- API base URL comes from `import.meta.env.VITE_API_URL` — never hardcode localhost.
- All Vite env vars are prefixed `VITE_` and defined in `frontend/.env`.

## Testing
- Vitest + React Testing Library. Test files co-located: `{Component}.test.tsx` beside `{Component}.tsx`.
- Test user behaviour, not implementation details. Never assert on internal state.
- Mock hooks in page-level (`src/ui/`) tests using `vi.mock`.

## Linting
- ESLint config in `eslint.config.js`. Runs automatically via Husky pre-commit hook.
- Run manually: `npm run lint`

## Key Commands
```bash
# From frontend/
npm run dev      # start dev server
npm test         # run Vitest
npm run lint     # run ESLint
npm run build    # production build (runs tsc + vite build)
```
