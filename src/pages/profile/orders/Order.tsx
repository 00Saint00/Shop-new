import { useSelector } from "react-redux";
import type { RootState } from "@/store/Store";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

type OrderItemRow = {
  id: string;
  title: string | null;
  product_id: string | null;
  price: number;
  quantity: number;
  thumbnail: string | null;
  order_id: string;
};

type OrderWithItems = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  order_items: OrderItemRow[] | null;
};

const Order = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const profile = useSelector((state: RootState) => state.auth.profile);
  const authReady = useSelector((state: RootState) => state.auth.authReady);

  useEffect(() => {
    if (!authReady) return;

    if (!profile?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      const { data: orderRows, error: ordersError } = await supabase
        .from("orders")
        .select("id, created_at, status, total")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        setError(ordersError.message);
        setOrders([]);
        setLoading(false);
        return;
      }

      const rows = orderRows ?? [];
      if (rows.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const orderIds = rows.map((row) => row.id);
      const { data: itemRows, error: itemsError } = await supabase
        .from("order_items")
        .select("id, title, product_id, price, quantity, thumbnail, order_id")
        .in("order_id", orderIds);

      if (itemsError) {
        setError(itemsError.message);
        setOrders([]);
        setLoading(false);
        return;
      }

      const itemsByOrderId = (itemRows ?? []).reduce<
        Record<string, OrderItemRow[]>
      >((acc, item) => {
        const row = item as OrderItemRow;
        if (!acc[row.order_id]) acc[row.order_id] = [];
        acc[row.order_id].push(row);
        return acc;
      }, {});

      setOrders(
        rows.map((order) => ({
          ...order,
          order_items: itemsByOrderId[order.id] ?? [],
        })),
      );
      setLoading(false);
    };

    void fetchOrders();
  }, [authReady, profile?.id]);

  const itemLabel = (item: OrderItemRow) =>
    item.title?.trim() ||
    (item.product_id ? `Product #${item.product_id}` : "Ordered item");

  const orderDate = (createdAt: string) =>
    new Date(createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (!authReady || loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-sm">
        Could not load orders: {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        You have no orders yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {orders.map((order) => {
        const items = order.order_items ?? [];

        return (
          <section
            key={order.id}
            className="rounded-[20px] border border-black/10 bg-white p-5"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-4">
              <div>
                <p className="font-semibold text-black">
                  Order {order.id.slice(0, 8)}
                </p>
                <p className="text-sm text-black/60">{orderDate(order.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm capitalize text-black/60">{order.status}</p>
                <p className="font-semibold text-black">
                  ${Number(order.total).toFixed(2)}
                </p>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-black/60">No items for this order.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-xl border border-black/10 p-3"
                  >
                    <img
                      src={
                        item.thumbnail ||
                        "https://via.placeholder.com/80x80?text=No+Image"
                      }
                      alt={itemLabel(item)}
                      className="h-20 w-20 shrink-0 rounded-xl border border-black/10 object-cover"
                    />
                    <div>
                      <p className="font-semibold text-black">{itemLabel(item)}</p>
                      <p className="mt-1 text-sm text-black/60">
                        Qty: {item.quantity}
                      </p>
                      <p className="mt-1 text-sm font-medium text-black">
                        ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default Order;
