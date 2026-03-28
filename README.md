# Shop.co

Fashion and general merchandise storefront built with React. Product data comes from the [DummyJSON](https://dummyjson.com/docs/products) demo API. Authentication and user profiles use [Supabase](https://supabase.com/).

## Tech stack

- **React 19** + **TypeScript** + **Vite 7**
- **React Router** for client-side routing
- **Redux Toolkit** for auth-related client state
- **Tailwind CSS v4** and **Radix**-style UI primitives (shadcn-style components)
- **Supabase Auth** (email) with optional profile / customer / seller fields
- **Axios** for HTTP, **Swiper** for carousels, **Framer Motion** for light animation, **Sonner** for toasts

## Features

- **Home** — Hero banner, brand marquee, New Arrivals and Top Selling carousels (filtered DummyJSON categories).
- **Shop** (`/shop`) — Full catalog with client-side sort modes exposed in the URL (`/shop/top-selling`, `/shop/new-arrivals`, `/shop/a-z`, `/shop/z-a`), pagination, loading skeleton, and error handling.
- **Shop by brand** (`/shop/brand/:brandSlug`) — Same shop UI filtered to one brand; links from the Brands page.
- **Category browsing** — Men, Women, Electronics, and Fragrances use a shared `CategoryShop` component: one catalog fetch, then filter by DummyJSON `category` slugs.
- **Brands** (`/brands`) — Lists brands with product counts, client-side name filter, links into brand-filtered shop.
- **Product detail** (`/product/:id/:slug`) — Gallery, ratings, size UI, quantity (min 1, max stock when available), add-to-cart toast, loading skeletons and retry on error.
- **Auth** — Register, login, check-email flow; protected **Profile** route.
- **Wishlist affordance** — Heart control on product cards is a separate button (not trapped inside the product link) for future wishlist wiring.

## Routes (overview)

| Path | Description |
|------|-------------|
| `/` | Home |
| `/shop` | All products |
| `/shop/:sortBy` | Sorted shop (`top-selling`, `new-arrivals`, `a-z`, `z-a`) |
| `/shop/brand/:brandSlug` | Products for one brand |
| `/shop/men`, `/shop/women`, `/shop/electronics`, `/shop/fragrances` | Category-filtered listings |
| `/brands` | Brand index |
| `/product/:id/:slug` | Product detail |
| `/auth`, `/auth/check-email` | Auth (public when logged out) |
| `/profile` | Profile (private) |

Register **`/shop/brand/:brandSlug`** and static segments like **`/shop/men`** above the generic **`/shop/:sortBy`** route so those paths are not parsed as sort keys.

## Environment variables

Create a `.env` (or `.env.local`) in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Without valid Supabase values, auth-related features will not work; catalog pages that only use DummyJSON can still be explored if routing does not force login.

## Scripts

```bash
npm install
npm run dev      # dev server
npm run build    # typecheck + production build
npm run preview  # preview production build
npm run lint     # ESLint
```

## Project layout (high level)

- `src/pages/` — Route-level screens (home, shop, product detail, auth, profile, brands, category shops).
- `src/components/` — Shared UI (header, footer, splash, shadcn-style `ui/*`).
- `src/store/` — Redux store and `authSlice`.
- `src/lib/` — Supabase client and utilities.

---

This repo started from the Vite React TypeScript template; ESLint can be extended with type-aware rules as described in the [Vite React TS README](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) if you want stricter checks.
