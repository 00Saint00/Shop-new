import { Link } from "react-router-dom";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

import "swiper/css";
import "swiper/css/autoplay";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const TopSelling = ({ products }: { products: any[] }) => {
  return (
    <section className="">
      <h2 className="mb-6 text-2xl font-bold lg:text-[50px]">Top Selling</h2>

      <div className="">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          allowTouchMove={true}
          speed={3000}
          loop
          loopAdditionalSlides={5}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          autoplay={{
            delay: 0,
            disableOnInteraction: true,
            waitForTransition: false,
            pauseOnMouseEnter: false,
          }}
        >
          {(products ?? []).map((product) => {
            const productHref = `/product/${product.id}/${slugify(product.title)}`;
            return (
              <SwiperSlide key={product.id}>
                <Card className="overflow-hidden">
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
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <div className="mt-8">
        <Link to="/shop/top-selling">
          <Button
            variant="outline"
            className="rounded-full border-black/10 bg-white px-8 py-3 font-normal text-black transition-colors hover:bg-black hover:text-white"
          >
            View all
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default TopSelling;
