import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/Store";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type WishlistProduct = {
  id: number;
  title: string;
  price: number;
  thumbnail?: string;
  rating?: number;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const Wishlist = () => {
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const user = useSelector(
    (state: RootState) => state.auth.user as { id: string } | null,
  );

  useEffect(() => {
    if (!user?.id) {
      setProducts([]);
      return;
    }

    const fetchWishlistProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const ids = (data ?? []).map((row) => String(row.product_id));
      const productResults = await Promise.all(
        ids.map(async (pid) => {
          const response = await fetch(`https://dummyjson.com/products/${pid}`);
          if (!response.ok) return null;
          const product = await response.json();
          return {
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            rating: product.rating,
          } as WishlistProduct;
        }),
      );

      setProducts(productResults.filter(Boolean) as WishlistProduct[]);
      setLoading(false);
    };

    fetchWishlistProducts();
  }, [user?.id]);

  const handleRemoveFromWishlist = async (productId: number) => {
    if (!user?.id) return;

    setRemovingId(productId);
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", String(productId));

    if (error) {
      toast.error("Couldn't remove item from wishlist");
      setRemovingId(null);
      return;
    }

    setProducts((current) => current.filter((product) => product.id !== productId));
    toast.success("Removed from wishlist");
    setRemovingId(null);
  };

  if (!user) {
    return <p className="text-sm text-muted-foreground">Please log in to view your wishlist.</p>;
  }

  return (
    <div className="space-y-4">
      {loading && <p className="text-sm text-muted-foreground">Loading wishlist...</p>}

      {!loading && products.length === 0 && (
        <p className="text-sm text-muted-foreground">Your wishlist is empty.</p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <Link
              to={`/product/${product.id}/${slugify(product.title)}`}
              className="block"
            >
              <CardHeader className="flex flex-col items-center justify-center p-4">
                <div className="h-[200px] w-full overflow-hidden rounded-[20px] bg-[#F0EEED] lg:h-[298px] lg:w-[295px]">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : null}
                </div>
                <CardTitle className="mt-2 line-clamp-2 text-center text-[20px] font-bold">
                  {product.title}
                </CardTitle>
              </CardHeader>
            </Link>

            <CardFooter className="flex items-center justify-between border-t p-4 pt-0">
              <Link
                to={`/product/${product.id}/${slugify(product.title)}`}
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
                        i < Math.round(product.rating ?? 0)
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
                  aria-label={`Remove ${product.title} from wishlist`}
                  disabled={removingId === product.id}
                  className="-m-1 rounded-full p-1 text-red-500 transition-colors hover:bg-black/5 focus-visible:outline focus-visible:ring-2 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleRemoveFromWishlist(product.id);
                  }}
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" strokeWidth={1.75} />
                </button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;