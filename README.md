# Shop.co

Fashion and general merchandise storefront built with React. Product data comes from the [DummyJSON](https://dummyjson.com/docs/products) demo API. Authentication, cart, wishlist, checkout, and orders use [Supabase](https://supabase.com/).

## Tech stack

- **React 19** + **TypeScript** + **Vite 7**
- **React Router** for client-side routing
- **Redux Toolkit** for auth-related client state
- **Tailwind CSS v4** and **Radix**-style UI primitives (shadcn-style components)
- **Supabase Auth** (email) with profile, customer, seller, and admin roles
- **Photon** (Komoot) for address autocomplete on profile and checkout
- **Axios** for HTTP, **Swiper** for carousels, **Framer Motion** for light animation, **Sonner** for toasts
- **Jest** + **React Testing Library** for unit/component tests

## Features

- **Home** — Hero banner, brand marquee, New Arrivals and Top Selling carousels (filtered DummyJSON categories).
- **Shop** (`/shop`) — Full catalog with client-side sort modes exposed in the URL (`/shop/top-selling`, `/shop/new-arrivals`, `/shop/a-z`, `/shop/z-a`), pagination, loading skeleton, and error handling.
- **Shop by brand** (`/shop/brand/:brandSlug`) — Same shop UI filtered to one brand; links from the Brands page.
- **Category browsing** — Men, Women, Electronics, and Fragrances use a shared `CategoryShop` component: one catalog fetch, then filter by DummyJSON `category` slugs.
- **Brands** (`/brands`) — Lists brands with product counts, client-side name filter, links into brand-filtered shop.
- **Product detail** (`/product/:id/:slug`) — Gallery, ratings, size UI, quantity (min 1, max stock when available), add-to-cart, loading skeletons and retry on error.
- **Cart** (`/cart`) — Logged-in users persist cart lines in Supabase (`cart_items`). **`CartProvider`** loads on login and clears on logout. Header cart icon links to `/cart` with a quantity badge.
- **Checkout** (`/checkout`, private route) — Shipping form with profile prefill, Photon address validation (user must pick a suggestion), places an unpaid order (`status: pending`). Clears cart and redirects to confirmation.
- **Checkout confirmation** (`/checkout/confirmation/:orderId`) — Shows order summary and line items.
- **Auth** — Register, login, check-email, forgot/reset password; **`AuthRoute`** guards public, private, and admin routes.
- **Wishlist** — Supabase-backed wishlist with hearts on shop, category pages, home carousels, and product detail. Profile **Wishlist** tab lists saved items.
- **Profile** — Edit name, phone, avatar (Supabase Storage `avatars` bucket), and shipping address (Photon). **Orders** tab shows order history with line items. **Seller** section: apply with store name, contact, description, and business address (`status: pending` until approved).
- **Admin dashboard** (`/dashboard`, admin only) — Lists pending seller applications; approve or reject. Link in header dropdown when `users.role = admin`.

### Not built yet

Stripe / payments, seller product management, Settings tab (placeholder), “On Sale” filter, guest-cart merge, and legal pages.

## Environment variables

Create a `.env` (or `.env.local`) in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Without valid Supabase values, auth, cart, wishlist, checkout, and orders will not work; catalog pages that only use DummyJSON can still be browsed.

### Supabase tables (RLS required)

| Table | Purpose |
|---|---|
| **`users`** | Profile row per auth user; includes `role` (`customer`, `admin`, etc.) |
| **`customers`** | `phone`, `address` per user |
| **`wishlist`** | `user_id`, `product_id` (DummyJSON id as text) |
| **`cart_items`** | `user_id`, `product_id`, `quantity`, optional `title`, `price`, `thumbnail` |
| **`orders`** | `user_id`, `status`, `subtotal`, `total`, shipping fields |
| **`order_items`** | `order_id`, `product_id`, `title`, `price`, `quantity`, `thumbnail` |
| **`seller`** | Seller application / store info; `status`: `pending`, `approved`, or `rejected` |

**Storage:** public **`avatars`** bucket with authenticated INSERT/UPDATE (and authenticated SELECT for upsert). Public bucket URLs are used for avatar display.

**Admin setup:** set `role = 'admin'` on your user row in Supabase (manual). Add admin RLS policies on `seller` (and optionally `users`) so admins can read pending applications and update `status`.

Address search uses the public [Photon](https://photon.komoot.io/) API (no API key).

See your Supabase dashboard for full schema and policies.

## Scripts

This project uses **pnpm** (`pnpm-lock.yaml`).

```bash
pnpm install
pnpm dev          # dev server
pnpm build        # typecheck + production build
pnpm preview      # preview production build
pnpm lint         # ESLint
pnpm test         # Jest (all tests)
pnpm test:watch   # Jest in watch mode
```

## Testing

- Config: `jest.config.cjs`, `tsconfig.jest.json`, `src/setupTests.ts` (jest-dom matchers).
- Tests live next to features, e.g. `src/pages/auth/__tests__/Login.test.tsx`.
- Current coverage: **Login** form only. More flows (cart, checkout) to come.

## Project layout (high level)

- `src/pages/` — Route-level screens (home, shop, cart, checkout, auth, profile, admin dashboard, brands, category shops).
- `src/components/` — Shared UI (header, footer, splash, `address/AddressAutocomplete`, shadcn-style `ui/*`).
- `src/context/` — React context providers (`CartContext`, `WishlistContext`).
- `src/store/` — Redux store and `authSlice`.
- `src/lib/` — Supabase client, Photon helpers, utilities.
- `src/utils/` — Route guards (`AuthRoute`).

---

This repo started from the Vite React TypeScript template; ESLint can be extended with type-aware rules as described in the [Vite React TS README](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) if you want stricter checks.
