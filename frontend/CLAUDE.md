# ShopLite Frontend — React/TypeScript Standards

## Stack
React 18 + TypeScript + Vite + Tailwind CSS. No class components. No `.js` or `.jsx` files — TypeScript only.

## Component Standards
- Functional components only, with explicit TypeScript prop types.
- One component per file. File name matches component name (`PascalCase`).
- Props interface defined inline above the component: `interface Props { ... }`
- **No inline styles**. Use Tailwind utility classes only.
- Components live in `src/components/`. No data fetching or business logic in components — extract to hooks.

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

## Naming Conventions
- Components: `PascalCase`
- Hooks: `camelCase` starting with `use`
- Types / interfaces: `PascalCase`
- Files: match the primary export name

## Testing
- Vitest + React Testing Library. Test files: `{Component}.test.tsx`
- Test user behaviour, not implementation details. Never assert on internal state.

## Linting
- ESLint config in `eslint.config.js`. Runs automatically via hooks after every `.ts`/`.tsx` edit.
- You will see `[Hook] eslint: OK` fire automatically.
- Run manually: `npx eslint src/ --fix`

## Key Commands
```bash
# From frontend/
npm run dev      # start dev server
npm test         # run Vitest
npm run lint     # run ESLint
npm run build    # production build
```
