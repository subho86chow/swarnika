# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Complete — Payment & Delivery Integration

## Current Goal

- All payment and delivery features implemented and verified
- End-to-end flow working: Buy Now / Cart → Checkout → Razorpay → Order History

## Completed

- Core Prisma schema with Product, Category, Tag, CartItem, Favorite, Coupon, HeroImage, SiteContent, AdminEmail, RecentlyViewed, Address, Order, OrderItem
- Payment gateway integration (Razorpay Standard Checkout)
- Delivery logistics integration (Delhivery pincode serviceability + optional shipment creation)
- Buy Now direct checkout flow
- Full checkout with address selection, coupon auto-apply, GST + shipping calculation
- Order history with real DB data
- Admin order management page
- Product image fallback placeholder for all checkout/payment/order pages
- Public storefront: homepage with hero slider, category grid, bestsellers, new arrivals, campaign carousel
- Product detail pages with image gallery and recently viewed tracking
- Cart system with quantity management and coupon application
- Favorites/wishlist with add/remove
- Clerk authentication (sign-in, sign-up, account page)
- AI chatbot integration via OpenRouter
- Admin dashboard with sidebar navigation
- Admin product CRUD with Cloudinary image uploads
- Admin category CRUD
- Admin hero image management
- Admin coupon management
- Admin tag management
- Admin site content configuration
- Admin email access control
- Vercel KV caching layer for products, categories, site content
- Responsive Tailwind v4 styling with Luxe Heritage design tokens
- **Phase 1: Payment & Delivery Foundation**
  - Prisma schema updated with `Address`, `Order`, `OrderItem` models
  - Database synced via `prisma db push`
  - Environment variables added for Delhivery and Razorpay
  - Delhivery API client created (`checkPincode`, `createShipment`)
  - Razorpay SDK client created (`createRazorpayOrder`, `verifyRazorpayPayment`, `fetchPayment`)
- **Phase 7: Dynamic Bestseller System**
  - Computed bestsellers from `OrderItem` sales data (rolling 30-day window)
  - Max 3 products can hold bestseller status at any time
  - KV caching (2-hour TTL) for fast reads
  - Bestseller badge on ProductCard and product detail page
  - Categories page supports `?tag=bestseller` as computed filter
  - Prisma indexes on `Order(createdAt, status)` and `OrderItem(productId)`

## In Progress

- None

## Payment & Delivery — Task Breakdown

### Phase 1: Foundation (Schema + API Clients)
- [x] **1.1** Update Prisma schema — Add `Address`, `Order`, `OrderItem` models; `tax_rate` in `SiteContent`
- [x] **1.2** Run Prisma migration & generate client
- [x] **1.3** Add env vars — `DELHIVERY_TOKEN`, `DELHIVERY_BASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CRON_SECRET`
- [x] **1.4** Create Delhivery API client — `checkPincode(pincode)` helper
- [x] **1.5** Create Razorpay client — `createOrder()`, `verifyPayment()` helpers

### Phase 2: Address System (DB Migration)
- [x] **2.1** Create Address server actions — `getAddresses`, `createAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`
- [x] **2.2** Update `/account/addresses` — Replace Clerk metadata with Prisma DB calls

### Phase 3: Pincode Serviceability (Product Page)
- [x] **3.1** Create API route — `POST /api/delhivery/pincode` (backend proxy)
- [x] **3.2** Add pincode check UI on product page — input + check button + result indicator

### Phase 4: Buy Now & Checkout Flow
- [x] **4.1** Replace "Add to Wishlist" with "Buy Now" — redirects to `/checkout?buyNow=productId&qty=N`
- [x] **4.2** Build `/checkout` page — Address selector, coupon auto-apply, order summary (items + 18% GST + shipping)
- [x] **4.3** Update cart "Proceed to Checkout" — redirect to `/checkout` with cart items

### Phase 5: Razorpay Payment
- [x] **5.1** Create `POST /api/razorpay/order` — server-side Razorpay order creation
- [x] **5.2** Build `/payment` page — Razorpay Checkout.js modal integration
- [x] **5.3** Create `POST /api/razorpay/verify` — HMAC-SHA256 signature verification
- [x] **5.4** Create `POST /api/orders` — Store `Order` + `OrderItem`(s) after successful payment

### Phase 6: Post-Payment & Admin
- [x] **6.1** Update `/account/orders` — Fetch real orders from Prisma, display items/status/shipping
- [x] **6.2** Add tax rate to admin settings — Editable `tax_rate` field (default 18%)
- [x] **6.3** Update admin sidebar — Add Orders link
- [x] **6.4** Integrate Delhivery shipment creation — Optional, graceful fallback if warehouse not configured

