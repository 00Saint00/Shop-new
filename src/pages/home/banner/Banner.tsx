import bannerImg from "../../../assets/header/header-homepage.webp";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Banner() {
  return (
    <div className="w-full bg-[#F2F0F1]">
      <div className="flex flex-col lg:flex-row">
        {/* Text Content Section - Left */}
        <div className="w-full lg:w-1/2 flex items-center order-1 lg:order-1">
          <div className="py-[60px] lg:py-[113px] px-[16px] lg:px-[100px] w-full">
            <h1 className="text-[28px] lg:text-[64px] font-poppins font-bold leading-tight lg:leading-[64px] max-w-full lg:max-w-[577px] text-center lg:text-left mx-auto lg:mx-0">
              FIND CLOTHES THAT MATCH YOUR STYLE
            </h1>

            <p className="text-[16px] max-w-full lg:max-w-[577px] text-[#7c7b7b] py-[24px] lg:py-[32px] text-center lg:text-left mx-auto lg:mx-0">
              Browse through our diverse range of meticulously crafted garments,
              designed to bring out your individuality and cater to your sense
              of style.
            </p>

            <div className="flex justify-center lg:justify-start">
              <Link to="/shop">
                <Button className="bg-black text-white px-[40px] lg:px-[67.5px] py-[15px] rounded-full font-semibold hover:bg-gray-600 transition duration-300">
                  Shop Now
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start lg:flex-row gap-[24px] lg:gap-[30px] pt-[40px] lg:pt-[50px] items-center lg:items-start">
              <div className="text-center lg:text-left">
                <p className="text-[32px] lg:text-[40px] font-bold">200+</p>
                <p className="text-[16px] text-black text-opacity-60">
                  International Brands
                </p>
              </div>

              <div className="lg:border-t-0 lg:border-x lg:border-black lg:border-opacity-10 px-0 lg:px-[32px] text-center">
                <p className="text-[32px] lg:text-[40px] font-bold">2,000+</p>
                <p className="text-[16px] text-black text-opacity-60">
                  High Quality Products
                </p>
              </div>

              <div className="text-center lg:text-left">
                <p className="text-[32px] lg:text-[40px] font-bold">30,000+</p>
                <p className="text-[16px] text-black text-opacity-60">
                  Happy Customers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Section - Right */}
        <div className="w-full lg:w-1/2 relative overflow-hidden order-2 lg:order-2 flex items-center justify-center">
          <img
            src={bannerImg}
            alt="Fashion models"
            className="w-full h-full max-w-[80%] max-h-[80%] object-contain"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

export default Banner;
