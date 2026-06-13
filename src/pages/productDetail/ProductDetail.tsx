import { Button } from "@/components/ui/button";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import ProductDetailSkeleton from "./ProductDetailSkeleton";
import { supabase } from "@/lib/supabase";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/Store";

type ProductReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  reviewer_name: string | null;
  created_at: string;
};

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
          <Button
            asChild
            className="rounded-full bg-black text-white hover:bg-black/90"
          >
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
  const [retryKey, setRetryKey] = useState(0);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const profile = useSelector((state: RootState) => state.auth.profile);
  const productIdNum = id ? Number(id) : NaN;
  const listed = Number.isFinite(productIdNum) && isWishlisted(productIdNum);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ProductReviewRow[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [draftRating, setDraftRating] = useState(5);
  const [draftComment, setDraftComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    setReviewsError(null);

    const { data, error } = await supabase
      .from("product_reviews")
      .select("id, rating, comment, user_id, reviewer_name, created_at")
      .eq("product_id", String(id))
      .order("created_at", { ascending: false });

    if (error) {
      setReviewsError(error.message);
      setReviews([]);
    } else {
      setReviews((data ?? []) as ProductReviewRow[]);
    }
    setReviewsLoading(false);
  }, [id]);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://dummyjson.com/products/${id}`);
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
    setSelectedSize(null);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    void fetchReviews();
  }, [id, fetchReviews]);

  const ownReview = useMemo(
    () => reviews.find((review) => review.user_id === profile?.id) ?? null,
    [reviews, profile?.id],
  );

  useEffect(() => {
    if (ownReview) {
      setDraftRating(ownReview.rating);
      setDraftComment(ownReview.comment ?? "");
    } else {
      setDraftRating(5);
      setDraftComment("");
    }
  }, [ownReview?.id, ownReview?.rating, ownReview?.comment]);

  const displayRating = useMemo(() => {
    if (reviews.length > 0) {
      return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    }
    return Number(product?.rating ?? 0);
  }, [reviews, product?.rating]);

  const handleSubmitReview = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id || !id) {
      toast.error("Please log in to leave a review");
      return;
    }

    const reviewerName =
      profile?.full_name?.trim() ||
      user.email?.split("@")[0] ||
      "Customer";

    const payload = {
      user_id: user.id,
      product_id: String(id),
      rating: draftRating,
      comment: draftComment.trim() || null,
      reviewer_name: reviewerName,
    };

    setSubmittingReview(true);

    let saveError: { message: string } | null = null;

    if (ownReview) {
      const { error } = await supabase
        .from("product_reviews")
        .update({
          rating: payload.rating,
          comment: payload.comment,
          reviewer_name: payload.reviewer_name,
        })
        .eq("id", ownReview.id)
        .eq("user_id", user.id);
      saveError = error;
    } else {
      const { error } = await supabase.from("product_reviews").insert(payload);
      saveError = error;
    }

    setSubmittingReview(false);

    if (saveError) {
      console.error("Review save error:", saveError);
      toast.error(saveError.message || "Could not save your review");
      return;
    }

    toast.success(ownReview ? "Review updated" : "Review posted");
    void fetchReviews();
  };

  const reviewAuthor = (review: ProductReviewRow) => {
    if (review.reviewer_name?.trim()) return review.reviewer_name;
    if (review.user_id === profile?.id && profile?.full_name?.trim()) {
      return profile.full_name;
    }
    return "Customer";
  };

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
    return <ProductDetailError message={error} onRetry={handleRetry} />;
  }

  if (!product) {
    return (
      <ProductDetailError
        message="This product could not be found."
        onRetry={handleRetry}
      />
    );
  }

  const handleWishlist = () => {
    if (!Number.isFinite(productIdNum)) return;
    void toggleWishlist(productIdNum);
  };

  return (
    <div className="px-4 pt-[80px] pb-[50%] md:pb-[15%] lg:px-[100px]">
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
                      i < Math.round(displayRating)
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
                aria-label={`${listed ? "Remove from wishlist" : "Add to wishlist"} ${product.title ?? "product"}`}
                className={[
                  "-m-1 rounded-full p-1 transition-colors hover:bg-black/5 focus-visible:outline focus-visible:ring-2 focus-visible:ring-black/20",
                  listed ? "text-red-500" : "text-black/35 hover:text-red-500",
                ].join(" ")}
                onClick={() => {
                  handleWishlist();
                }}
              >
                <Heart
                  className={[
                    "h-4 w-4 transition-colors",
                    listed ? "fill-red-500 text-red-500" : "text-inherit",
                  ].join(" ")}
                  strokeWidth={1.75}
                />
              </button>
            </div>
            <p className="text-sm font-semibold">
              {displayRating.toFixed(1)} /5 stars
              {reviews.length > 0 ? (
                <span className="ml-1 font-normal text-black/50">
                  ({reviews.length})
                </span>
              ) : null}
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
              {(["S", "M", "L", "XL"] as const).map((size) => (
                <Button
                  key={size}
                  variant="outline"
                  className={[
                    "rounded-full border px-8 py-3 font-normal transition-colors cursor-pointer",
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white text-black hover:bg-black hover:text-white",
                  ].join(" ")}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-black/10 pt-4">
            <div className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-[#F0F0F0] lg:h-14 lg:gap-4">
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-colors hover:bg-black hover:text-white lg:h-9 lg:w-9 lg:text-lg"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
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
                      typeof product?.stock === "number" && product.stock > 0
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
              className="h-12 w-full rounded-full bg-black text-white transition-colors hover:bg-black/70 lg:h-14 cursor-pointer"
              onClick={() => {
                if (!selectedSize) {
                  toast.error("Please select a size");
                  return;
                }
                if (!Number.isFinite(productIdNum)) return;
                void addToCart(productIdNum, quantity, {
                  title: product.title as string,
                  price: Number(product.price),
                  thumbnail: (product.thumbnail ??
                    product.images?.[0] ??
                    product.image ??
                    null) as string | null,
                  size: selectedSize,
                });
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
            <TabsTrigger
              value="prouctDetails"
              className="bg-transparent py-5 text-[16px] font-bold data-[state=active]:bg-transparent "
            >
              Product Details
            </TabsTrigger>
            <TabsTrigger
              value="ratingsAndReviews"
              className="bg-transparent py-5 text-[16px] font-bold data-[state=active]:bg-transparent "
            >
              Ratings and Reviews
            </TabsTrigger>
            <TabsTrigger
              value="faqs"
              className="bg-transparent py-5 text-[16px] font-bold data-[state=active]:bg-transparent "
            >
              FAQs
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="prouctDetails">
              <div>
                <div className="flex justify-between">
                  <p className="text-[20px] font-medium">Brand:</p>
                  <p className="text-[20px] font-bold">{product.brand}</p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-[20px] font-medium">Category:</p>
                  <p className="text-[20px] font-bold">{product.category}</p>
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
              <div className="mb-8 rounded-[20px] border border-black/10 bg-[#FAFAFA] p-5">
                <p className="text-base font-bold text-black">
                  {ownReview ? "Update your review" : "Write a review"}
                </p>
                {profile?.id ? (
                  <div className="mt-4 space-y-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          aria-label={`Rate ${star} out of 5`}
                          className="rounded p-1 text-2xl"
                          onClick={() => setDraftRating(star)}
                        >
                          <span
                            className={
                              star <= draftRating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            &#9733;
                          </span>
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={3}
                      value={draftComment}
                      onChange={(e) => setDraftComment(e.target.value)}
                      placeholder="Comment (optional)"
                      className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <Button
                      type="button"
                      disabled={submittingReview}
                      onClick={() => void handleSubmitReview()}
                      className="rounded-full bg-black text-white hover:bg-black/80"
                    >
                      {submittingReview
                        ? "Saving..."
                        : ownReview
                          ? "Update review"
                          : "Post review"}
                    </Button>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-black/60">
                    <Link to="/auth" className="font-medium text-black underline">
                      Log in
                    </Link>{" "}
                    to leave a review.
                  </p>
                )}
              </div>

              {reviewsLoading ? (
                <p className="text-sm text-black/60">Loading reviews...</p>
              ) : reviewsError ? (
                <p className="text-sm text-red-500">{reviewsError}</p>
              ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-black/10 bg-white p-4"
                    >
                      <div className="mb-2 flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={
                              star <= review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            &#9733;
                          </span>
                        ))}
                      </div>
                      <p className="font-semibold text-foreground">
                        {reviewAuthor(review)}
                      </p>
                      {review.comment ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-muted-foreground">
                        Posted on{" "}
                        {new Date(review.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              )}
            </TabsContent>
            <TabsContent value="faqs">
              <div className="mt-4 space-y-2">
                {(product.faqs ?? []).map((faq: any, i: number) => (
                  <p key={i} className="font-medium">
                    {faq.question}
                  </p>
                ))}
                {(product.faqs ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No FAQs yet.</p>
                ) : null}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetail;
