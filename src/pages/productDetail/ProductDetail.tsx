import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart } from "lucide-react";

function ProductDetailSkeleton() {
  return (
    <div
      className="px-4 pt-[80px] pb-[130px] lg:px-[100px]"
      aria-busy="true"
      aria-label="Loading product"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="flex w-full shrink-0 gap-4 lg:w-1/2">
          <div className="hidden w-20 flex-col gap-3 lg:flex">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
          <Skeleton className="aspect-square w-full rounded-xl" />
        </div>
        <div className="flex w-full flex-col justify-center gap-3 lg:w-1/2">
          <Skeleton className="h-9 w-full max-w-lg lg:h-10" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-1 h-8 w-28" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5 max-w-xl" />
          <div className="mt-4 flex gap-2 border-t border-transparent pt-4">
            <Skeleton className="h-10 w-12 rounded-full" />
            <Skeleton className="h-10 w-12 rounded-full" />
            <Skeleton className="h-10 w-12 rounded-full" />
            <Skeleton className="h-10 w-12 rounded-full" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-transparent pt-4">
            <Skeleton className="h-12 rounded-full lg:h-14" />
            <Skeleton className="h-12 rounded-full lg:h-14" />
          </div>
        </div>
      </div>
      <div className="mt-10 space-y-4">
        <div className="flex flex-wrap gap-4 py-5">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-40 w-full max-w-3xl rounded-lg" />
      </div>
    </div>
  );
}

