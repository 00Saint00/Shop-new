import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const SORT_SLUGS = new Set(["top-selling", "new-arrivals", "a-z", "z-a"]);

const PAGE_SIZE = 12;

function ShopGridSkeleton() {
  return (
    <section
      className="px-[16px] lg:px-[100px] py-16"
      aria-busy="true"
      aria-label="Loading products"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40 lg:h-9" />
          <Skeleton className="h-4 w-56 lg:hidden" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[295/298] w-full rounded-[20px]" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </section>
  );
}

const Shop = () => {
  const { sortBy: sortParam, brandSlug } = useParams<{
    sortBy?: string;
    brandSlug?: string;
  }>();
  const navigate = useNavigate();
  const isBrandRoute = Boolean(brandSlug);

  const [brandSortBy, setBrandSortBy] = useState("all");
  useEffect(() => {
    setBrandSortBy("all");
  }, [brandSlug]);

  const urlSortBy = sortParam && SORT_SLUGS.has(sortParam) ? sortParam : "all";
  const sortBy = isBrandRoute ? brandSortBy : urlSortBy;

  const setSort = (next: string) => {
    if (isBrandRoute) {
      setBrandSortBy(next);
      return;
    }
    if (next === "all") navigate("/shop");
    else navigate(`/shop/${next}`);
  };

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "https://dummyjson.com/products?limit=0",
        );
        setProducts(response.data.products ?? []);
      } catch {
        setError("Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const brandLabel = useMemo(() => {
    if (!brandSlug) return null;
    const match = products.find(
      (p) => slugify(String(p.brand ?? "")) === brandSlug,
    );
    if (match?.brand) return String(match.brand);
    return brandSlug.replace(/-/g, " ");
  }, [products, brandSlug]);

  const byBrand = useMemo(() => {
    if (!brandSlug) return products;
    return products.filter((p) => slugify(String(p.brand ?? "")) === brandSlug);
  }, [products, brandSlug]);

  const productstoDisplay = useMemo(() => {
    const sortedProducts = [...byBrand];
    if (sortBy === "top-selling") {
      sortedProducts.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "new-arrivals") {
      sortedProducts.sort(
        (a, b) =>
          new Date(b.meta.createdAt).getTime() -
          new Date(a.meta.createdAt).getTime(),
      );
    } else if (sortBy === "a-z") {
      sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "z-a") {
      sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
    }
    return sortedProducts;
  }, [byBrand, sortBy]);

  const [page, setPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(productstoDisplay.length / PAGE_SIZE),
  );

  useEffect(() => {
    setPage(1);
  }, [sortBy, brandSlug, productstoDisplay.length]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pageSlice = productstoDisplay.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  if (loading) {
    return <ShopGridSkeleton />;
  }

  if (error) {
    return (
      <section className="px-[16px] lg:px-[100px] py-16">
        <p className="text-center text-lg font-semibold">{error}</p>
        <p className="mt-2 text-center text-sm text-black/60">
          Check your connection and try again.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className="rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-black/90"
          >
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-[16px] lg:px-[100px] py-16 pb-[130px]">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[24px] lg:text-[32px] font-bold lg:mb-0 mb-[8px]">
            {isBrandRoute && brandLabel ? brandLabel : "Shop"}
          </h2>
          {isBrandRoute ? (
            <p className="mt-1 text-sm text-black/60">
              <Link to="/brands" className="underline hover:text-black">
                All brands
              </Link>
              {" · "}
              <Link to="/shop" className="underline hover:text-black">
                Full shop
              </Link>
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[16px] text-black text-opacity-60 ">
            Sort by:
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-2 py-1 hover:text-gray-800 cursor-pointer transition-colors"
              >
                {sortBy === "top-selling"
                  ? "Top Selling"
                  : sortBy === "new-arrivals"
                    ? "New Arrivals"
                    : sortBy === "a-z"
                      ? "A-Z"
                      : sortBy === "z-a"
                        ? "Z-A"
                        : "All"}
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem onSelect={() => setSort("top-selling")}>
                Top Selling
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSort("new-arrivals")}>
                New Arrivals
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSort("a-z")}>
                A-Z
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSort("z-a")}>
                Z-A
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSort("all")}>
                All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isBrandRoute && productstoDisplay.length === 0 ? (
        <div className="rounded-[20px] border border-black/10 bg-[#F0EEED] px-6 py-16 text-center">
          <p className="font-semibold">No products for this brand.</p>
          <p className="mt-2 text-sm text-black/60">
            The link may be outdated, or this brand has no items in the catalog.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/brands"
              className="rounded-full border border-black/20 bg-white px-6 py-2 text-sm font-medium hover:bg-black hover:text-white"
            >
              Browse brands
            </Link>
            <Link
              to="/shop"
              className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-black/90"
            >
              View all products
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
            {pageSlice.map((product) => {
              const productHref = `/product/${product.id}/${slugify(product.title)}`;
              return (
                <Card key={product.id}>
                  <Link to={productHref} className="block">
                    <CardHeader className="flex flex-col items-center justify-center p-4">
                      <div className="h-[200px] w-full overflow-hidden rounded-[20px] bg-[#F0EEED] lg:h-[298px] lg:w-[295px]">
                        <img
                          src={product.images?.[0] ?? product.image ?? ""}
                          alt={product.title ?? "Product"}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <CardTitle className="mt-2 line-clamp-2 text-center text-[20px] font-bold">
                        {product.title}
                      </CardTitle>
                    </CardHeader>
                  </Link>
                  <CardFooter className="flex items-center justify-between border-t p-4 pt-0">
                    <Link
                      to={productHref}
                      className="text-sm font-semibold hover:underline"
                    >
                      ${product.price}
                    </Link>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.round(product.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            &#9733;
                          </span>
                        ))}
                      </p>
                      <button
                        type="button"
                        aria-label={`Save ${product.title ?? "product"} to wishlist`}
                        className="-m-1 rounded-full p-1 text-black/35 transition-colors hover:bg-black/5 hover:text-red-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-black/20"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Heart className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-6">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-black/20 px-5 py-2 text-sm font-medium disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-black/60">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-full border border-black/20 px-5 py-2 text-sm font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
};

export default Shop;