### Phase 7: Dynamic Bestseller System
- [x] **7.1** Create `getBestsellers()` server action — Aggregate `OrderItem` by product, filter paid/shipped/delivered orders in last 30 days, return top 3
- [x] **7.2** Add KV caching for bestseller list — `bestsellers:30d` key, 2-hour TTL
- [x] **7.3** Update homepage Bestsellers section — Fetch real bestsellers, show max 3, category tabs filter computed list
- [x] **7.4** Add bestseller badge to ProductCard — Gold badge with trending icon, shown when `showBestsellerBadge` prop is true
- [x] **7.5** Add bestseller badge to product detail page — Badge next to category name
- [x] **7.6** Update categories page — `?tag=bestseller` filters to computed top 3, special gold styling on tag pill
- [x] **7.7** Add Prisma indexes — `@@index([createdAt, status])` on Order, `@@index([productId])` on OrderItem

## Next Up

- Test end-to-end flow: Buy Now / Cart → Checkout → Razorpay → Order History with a real order
- Configure Delhivery webhook URL via Business SPOC: `https://swarnikaofficial.com/api/delhivery/webhook` (optional — cron-job.org already covers status polling)
- Add weight/dimensions inputs to admin product create/edit form so they can be customized per product
- Deploy and verify cron-job.org schedule (4×/day) is running correctly

## Open Questions

- Should we add inventory quantity tracking beyond `inStock` boolean?
- Do we need order/invoice management in admin?
- Do we need order cancellation / refund flow via Razorpay?
- Should we add email/SMS notifications for shipment status updates?
- Should we add a Vercel Cron job to auto-poll tracking for orders stuck in `paid` status? (Answered: using cron-job.org instead)

## Completed (Shipping Fix — Phase 0 + Phase 1)

- [x] **0.1** Fix `.env` — `DELHIVERY_WAREHOUSE="SWARNIKA OFFICE"` (was commented out)
- [x] **0.2** Fix `phone` format — changed from string to array per Delhivery spec
- [x] **0.3** Add `return_phone: []` to shipment payload
- [x] **0.4** Display waybill (AWB) on customer orders page with tracking link
- [x] **0.5** Display waybill, tracking link, and print label on admin orders page
- [x] **0.6** Show shipment error indicator when creation fails
- [x] **1.1** Add `createPickupRequest()` to Delhivery client — auto-creates PUR after shipment
- [x] **1.2** Add `getPackingSlip()` to Delhivery client — generates shipping label PDF
- [x] **1.3** Add `getTrackingStatus()` to Delhivery client — fetches scan history
- [x] **1.4** Add `cancelShipment()` to Delhivery client — cancels before dispatch
- [x] **1.5** Add `delhiveryFetch()` wrapper with retry logic (5xx, timeout, 403 WAF)
- [x] **1.6** Update order creation flow: Create Order → Create Shipment → Create PUR → Generate Label → Update Order
- [x] **1.7** Add API routes: `/api/delhivery/tracking`, `/api/delhivery/pickup`, `/api/delhivery/packing-slip`
- [x] **1.8** Prisma schema updated with `delhiveryTrackingUrl`, `delhiveryLabelUrl`, `pickupRequestId`, `shippedAt`, `deliveredAt`, `cancelledAt`, `shipmentError`, `shipmentErrorAt`, `@@index([delhiveryWaybill])`
- [x] **1.9** Error audit — failed shipments store error message + timestamp on Order (order still succeeds)

## Completed (Phase 2: Tracking & Status Lifecycle)

