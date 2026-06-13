import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Cart = () => {
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();

  const navigate = useNavigate();
  const handleIncrease = (productId: number, size: string | null) => {
    void addToCart(productId, 1, { size });
  };

  const handleDecrease = (productId: number, size: string | null) => {
    void removeFromCart(productId, { size });
  };

  const handleRemoveItem = (productId: number, size: string | null) => {
    void removeFromCart(productId, { size }, true);
  };

  const handleClear = () => {
    void clearCart();
  };

  const total = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.quantity),
    0,
  );

  return (
    <div className="px-[16px] pt-[80px] pb-[168px] lg:px-[100px]">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-poppins text-[32px] font-bold uppercase lg:text-[40px]">
          Your Cart
        </h2>
        {cartItems.length > 0 ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-medium text-black/60 underline-offset-2 transition-colors hover:text-black hover:underline cursor-pointer"
          >
            Clear Cart
          </button>
        ) : null}
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-[20px] border border-black/10 bg-white px-6 py-14 text-center">
          <p className="text-[18px] font-semibold text-black">
            Your cart is empty
          </p>
          <p className="mt-2 text-sm text-black/60">
            Add products from the shop to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-[20px] border border-black/10 bg-white px-5 py-5 shadow-[0_1px_0_rgba(0,0,0,0.03)] lg:px-6">
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={item.product_id + (item.size ?? "")}
                  className={[
                    "flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between",
                    index !== cartItems.length - 1
                      ? "border-b border-black/10 pb-4"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        item.thumbnail ||
                        "https://via.placeholder.com/80x80?text=No+Image"
                      }
                      alt={item.title}
                      className="h-16 w-16 rounded-xl object-cover border border-black/10 bg-[#F0F0F0]"
                    />
                    <div className="min-w-0">
                      <p className="text-[20px] font-semibold text-black">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-black/60">
                        Qty: {item.quantity}
                      </p>
                      <p className="mt-1 text-sm text-black/60">
                        Size: {item.size}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                    <div className="rounded-full border border-black/10 bg-[#F0F0F0] px-4 py-2">
                      <span className="text-sm font-medium text-black lg:text-base">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center rounded-full border border-black/10 bg-[#F0F0F0] p-1">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-base text-black transition-colors hover:bg-black hover:text-white cursor-pointer"
                        onClick={() => handleDecrease(item.product_id, item.size)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-black">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-base text-black transition-colors hover:bg-black hover:text-white cursor-pointer"
                        onClick={() => handleIncrease(item.product_id, item.size)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white cursor-pointer"
                      onClick={() => handleRemoveItem(item.product_id, item.size)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-fit rounded-[20px] border border-black/10 bg-white px-5 py-5 shadow-[0_1px_0_rgba(0,0,0,0.03)] lg:px-6">
            <p className="text-xl font-bold text-black">Order Summary</p>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-sm lg:text-base">
                <span className="text-black/60">Items</span>
                <span className="font-medium text-black">
                  {cartItems.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm lg:text-base">
                <span className="text-black/60">Total Quantity</span>
                <span className="font-medium text-black">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-black/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[15px] text-black/60 lg:text-base">
                  Total
                </span>
                <span className="text-[22px] font-bold text-black lg:text-[26px]">
                  ${total}
                </span>
              </div>
            </div>

            <Button
              onClick={() => {
                navigate("/checkout");
              }}
              className="mt-6 h-[52px] w-full rounded-[62px] bg-black font-semibold text-white transition-colors hover:bg-black/80 cursor-pointer"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
