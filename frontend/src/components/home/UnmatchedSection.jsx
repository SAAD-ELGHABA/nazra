import React from "react";
import { DraftingCompass, Glasses, Kanban } from "lucide-react";
import { Link } from "react-router-dom";

function UnmatchedSection() {
  return (
    <div className="md:p-10 p-4  w-full min-h-screen overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-6 text-center md:text-left">
        <h5>Elevate</h5>
        <h1
          className="font-bold text-[32px] md:text-[56px] w-full max-w-3xl"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          Unmatched Style Awaits
        </h1>
        <h5>Experience the perfect blend of fashion and function.</h5>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4 w-full mt-6">
        <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 border p-6 flex flex-col justify-between w-full">
          <div className="flex flex-col gap-4">
            <DraftingCompass className="h-10 w-10" />
            <h2
              className="font-bold text-[25px] md:text-[36px] lg:text-[46px]"
              style={{ lineHeight: "1.2", letterSpacing: "4px" }}
            >
              Crafted for You
            </h2>
            <p className="text-sm md:text-base lg:text-lg">
              Our sunglasses are designed with precision and elegance for the
              discerning fashion lover.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Link
              to="/shop"
              className="px-6 py-3 border rounded transition-colors duration-300 hover:bg-black hover:text-white"
            >
              Shop
            </Link>
            <Link
              to="/learn"
              className="px-6 py-3 rounded transition-all duration-300 transform  hover:bg-black/10 "
            >
              Learn &gt;
            </Link>
          </div>
        </div>

        <div className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2 border p-6 flex flex-col justify-between w-full">
          <div className="flex flex-col gap-4">
            <Glasses className="h-10 w-10" />
            <h2
              className="font-bold text-[20px] md:text-[24px] lg:text-[26px]"
              style={{ lineHeight: "1.2", letterSpacing: "4px" }}
            >
              Why Choose Our Sunglasses?
            </h2>
            <p className="text-sm md:text-base">
              Stylish, durable, and protective eyewear for every occasion.
            </p>
          </div>
          <Link
            to="/discover"
            className="px-6 py-3 border rounded transition-colors duration-300 hover:bg-black hover:text-white text-center mt-4"
          >
            Discover
          </Link>
        </div>

        <div className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2 border p-6 flex flex-col justify-between w-full">
          <div className="flex flex-col gap-4">
            <Kanban className="h-10 w-10" />
            <h2
              className="font-bold text-[20px] md:text-[24px] lg:text-[26px]"
              style={{ lineHeight: "1.2", letterSpacing: "4px" }}
            >
              Protect Your Eyes in Style
            </h2>
            <p className="text-sm md:text-base">
              Enjoy 100% UV protection without compromising on style.
            </p>
          </div>
          <Link
            to="/explore"
            className="px-6 py-3 border rounded transition-colors duration-300 hover:bg-black hover:text-white text-center mt-4"
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UnmatchedSection;
