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

type CartItem = {
  product_id: number;
  quantity: number;
  title: string;
  price: number;
  thumbnail: string | null;
  size: string | null;
};

type CartContextValue = {
  cartItems: CartItem[];
  addToCart: (
    productId: number,
    quantity?: number,
    item?: Partial<CartItem>,
  ) => Promise<void>;
  removeFromCart: (productId: number, item?: Partial<CartItem>, removeAll?: boolean) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const user = useSelector(
    (state: RootState) => state.auth.user as { id: string } | null,
  );

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const loadCart = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("cart_items")
      .select("product_id, quantity, title, price, thumbnail, size")
      .eq("user_id", userId)
      .order("product_id", { ascending: true });
    setCartItems(
      (data ?? []).map((r) => ({
        product_id: Number(r.product_id),
        quantity: Number(r.quantity),
        title: r.title,
        price: Number(r.price),
        thumbnail: r.thumbnail,
        size: r.size,
      })),
    );
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setCartItems([]);
      return;
    }
    void loadCart(user.id);
  }, [user?.id, loadCart]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1, item?: Partial<CartItem>) => {
      if (!user?.id) {
        toast.error("Please log in to add to cart");
        return;
      }

      const q = Math.max(1, Math.floor(quantity));
      const pid = String(productId);
      // const { data: row } = await supabase
      //   .from("cart_items")
      //   .select("id, quantity, title, price, thumbnail, size")
      //   .eq("user_id", user.id)
      //   .eq("product_id", pid)
      //   .eq("size", item?.size)
      //   .maybeSingle(); // check if the item is already in the cart

      let query = supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", pid);
      if (item?.size) {
        query = query.eq("size", item.size);
      } else {
        query = query.is("size", null);
      }

      const { data: row } = await query.maybeSingle();

      if (row?.id) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: Number(row.quantity) + q })
          .eq("id", row.id);
        if (error) {
          toast.error("Couldn't add to cart");
          return;
        }
      } else {
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: pid,
          quantity: q,
          title: item?.title,
          price: item?.price,
          thumbnail: item?.thumbnail,
          size: item?.size,
        });
        if (error) {
          toast.error("Couldn't add to cart");
          return;
        }
      }

      await loadCart(user.id);
      toast.success("Added to cart");
    },
    [user?.id, loadCart],
  );

  const removeFromCart = useCallback(
    async (productId: number, item?: Partial<CartItem>, removeAll = false) => {
      if (!user?.id) return;
      const pid = String(productId);
      // const { data: row } = await supabase
      //   .from("cart_items")
      //   .select("id, quantity, title, price, thumbnail, size")
      //   .eq("user_id", user.id)
      //   .eq("product_id", pid)

      //   .maybeSingle();

      let query = supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId);

        if(item?.size){
          query = query.eq("size", item.size);
        } else {
          query = query.is("size", null);
        }

      const { data: row } = await query.maybeSingle();

      if (!row?.id) return;

      const currentQty = Number(row.quantity);
      if (removeAll || currentQty <= 1) {
        await supabase.from("cart_items").delete().eq("id", row.id);
      } else {
        await supabase
          .from("cart_items")
          .update({ quantity: currentQty - 1 })
          .eq("id", row.id);
      }
      await loadCart(user.id);
    },
    [user?.id, loadCart],
  );

  const clearCart = useCallback(async () => {
    if (!user?.id) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setCartItems([]);
  }, [user?.id]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
