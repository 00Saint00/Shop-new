import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/Store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type WishlistContextValue = {
  isWishlisted: (productId: number) => boolean;
  /** True if Supabase insert/delete worked. */
  toggleWishlist: (productId: number) => Promise<boolean>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const user = useSelector(
    (state: RootState) => state.auth.user as { id: string } | null,
  );

  // Product ids this user has saved (kept in sync with the wishlist table).
  const [wishlistedIds, setWishlistedIds] = useState<number[]>([]);

  // When the logged-in user changes: load their rows, or clear if logged out.
  useEffect(() => {
    if (!user?.id) {
      setWishlistedIds([]);
      return;
    }

    let ignore = false;

    (async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", user.id);

      if (ignore) return;
      if (error) {
        console.error(error);
        return;
      }

      const ids = (data ?? [])
        .map((row) => Number(row.product_id))
        .filter((n) => !Number.isNaN(n));
      setWishlistedIds(ids);
    })();

    return () => {
      ignore = true;
    };
  }, [user?.id]);

  const toggleWishlist = useCallback(
    async (productId: number) => {
      if (!user?.id) {
        toast.error("Please login to add to wishlist");
        return false;
      }

      const idStr = String(productId);
      const wasListed = wishlistedIds.includes(productId);

      if (!wasListed) {
        const { error } = await supabase.from("wishlist").insert({
          user_id: user.id,
          product_id: idStr,
        });
        if (error) {
          toast.error("Couldn't update wishlist");
          return false;
        }
        setWishlistedIds((prev) =>
          prev.includes(productId) ? prev : [...prev, productId],
        );
        toast.success("Added to wishlist");
        return true;
      }

      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", idStr);

      if (error) {
        toast.error("Couldn't update wishlist");
        return false;
      }

      setWishlistedIds((prev) => prev.filter((id) => id !== productId));
      toast.success("Removed from wishlist");
      return true;
    },
    [user?.id, wishlistedIds],
  );

  const value: WishlistContextValue = {
    isWishlisted: (productId) => wishlistedIds.includes(productId),
    toggleWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
}
