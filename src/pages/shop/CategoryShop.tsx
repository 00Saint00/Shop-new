import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

type CategoryShopProps = {
  title: string;
  blurb: string;
  categories: readonly string[];
  emptyMessage: string;
  skeletonTitleWidth?: string;
};

export default function CategoryShop({
  title,
  blurb,
  categories,
  emptyMessage,
  skeletonTitleWidth = "w-32",
}: CategoryShopProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const allowed = useMemo(() => new Set(categories), [categories]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(
          "https://dummyjson.com/products?limit=0",
        );
        setProducts(data.products ?? []);
      } catch {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(
    () => products.filter((p) => allowed.has(String(p.category ?? ""))),
    [products, allowed],
  );

  if (loading) {
    return (
      <section
        className="px-[16px] lg:px-[100px] py-16"
        aria-busy="true"
        aria-label="Loading"
      >
        <Skeleton className={`mb-8 h-9 ${skeletonTitleWidth}`} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[295/298] rounded-[20px]" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-[16px] lg:px-[100px] py-16 text-center">
        <p className="font-semibold">{error}</p>
        <Link to="/shop" className="mt-4 inline-block text-sm underline">
          Back to shop
        </Link>
      </section>
    );
  }

  return (
    <section className="px-[16px] lg:px-[100px] py-16 pb-[130px]">
      <h1 className="text-[24px] font-bold lg:text-[32px]">{title}</h1>
      <p className="mt-1 text-sm text-black/60">
        {blurb}
        {" · "}
        <Link to="/shop" className="underline hover:text-black">
          Full shop
        </Link>
      </p>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-black/60">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => {
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
      )}
    </section>
  );
}
