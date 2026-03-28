import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

function BrandsGridSkeleton() {
  return (
    <section
      className="px-[16px] lg:px-[100px] py-16"
      aria-busy="true"
      aria-label="Loading brands"
    >
      <Skeleton className="mb-8 h-9 w-48 max-w-full lg:h-11" />
      <Skeleton className="mb-10 h-12 w-full max-w-md rounded-full" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-[20px] lg:h-[120px]" />
        ))}
      </div>
    </section>
  );
}

const Brands = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "https://dummyjson.com/products?limit=0",
        );
        setProducts(response.data.products ?? []);
      } catch {
        setError("Failed to load brands.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const name = typeof p.brand === "string" ? p.brand.trim() : "";
      if (!name) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, query]);

  if (loading) {
    return <BrandsGridSkeleton />;
  }

  if (error) {
    return (
      <section className="px-[16px] lg:px-[100px] py-16">
        <p className="text-center text-lg font-semibold">{error}</p>
        <p className="mt-2 text-center text-sm text-black/60">
          Refresh the page or try again later.
        </p>
      </section>
    );
  }

  return (
    <section className="px-[16px] lg:px-[100px] py-16 pb-[130px]">
      <h1 className="mb-2 text-[24px] font-bold lg:text-[40px]">Brands</h1>
      <p className="mb-8 max-w-xl text-[15px] text-black/60">
        Browse brands we carry. Select one to see products from that brand in the
        shop.
      </p>

      <div className="relative mb-10 max-w-md">
        <Search className="absolute left-4 top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Filter brands..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 rounded-full border-black/10 bg-[#f0f0f0] pl-12 pr-4"
          aria-label="Filter brands by name"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-black/60">
          No brands match “{query.trim()}”.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6">
          {filtered.map(({ name, count }) => (
            <li key={name}>
              <Link
                to={`/shop/brand/${slugify(name)}`}
                className="flex h-full min-h-[100px] flex-col items-center justify-center rounded-[20px] border border-black/10 bg-[#F0EEED] px-4 py-6 text-center transition-colors hover:border-black/30 hover:bg-[#e8e4e1] lg:min-h-[120px]"
              >
                <span className="text-[16px] font-bold leading-tight lg:text-[18px]">
                  {name}
                </span>
                <span className="mt-2 text-sm text-black/50">
                  {count} {count === 1 ? "product" : "products"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Brands;
