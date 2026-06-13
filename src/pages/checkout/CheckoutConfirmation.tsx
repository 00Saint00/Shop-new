import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/Store";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type OrderRow = {
  id: string;
  status: string;
  total: number;
  shipping_name: string;
  shipping_phone: string | null;
  shipping_address: string;
  created_at: string;
};

type OrderItemRow = {
  title: string;
  price: number;
  quantity: number;
  thumbnail: string | null;
  size: string | null;
};

const CheckoutConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const profile = useSelector((state: RootState) => state.auth.profile);
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !profile?.id) {
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      const { data: orderRow, error: orderError } = await supabase
        .from("orders")
        .select(
          "id, status, total, shipping_name, shipping_phone, shipping_address, created_at",
        )
        .eq("id", orderId)
        .eq("user_id", profile.id)
        .maybeSingle();

      if (orderError || !orderRow) {
        setLoading(false);
        return;
      }

      const { data: itemRows } = await supabase
        .from("order_items")
        .select("title, price, quantity, thumbnail, size")
        .eq("order_id", orderId);

      setOrder(orderRow as OrderRow);
      setItems((itemRows ?? []) as OrderItemRow[]);
      setLoading(false);
    };

    void loadOrder();
  }, [orderId, profile?.id]);

  if (loading) {
    return (
      <div className="px-[16px] pt-[80px] pb-[168px] lg:px-[100px]">
        <p className="text-black/60">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-[16px] pt-[80px] pb-[168px] lg:px-[100px]">
        <p className="text-lg font-semibold text-black">Order not found</p>
        <Button asChild className="mt-4">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-[16px] pt-[80px] pb-[168px] lg:px-[100px]">
      <div className="mx-auto max-w-2xl rounded-[20px] border border-black/10 bg-white px-6 py-8 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
        <h2 className="font-poppins text-[28px] font-bold uppercase lg:text-[32px]">
          Order placed
        </h2>
        <p className="mt-2 text-sm text-black/60">
          Status:{" "}
          <span className="font-medium capitalize text-black">{order.status}</span>{" "}
          — payment coming soon.
        </p>
        <p className="mt-1 text-sm text-black/60">
          Order ID: <span className="font-mono text-black">{order.id}</span>
        </p>

        <div className="mt-6 space-y-3 border-t border-black/10 pt-6">
          <p className="font-semibold text-black">Ship to</p>
          <p className="text-sm text-black">{order.shipping_name}</p>
          {order.shipping_phone ? (
            <p className="text-sm text-black/60">{order.shipping_phone}</p>
          ) : null}
          <p className="text-sm text-black/60">{order.shipping_address}</p>
        </div>

        <div className="mt-6 space-y-3 border-t border-black/10 pt-6">
          <p className="font-semibold text-black">Items</p>
          {items.map((item, index) => (
            <div
              key={`${item.title}-${item.size}-${index}`}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-black">
                {item.title} × {item.quantity} {item.size ? `(${item.size})` : ""}
              </span>
              <span className="font-medium text-black">
                ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-black/10 pt-3">
            <span className="font-semibold text-black">Total</span>
            <span className="text-lg font-bold text-black">
              ${Number(order.total).toFixed(2)}
            </span>
          </div>
        </div>

        <Button asChild className="mt-8 w-full">
          <Link to="/">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
};

export default CheckoutConfirmation;
