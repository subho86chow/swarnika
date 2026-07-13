# Architecture Context

## Stack

| Layer     | Technology                        | Role                                           |
| --------- | --------------------------------- | ---------------------------------------------- |
| Framework | Next.js 16.2.1 + React 19 (JS)    | App Router, SSR/SSG, API routes                |
| UI        | Tailwind CSS v4 + custom CSS vars | Styling, design tokens, responsive layout      |
| Auth      | Clerk                             | User authentication, session management        |
| Database  | Prisma 5.14 + PostgreSQL          | Relational data, transactions                  |
| Cache     | Vercel KV                         | Cached product lists, categories, site content |
| Images    | Cloudinary + Vercel Blob          | Product images, hero slides, category images   |
| AI        | AI SDK + OpenRouter               | Customer support chatbot                       |
| Payments  | Razorpay Standard Checkout        | Order payment, verification, refunds           |
| Delivery  | Delhivery B2C API + cron-job.org  | Pincode serviceability, shipment creation, pickup request (PUR), packing slip, tracking, cancel, webhook, cron-based status polling |
| Fonts     | Google Fonts (next/font)          | Cormorant Garamond, Manrope                    |

## System Boundaries

- `app/(admin)/` — Admin dashboard pages, layout, and server actions. Protected by admin email check.
- `app/api/` — API routes for chat (AI), site-content mutations, image uploads, Razorpay orders/verification, Delhivery pincode proxy, and order creation.
- `app/components/` — Shared React components used across public pages (Navbar, Footer, ProductCard, etc.).
- `app/lib/` — Database client, server actions, Zustand stores, React contexts, and cache utilities.
- `prisma/` — Schema definition and database migrations.
- `public/` — Static images and assets.

## Storage Model

- **PostgreSQL (via Prisma)**: All relational data — products, categories, tags, cart items, favorites, coupons, coupon usages, hero images, site content, admin emails, recently viewed, addresses, orders, order items.
- **Cloudinary**: Product images, hero images, and category images. URLs stored in the database.
- **Vercel KV**: Cache layer for product lists, categories, site content, and computed bestsellers to reduce DB load.
- **Razorpay**: External payment gateway for order checkout. Order IDs and payment IDs stored in PostgreSQL.
- **Delhivery**: External logistics provider. Waybill numbers, tracking URLs, label URLs, pickup request IDs, and shipment status stored in PostgreSQL. Shipment errors are logged with timestamps for audit. Webhook receives scan events and auto-updates order status. Admin can retry failed shipments, refresh tracking, cancel shipments, and manually override status.
- **Bestseller Engine**: Computed from `OrderItem` aggregates over a 30-day rolling window. Max 3 products. Cached in KV with 2-hour TTL.
- **Product Shipping Attributes**: `weightGrams`, `lengthCm`, `widthCm`, `heightCm` stored on `Product` model. Defaults: 50g, 10×5×10cm. Used to build accurate Delhivery shipment payloads (total weight + 20% packaging buffer, max dimensions across items).

## Auth and Access Model

- Every user signs in via Clerk. Authentication is session-based with Clerk middleware.
- The `AdminEmail` model stores authorized admin emails. Admin routes check the signed-in user's email against this list.
- Cart items, favorites, addresses, and orders are scoped to `userId` (Clerk user ID).
- Coupons can be scoped globally, by category, by product, or to a single user.
- Only admins can mutate product data, categories, hero images, coupons, site content, and view all orders.

## Invariants

1. Route handlers do not run long-lived background work — use server actions for mutations.
2. All image uploads go through Cloudinary; never store binary image data in PostgreSQL.
3. Cache keys must be invalidated on relevant mutations (products, categories, site content).
4. Admin routes must verify the user's email against `AdminEmail` before serving or mutating data.
5. Prisma queries in server components must handle missing records gracefully with fallback values.
6. External API calls (Razorpay, Delhivery) must never block order creation — use graceful fallbacks and log errors.
7. Computed bestsellers are derived from sales data, not stored as tags — recalculated on cache miss, max 3 products.
8. **NEVER spread (`...p`) Prisma results when passing to client components** — relations (`category`, `tags`, etc.) are lost. Explicitly map every field.
9. **Delhivery API field name fidelity** — Use EXACT field names from the API spec. `phone` must be an array, `pin` (not `pincode`), `waybill` (not `waybill_number`).
10. **Shipment failures are non-blocking** — If Delhivery shipment/PUR/label fails, the order still succeeds. Store the error on `Order.shipmentError` for admin review and retry.
11. **Order status lifecycle** — `pending → paid → shipped → delivered` or `cancelled`. Status updates come from three sources: (a) Delhivery webhook scan events, (b) cron-job.org bulk polling via `POST /api/orders/refresh-status`, (c) manual admin override. Timestamps (`shippedAt`, `deliveredAt`, `cancelledAt`) are immutable once set.
12. **Public tracking** — `/track/[waybill]` is a public page with no auth. It calls the backend `/api/track` proxy so the Delhivery token is never exposed to the browser.
13. **Max cart value** — Checkout is disabled when subtotal exceeds ₹50,000. This is enforced on both the cart page and the checkout page.
14. **Product shipping dimensions & weight-based cost** — Shipment payloads use actual `Product.weightGrams/lengthCm/widthCm/heightCm` with a 20% packaging weight buffer. Checkout calculates shipping cost dynamically using the higher of actual weight vs volumetric weight `(L×W×H)/5000` across all items in the cart.
15. **Cron job polling** — `POST /api/orders/refresh-status` runs 4×/day via cron-job.org. It polls Delhivery tracking for all active orders (paid/shipped, <30 days old) in batches of 50 waybills. Protected by `CRON_SECRET`. Same status hierarchy guard as webhook.
16. **Next.js 15+ `params` is a Promise** — In both server and client components, `params` from dynamic routes must be unwrapped with `React.use(params)` before accessing properties like `params.id` or `params.waybill`. Direct destructuring `const { id } = params` will fail silently with `undefined`.
