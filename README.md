# Shop.co

Fashion and general merchandise storefront built with React. Product data comes from the [DummyJSON](https://dummyjson.com/docs/products) demo API. Authentication, cart, and wishlist use [Supabase](https://supabase.com/).

## Tech stack

- **React 19** + **TypeScript** + **Vite 7**
- **React Router** for client-side routing
- **Redux Toolkit** for auth-related client state
- **Tailwind CSS v4** and **Radix**-style UI primitives (shadcn-style components)
- **Supabase Auth** (email) with optional profile / customer / seller fields
- **Axios** for HTTP, **Swiper** for carousels, **Framer Motion** for light animation, **Sonner** for toasts
- **Jest** + **React Testing Library** for unit/component tests

## Features

- **Home** — Hero banner, brand marquee, New Arrivals and Top Selling carousels (filtered DummyJSON categories).
- **Shop** (`/shop`) — Full catalog with client-side sort modes exposed in the URL (`/shop/top-selling`, `/shop/new-arrivals`, `/shop/a-z`, `/shop/z-a`), pagination, loading skeleton, and error handling.
- **Shop by brand** (`/shop/brand/:brandSlug`) — Same shop UI filtered to one brand; links from the Brands page.
- **Category browsing** — Men, Women, Electronics, and Fragrances use a shared `CategoryShop` component: one catalog fetch, then filter by DummyJSON `category` slugs.
- **Brands** (`/brands`) — Lists brands with product counts, client-side name filter, links into brand-filtered shop.
- **Product detail** (`/product/:id/:slug`) — Gallery, ratings, size UI, quantity (min 1, max stock when available), add-to-cart, loading skeletons and retry on error.
- **Cart** (`/cart`) — Logged-in users persist cart lines in Supabase (`cart_items`). **`CartProvider`** (`src/context/CartContext.tsx`) loads on login and clears on logout. Product detail calls `addToCart`; the header cart icon links to `/cart` with a quantity badge. Checkout is not implemented yet (cart “Proceed to Checkout” is a placeholder).
- **Auth** — Register, login, check-email, forgot/reset password; protected **Profile** route.
- **Wishlist** — Logged-in users can add or remove DummyJSON products in a Supabase `wishlist` table. Hearts work on the shop grid, category shops, home carousels (New Arrivals / Top Selling), and product detail. Shared state lives in **`WishlistProvider`** (`src/context/WishlistContext.tsx`), mounted in `main.tsx`. The profile **Wishlist** tab lists saved items and stays in sync with hearts elsewhere.
- **Profile** — Edit name, email, phone, avatar; optional seller fields. **Settings** tab is still a placeholder. `customers.address` can be saved in code but there is no address field in the profile UI yet.

### Not built yet

Checkout, payments (Stripe), order history, “On Sale” filter, and guest-cart merge are planned but not in the repo yet.

## Environment variables

Create a `.env` (or `.env.local`) in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Without valid Supabase values, auth, cart, and wishlist persistence will not work; catalog pages that only use DummyJSON can still be browsed when routing does not force login.

Supabase tables (with RLS) expected by the app:

- **`wishlist`** — `user_id` (auth UUID), `product_id` (text, DummyJSON id as string).
- **`cart_items`** — `user_id`, `product_id`, `quantity`, plus optional snapshot fields (`title`, `price`, `thumbnail`) used by the cart UI.

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
- Current coverage: **Login** form only (valid submit, empty submit, server error display, password toggle). More flows (cart, checkout) to come.

## Project layout (high level)

- `src/pages/` — Route-level screens (home, shop, product detail, cart, auth, profile, brands, category shops).
- `src/components/` — Shared UI (header, footer, splash, shadcn-style `ui/*`).
- `src/context/` — React context providers (`CartContext`, `WishlistContext`).
- `src/store/` — Redux store and `authSlice`.
- `src/lib/` — Supabase client and utilities.

---

This repo started from the Vite React TypeScript template; ESLint can be extended with type-aware rules as described in the [Vite React TS README](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) if you want stricter checks.
