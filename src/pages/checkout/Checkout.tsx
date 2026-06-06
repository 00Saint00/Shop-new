import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/Store";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type ShippingFormData = {
  full_name: string;
  email: string;
  phone: string;
  address: string;
};

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const profile = useSelector((state: RootState) => state.auth.profile);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormData>({
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      full_name: profile.full_name ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
    });
  }, [profile, reset]);

  const total = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.quantity),
    0,
  );
  const totalQuantity = cartItems.reduce(
    (acc, item) => acc + Number(item.quantity),
    0,
  );

  const onSubmit = async (data: ShippingFormData) => {
    if (!profile?.id) {
      toast.error("Please log in to place an order");
      return;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: profile.id,
        status: "pending",
        subtotal: total,
        total,
        shipping_name: data.full_name,
        shipping_phone: data.phone || null,
        shipping_address: data.address,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      toast.error(orderError?.message || "Failed to place order");
      return;
    }

    const lineItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: String(item.product_id),
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      thumbnail: item.thumbnail,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(lineItems);

    if (itemsError) {
      toast.error(itemsError.message || "Failed to save order items");
      return;
    }

    await clearCart();
    toast.success("Order placed successfully");
    navigate(`/checkout/confirmation/${order.id}`);
  };

  return (
    <div className="px-[16px] pt-[80px] pb-[168px] lg:px-[100px]">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-poppins text-[32px] font-bold uppercase lg:text-[40px]">
          Checkout
        </h2>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-[20px] border border-black/10 bg-white px-6 py-14 text-center">
          <p className="text-[18px] font-semibold text-black">
            Your cart is empty
          </p>
          <p className="mt-2 text-sm text-black/60">
            Add products from the shop before checking out.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_600px]">
          <div className="rounded-[20px] border border-black/10 bg-white px-5 py-5 shadow-[0_1px_0_rgba(0,0,0,0.03)] lg:px-6">
            <p className="text-xl font-bold text-black">Order Summary</p>

            <div className="mt-5 space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={item.product_id}
                  className={[
                    "flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between",
                    index !== cartItems.length - 1
                      ? "border-b border-black/10 pb-4"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={
                        item.thumbnail ||
                        "https://via.placeholder.com/80x80?text=No+Image"
                      }
                      alt={item.title}
                      className="h-16 w-16 rounded-xl border border-black/10 bg-[#F0F0F0] object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-[20px] font-semibold text-black">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-black/60">
                        ${Number(item.price).toFixed(2)} each
                      </p>
                      <p className="mt-1 text-sm text-black/60">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full border border-black/10 bg-[#F0F0F0] px-4 py-2">
                    <span className="text-sm font-medium text-black lg:text-base">
                      ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-t border-black/10 pt-5">
              <div className="flex items-center justify-between text-sm lg:text-base">
                <span className="text-black/60">Items</span>
                <span className="font-medium text-black">
                  {cartItems.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm lg:text-base">
                <span className="text-black/60">Total Quantity</span>
                <span className="font-medium text-black">{totalQuantity}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[15px] text-black/60 lg:text-base">
                  Total
                </span>
                <span className="text-[22px] font-bold text-black lg:text-[26px]">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="h-fit rounded-[20px] border border-black/10 bg-white px-5 py-5 shadow-[0_1px_0_rgba(0,0,0,0.03)] lg:px-6">
            <p className="text-xl font-bold text-black">Shipping</p>
            <form
              className="mt-5 space-y-4"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full rounded-md border px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black"
                    {...register("full_name", {
                      required: "Full name is required",
                    })}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-500">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-md border px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone</label>
                  <input
                    type="tel"
                    placeholder="Phone"
                    className="w-full rounded-md border px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black"
                    {...register("phone", { required: "Phone is required" })}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="Address"
                    className="w-full rounded-md border px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black"
                    {...register("address", {
                      required: "Address is required",
                    })}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 h-[52px] w-full cursor-pointer rounded-[62px] bg-black font-semibold text-white hover:bg-black/80"
              >
                {isSubmitting ? "Placing order..." : "Place Order"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