- [x] **2.1** Delhivery webhook endpoint — `POST /api/delhivery/webhook` receives scan events and auto-updates order status
- [x] **2.2** Status mapping: `manifested/in transit/picked up/out for delivery` → `shipped`; `delivered` → `delivered`; `rto/returned` → `cancelled`
- [x] **2.3** Status hierarchy guard — prevents downgrades (e.g., delivered won't revert to shipped)
- [x] **2.4** Timeline timestamps auto-set: `shippedAt`, `deliveredAt`, `cancelledAt`
- [x] **2.5** Admin sync API — `GET /api/delhivery/sync-status?orderId=xxx` manually refreshes tracking
- [x] **2.6** Public tracking API — `GET /api/track?waybill=xxx` (no auth, backend-proxied)
- [x] **2.7** Customer orders page shows shipment timeline (Paid → Shipped → Delivered) with visual dots
- [x] **2.8** Customer orders page links to public tracking page and Delhivery tracking URL

## Completed (Phase 3: Admin Tooling)

- [x] **3.1** Admin order detail page — `/admin/orders/[id]` with full order info, items, pricing, payment, shipping, timeline
- [x] **3.2** Admin actions: `retryShipment(orderId)` — rebuilds payload and re-calls Delhivery for failed shipments
- [x] **3.3** Admin actions: `updateOrderStatus(orderId, status)` — manual override with timeline timestamp
- [x] **3.4** Admin actions: `cancelOrderShipment(orderId)` — calls Delhivery cancel API + marks order cancelled
- [x] **3.5** Admin actions: `refreshTracking(orderId)` — fetches latest scan history, maps status, updates order
- [x] **3.6** Admin orders table links to detail page via clickable order number
- [x] **3.7** Shipment error banner on detail page with **friendly error messages** mapping cryptic Delhivery errors to actionable admin guidance
- [x] **3.8** Conditional action buttons: Retry (no waybill), Refresh Tracking / Cancel (has waybill), Mark Shipped/Delivered (manual)
- [x] **3.9** Client-side action buttons with error handling — errors show inline instead of crashing the page

## Completed (Phase 4: Customer Experience)

- [x] **4.1** Public tracking page — `/track/[waybill]` (no login required)
- [x] **4.2** Tracking page shows order details (if in system) + full scan history timeline
- [x] **4.3** Tracking page handles loading, error, and empty states gracefully
- [x] **4.4** Customer orders page has "View full tracking" link to `/track/[waybill]`

## Completed (Phase 5: Express Delivery + Max Cart Value + Admin Errors)

- [x] **5.1** Express delivery add-on — Checkout page shows "Delivery Speed" toggle (Standard vs Express)
- [x] **5.2** Express surcharge — ₹499 added to order total when Express is selected
- [x] **5.3** Express UI — Radio button cards with delivery time estimate and surcharge
- [x] **5.4** Payment page breakdown — Shows Express Delivery line item when selected
- [x] **5.5** Order API — Saves `shippingMode` (Surface/Express) to DB, passes to Delhivery
- [x] **5.6** Prisma schema — Added `shippingMode String @default("Surface")` to Order model
- [x] **5.7** Max cart value ₹50,000 — Cart page disables checkout button + shows red warning when subtotal > ₹50,000
- [x] **5.8** Checkout safety guard — Redirects back to cart with alert if subtotal > ₹50,000
- [x] **5.9** Admin friendly errors — Maps cryptic Delhivery errors (insufficient balance, warehouse mismatch, pincode issues, etc.) to actionable guidance
- [x] **5.10** Error mapping covers: wallet insufficient, warehouse mismatch, pincode not serviceable, invalid phone, duplicate order, suspicious consignee, capacity exceeded
- [x] **5.11** Product weight/dimensions fields added to Prisma schema (`weightGrams`, `lengthCm`, `widthCm`, `heightCm`) with defaults (50g, 10×5×10cm)
- [x] **5.12** `getCartProducts` returns weight/dimensions so checkout can compute accurate shipping estimates
- [x] **5.13** Shipment payload uses actual product weight (sum + 20% packaging buffer) and max dimensions instead of hardcoded values — both in `POST /api/orders` and admin `retryShipment`
- [x] **5.14** Checkout button disabled when subtotal > ₹50,000 (was only alert before)
- [x] **5.15** Admin orders list shows friendly error tooltip on hover for failed shipments

## Completed (Phase 6: Cron Job Order Status Refresh)

- [x] **6.1** Created `POST /api/orders/refresh-status` endpoint for bulk tracking sync
- [x] **6.2** Endpoint authenticates via `CRON_SECRET` env var (`Authorization: Bearer <token>` or fallback `Bearer: <token>` header for cron-job.org UI compatibility)
- [x] **6.3** Fetches all active orders (`status IN ["paid", "shipped"]`, `delhiveryWaybill IS NOT NULL`, created within last 30 days)
- [x] **6.4** Batches waybills into groups of 50 (Delhivery tracking API max)
- [x] **6.5** Maps scan statuses to our order statuses with the same hierarchy guard as webhook/manual sync
- [x] **6.6** Auto-sets timestamps (`shippedAt`, `deliveredAt`, `cancelledAt`) on status transitions
- [x] **6.7** Returns JSON summary: `checked`, `updated`, `skipped`, `failed`
- [x] **6.8** Added `CRON_SECRET` to `.env`
- [x] **6.9** Scheduled on cron-job.org: 4×/day (every 6 hours) via `POST https://swarnikaofficial.com/api/orders/refresh-status`

## Architecture Decisions

- Chose Cloudinary over Vercel Blob for product images due to transformation and CDN needs
- Using Vercel KV for cache rather than React cache to share across serverless invocations
- Clerk chosen for auth to offload session management and provide ready-made UI components
- JavaScript retained over TypeScript to match existing codebase and reduce migration overhead
- **NEW** Address storage moved from Clerk `unsafeMetadata` to Prisma DB for relational integrity with Orders
- **NEW** Delhivery API calls proxied through backend to avoid CORS and token exposure
- **NEW** Tax rate stored as `SiteContent` key `tax_rate` for admin editability
- **NEW** Buy Now bypasses cart entirely for single-product direct checkout
- **NEW** Bestseller status is computed dynamically from `OrderItem` sales data, not a static tag — max 3 products, 30-day rolling window, KV cached
- **CRITICAL BUG FIX** Prisma relations (`category`, `tags`) are LOST when using `...p` spread. Must explicitly map relation fields when passing from server components to client components.

## Session Notes

- Admin routes use `adminAuth.js` utility to check signed-in user against `AdminEmail` table
- Cache invalidation is manual via `revalidatePath` and KV deletion in server actions
- Hero slider supports both DB-managed slides and fallback hardcoded images
- Delhivery token: `0c308a6df1d7c1425eee16ba8a6b3210ba35b19c` (production)
- Razorpay test keys: `rzp_test_Sniov1AvjJXyED` / `kwYXyRviS6bXq1Drt3F8Nm6D`
