import React from "react";
// import { EnvelopeIcon } from "@heroicons/react/24/outline";
// import { FaGithub, FaFacebook, FaInstagram } from "react-icons/fa";
// import { FaXTwitter } from "react-icons/fa6";
import visa from "../../assets/logo/visa.svg";
import masterCard from "../../assets/logo/master-card.svg";
import applePay from "../../assets/logo/apple-pay.svg";
import payPal from "../../assets/logo/paypal.svg";
import googlePay from "../../assets/logo/google-pay.svg";
import { Mail, Github, Facebook, Instagram, Twitter } from "lucide-react";
import logo from "../../assets/logo/SHOP.CO.svg";

function Footer() {
  return (
    <div className="relative bg-[#F0F0F0] text-white pt-[189px] pb-[77px] py-[186px] lg:py-[140px] px-[18px] lg:px-[100px]">
      <div className="absolute inset-x-0 -top-[16%] md:-top-[10%] lg:-top-[16%] mx-auto w-[96%] lg:w-[90%] bg-black py-[32px] lg:py-[43px] px-[24px] lg:px-[64px] rounded-[20px] grid grid-cols-1 md:grid-cols-2 gap-[32px] lg:gap-[212px]">
        <h3 className="text-[32px] lg:text-[40px] font-bold leading-[35px] lg:leading-[45px] text-white text-poppins">
          STAY UPTO DATE ABOUT OUR LATEST OFFERS
        </h3>

        <div>
          <div className="flex justify-center gap-[12px] border rounded-[62px] bg-white mb-[14px] py-[12px] px-[16px]">
            <Mail className="h-[24px] w-[24px] text-black text-opacity-60 font-bold stroke-[2]" />
            <input
              type="email"
              placeholder="Enter your email address..."
              className="w-full text-black focus:outline-none"
            />
          </div>
          <button className="w-full bg-white hover:bg-zinc-300 hover:text-black py-[12px] px-[80.5px] rounded-[62px] text-black text-[14px] cursor-pointer">
            Subscribe to newsletter
          </button>
        </div>
      </div>
      {/* <div className="absolute inset-x-0 top-0 transform -translate-y-[57%] mx-auto w-[96%] lg:w-[90%] bg-black py-[32px] lg:py-[43px] px-[24px] lg:px-[64px] rounded-[20px] grid grid-cols-1 md:grid-cols-2 gap-[32px] lg:gap-[212px] min-h-[200px]">
        <h3 className="text-[32px] lg:text-[40px] font-bold leading-[35px] lg:leading-[45px] text-white text-poppins">
          STAY UPTO DATE ABOUT OUR LATEST OFFERS
        </h3>

        <div>
          <div className="flex justify-center gap-[12px] border rounded-[62px] bg-white mb-[14px] py-[12px] px-[16px]">
            <EnvelopeIcon className="h-[24px] w-[24px] text-black text-opacity-60 font-bold stroke-[2]" />
            <input
              type="email"
              placeholder="Enter your email address..."
              className="w-full text-black"
            />
          </div>
          <button className="w-full bg-white hover:bg-black hover:text-white py-[12px] px-[80.5px] rounded-[62px] text-black text-[14px]">
            Subscribe to newsletter
          </button>
        </div>
      </div> */}

      <div className="flex flex-col md:flex-row md:justify-between gap-8">
        {/* Left box: Logo + description */}
        <div className="md:w-1/3 lg:w-1/5">
          <img src={logo} alt="Logo" className="mb-[25px]" loading="lazy" />
          <p className="text-[14px] leading-[22px] text-black/60">
            We have clothes that suit your style and which you’re proud to wear.
            From women to men.
          </p>
          <div className="flex gap-3 mt-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center p-[9px] rounded-full border border-black border-opacity-20 bg-white transition-colors duration-300 hover:bg-black"
            >
              <Twitter className="h-[24px] w-[24px] text-black group-hover:text-white" />
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center p-[9px] rounded-full border border-black border-opacity-20 bg-white transition-colors duration-300 hover:bg-black"
            >
              <Facebook className="h-[24px] w-[24px] text-black group-hover:text-white" />
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center p-[9px] rounded-full border border-black border-opacity-20 bg-white transition-colors duration-300 hover:bg-black"
            >
              <Github className="h-[24px] w-[24px] text-black group-hover:text-white" />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center p-[9px] rounded-full border border-black border-opacity-20 bg-white transition-colors duration-300 hover:bg-black"
            >
              <Instagram className="h-[24px] w-[24px] text-black group-hover:text-white" />
            </a>
          </div>
        </div>

        {/* Right box: Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 flex-1">
          <div>
            <h3 className="text-[16px] leading-[18px] tracking-[3px] font-medium text-black mb-[26px]">
              Company
            </h3>
            <ul className="space-y-2 text-[#000000] text-opacity-60 text-sm">
              <li>About</li>
              <li>Features</li>
              <li>Works</li>
              <li>Career</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[16px] leading-[18px] tracking-[3px] font-medium text-black mb-[26px]">
              Help
            </h3>
            <ul className="space-y-2 text-black text-opacity-60 text-sm">
              <li>Customer Support</li>
              <li>Delivery Details</li>
              <li>Terms & Conditions</li>
              <li>Privacy Policy</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[16px] leading-[18px] tracking-[3px] font-medium text-black mb-[26px]">
              FAQ
            </h3>
            <ul className="space-y-2 text-black text-opacity-60 text-sm">
              <li>Account</li>
              <li>Manage Deliveries</li>
              <li>Orders</li>
              <li>Payments</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[16px] leading-[18px] tracking-[3px] font-medium text-black mb-[26px]">
              Resources
            </h3>
            <ul className="space-y-2 text-black text-opacity-60 text-sm">
              <li>Free eBooks</li>
              <li>Development Tutorial</li>
              <li>How to – Blog</li>
              <li>Youtube Playlist</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-black/10 flex flex-col items-center gap-4 lg:flex-row lg:justify-between mt-[50px] py-[25px]">
        <p className="text-[14px] font-regular text-black text-opacity-60">
          Shop.co © 2000-2023, All Rights Reserved
        </p>
        <div className="flex flex-wrap gap-[10px] lg:gap-[12px] items-center justify-center">
          <img src={visa} alt="visa" loading="lazy" />
          <img src={masterCard} alt="mastercard" loading="lazy" />
          <img src={applePay} alt="apple pay" loading="lazy" />
          <img src={payPal} alt="paypal" loading="lazy" />
          <img src={googlePay} alt="google pay" loading="lazy" />
        </div>
      </div>
    </div>
  );
}

export default Footer;