function ProductDetailError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="px-4 pt-[80px] pb-[130px] lg:px-[100px]">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <p className="text-lg font-semibold text-foreground">{message}</p>
        <p className="mt-2 text-sm text-black/60">
          Check the link or try again in a moment.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={onRetry}
            >
              Try again
            </Button>
          ) : null}
          <Button asChild className="rounded-full bg-black text-white hover:bg-black/90">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://dummyjson.com/products/${id}`,
      );
      setProduct(response.data);
      setSelectedImage("");
    } catch {
      setProduct(null);
      setError("We couldn’t load this product.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchProduct();
  }, [id, retryKey, fetchProduct]);

  useEffect(() => {
    setQuantity(1);
  }, [id]);

  const handleRetry = () => setRetryKey((k) => k + 1);

  const images = useMemo(() => {
    const list = Array.isArray(product?.images) ? product.images : [];
    const fallback = product?.image ? [product.image] : [];
    return (list.length ? list : fallback).filter(Boolean);
  }, [product]);

  const mainImageSrc = selectedImage || images[0] || "";

  if (!id) {
    return (
      <ProductDetailError message="This product link is invalid or incomplete." />
    );
  }

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error) {
    return (
      <ProductDetailError message={error} onRetry={handleRetry} />
    );
  }

  if (!product) {
    return (
      <ProductDetailError
        message="This product could not be found."
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="px-4 pt-[80px] pb-[130px] lg:px-[100px]">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="w-full shrink-0 lg:w-1/2">
          <div className="flex gap-4">
            <div className="hidden w-20 flex-col gap-3 lg:flex">
              {images.slice(0, 3).map((src: string) => {
                const isActive = src === mainImageSrc;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setSelectedImage(src)}
                    className={[
                      "aspect-square overflow-hidden rounded-lg border bg-muted transition-colors",
                      isActive
                        ? "border-black"
                        : "border-black/10 hover:border-black/30",
                    ].join(" ")}
                    aria-label="Select product image"
                  >
                    <img
                      src={src}
                      alt={product.title ?? "Product"}
                      className="h-full w-full object-contain object-center"
                    />
                  </button>
                );
              })}
            </div>

            <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted">
              <img
                src={mainImageSrc}
                alt={product.title ?? "Product"}
                className="h-full w-full object-contain object-center"
              />
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col justify-center lg:w-1/2">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            {product.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4">
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
              <Heart
                className="h-4 w-4 shrink-0 text-black/35"
                strokeWidth={1.75}
                aria-hidden
              />
            </div>
            <p className="text-sm font-semibold">
              {Math.round(product.rating)} /5 stars
            </p>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-semibold">${product.price}</p>
          </div>
          <div className="mt-3">
            <p className="text-xl font-medium">{product.description}</p>
          </div>

          <div className="mt-3 border-t pt-4 border-black/10">
            <p className="text-[20px] text-black text-opacity-60 pb-[16px]">
              choose size
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-full border-black/10 bg-white px-8 py-3 font-normal text-black transition-colors hover:bg-black hover:text-white cursor-pointer"
              >
                {" "}
                S{" "}
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-black/10 bg-white px-8 py-3 font-normal text-black transition-colors hover:bg-black hover:text-white cursor-pointer"
              >
                {" "}
                M{" "}
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-black/10 bg-white px-8 py-3 font-normal text-black transition-colors hover:bg-black hover:text-white cursor-pointer"
              >
                {" "}
                L{" "}
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-black/10 bg-white px-8 py-3 font-normal text-black transition-colors hover:bg-black hover:text-white cursor-pointer"
              >
                {" "}
                XL{" "}
              </Button>
            </div>
          </div>

          {/* add to cart and quantity section */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-black/10 pt-4">
            <div className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-[#F0F0F0] lg:h-14 lg:gap-4">
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-colors hover:bg-black hover:text-white lg:h-9 lg:w-9 lg:text-lg"
                onClick={() =>
                  setQuantity((q) => Math.max(1, q - 1))
                }
              >
                -
              </button>
              <span className="min-w-[1.5rem] text-center text-sm font-medium lg:text-lg">
                {quantity}
              </span>
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-colors hover:bg-black hover:text-white lg:h-9 lg:w-9 lg:text-lg"
                onClick={() =>
                  setQuantity((q) => {
                    const cap =
                      typeof product?.stock === "number" &&
                      product.stock > 0
                        ? product.stock
                        : 999;
                    return Math.min(cap, q + 1);
                  })
                }
              >
                +
              </button>
            </div>
            <Button
              className="h-12 w-full rounded-full bg-black text-white transition-colors hover:bg-black/90 lg:h-14"
              onClick={() => {
                toast.success("Item added to cart!");
              }}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Tabs defaultValue="prouctDetails" className="w-full">
          <TabsList className="flex h-auto w-full flex-row gap-4 py-5">
            <TabsTrigger value="prouctDetails" className="bg-transparent py-5 text-[16px] font-bold data-[state=active]:bg-transparent ">
              Product Details
            </TabsTrigger>
            <TabsTrigger value="ratingsAndReviews" className="bg-transparent py-5 text-[16px] font-bold data-[state=active]:bg-transparent ">
              Ratings and Reviews
            </TabsTrigger>
            <TabsTrigger value="faqs" className="bg-transparent py-5 text-[16px] font-bold data-[state=active]:bg-transparent ">
              FAQs
            </TabsTrigger>
          </TabsList>

          {/* product details content */}
         <div className="mt-4">
         <TabsContent value="prouctDetails">
            <div>
              <div className="flex justify-between">
                <p className="text-[20px] font-medium">Brand:</p>
                <p className="text-[20px] font-bold">
                  {product.brand}
                </p>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-[20px] font-medium">Category:</p>
                <p className="text-[20px] font-bold">
                  {product.category}
                </p>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-[20px] font-medium">
                  Shipping Information:
                </p>
                <p className="text-[20px] font-bold">
                  {product.shippingInformation}
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="ratingsAndReviews">
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {(product.reviews ?? []).map((review: any, i: number) => {
                const rating = Math.min(5, Math.max(0, Number(review.rating) ?? 0));
                const dateStr = review.date
                  ? new Date(review.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "";
                return (
                  <div
                    key={i}
                    className="rounded-lg border border-black/10 bg-white p-4"
                  >
                    <div className="mb-2 flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          &#9733;
                        </span>
                      ))}
                    </div>
                    <p className="font-semibold text-foreground">
                      {review.reviewerName ?? "Anonymous"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {review.comment ?? ""}
                    </p>
                    {dateStr && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Posted on {dateStr}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {(product.reviews ?? []).length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">No reviews yet.</p>
            )}
          </TabsContent>
          <TabsContent value="faqs">
            <div className="mt-4 space-y-2">
              {(product.faqs ?? []).map((faq: any, i: number) => (
                <p key={i} className="font-medium">{faq.question}</p>
              ))}
              {(product.faqs ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No FAQs yet.</p>
              )}
            </div>
          </TabsContent>
         </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetail;
