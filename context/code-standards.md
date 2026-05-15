# Code Standards

## General

- Keep modules small and single-purpose
- Fix root causes, do not layer workarounds
- Do not mix unrelated concerns in one component or route

## JavaScript

- The project uses JavaScript with `jsconfig.json` (not TypeScript)
- Use JSDoc for complex function signatures where clarity helps
- Validate unknown external input at system boundaries before trusting it
- Prefer `async/await` over raw Promises for readability

## Next.js

- Default to Server Components; add `"use client"` only when browser interactivity requires it
- Keep route handlers focused on a single responsibility
- Use `export const dynamic = "force-dynamic"` only where fresh data is strictly required
- Prefer server actions in `app/lib/` over API routes for data mutations

## Styling

- Use Tailwind CSS v4 utility classes; reference custom theme tokens via `bg-background`, `text-navy`, etc.
- All design tokens are defined in `globals.css` as CSS custom properties under `:root` and `@theme inline`
- No hardcoded hex values in component code — always use theme tokens
- Follow the Luxe Heritage border radius and spacing scales implicitly defined in the existing components

## API Routes

- Validate and parse request input before any logic runs
- Enforce auth and ownership before any mutation
- Return consistent, predictable response shapes (JSON with explicit status)

## Data and Storage

- Metadata belongs in PostgreSQL via Prisma
- Large generated content and images belong in Cloudinary or Vercel Blob
- Do not store large content directly in the database
- Use Vercel KV caching for read-heavy data (product lists, categories, site content)
- **When mapping Prisma results for client components, explicitly map every field** — `...p` spread loses relations (`category`, `tags`, etc.) because Prisma returns them via getters on the prototype, not as enumerable own properties

## File Organization

- `app/(admin)/` — Admin dashboard pages and layouts
- `app/api/` — API route handlers (chat, upload, site-content)
- `app/components/` — Reusable UI components
- `app/lib/` — Server actions, database client, stores, contexts, utilities
- `prisma/` — Schema and migrations
- `public/` — Static assets
