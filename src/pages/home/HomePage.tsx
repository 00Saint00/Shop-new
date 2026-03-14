import Banner from "./banner/Banner";
import axios from "axios";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";
import NewArrivals from "./newArrivals/NewArrivals";
import TopSelling from "./topSelling/TopSelling";

const HomePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(
          "https://dummyjson.com/products?limit=0",
        );
        setProducts(response.data.products);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBrands();
  }, []);

  const categories = [
    "womens-dresses",
    "womens-jewellery",
    "womens-shoes",
    "mens-shirts",
    "mens-shoes",
    "mens-watches",
  ];

  const latestArrivals = [...products]
    .filter((product: any) => categories.includes(product.category))
    // .sort((a: any, b: any) => b.rating - a.rating)
    .sort(
      (a: any, b: any) =>
        new Date(b.meta.createdAt).getTime() -
        new Date(a.meta.createdAt).getTime(),
    )
    .slice(0, 10)
    .map((product: any, index: number) => ({
      ...product,
      priority: index < 4,
    }));

  const topSelling = [...products]
    .filter((product: any) => categories.includes(product.category))
    .sort((a: any, b: any) => b.rating - a.rating)
    .slice(0, 10)
    .map((product: any, index: number) => ({
      ...product,
      priority: index < 4,
    }));

  return (
    <div>
      <Banner />{" "}
      <div className="bg-black py-[32px] lg:py-[44px] text-center">
        <Swiper
          key={products.length}
          modules={[Autoplay]}
          spaceBetween={16}
          slidesPerView={1}
          allowTouchMove={false}
          speed={3000}
          loop={true}
          loopAdditionalSlides={5}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            waitForTransition: false,
            pauseOnMouseEnter: false,
          }}
        >
          {products?.map((product: any) => (
            <SwiperSlide key={product.id}>
              <h3 className="text-white text-[30px] lg:text-[50px] font-bold">
                {product.brand}
              </h3>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="px-[16px] lg:px-[100px] py-16">

      <section className="pb-12 text-center md:pb-16">
        <NewArrivals products={latestArrivals} />
      </section>
      <section className="pv-12 text-center md:pb-16">
        <TopSelling products={topSelling} />
      </section>
      </div>
    </div>
  );
};

export default HomePage;
