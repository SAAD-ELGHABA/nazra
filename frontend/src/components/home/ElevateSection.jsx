import React from "react";
import { Link } from "react-router-dom";

function ElevateSection() {
  return (
    <div className="w-full h-[60vh] md:h-[80vh] relative">
      <img
        src="/elevate-section-img.png"
        alt="Elevate Section"
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center px-6 text-white">
        <h3
          className="font-bold text-[24px] md:text-[40px] max-w-3xl mb-4"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          Elevate Your Style Today
        </h3>
        <p className="text-sm md:text-base max-w-2xl mb-6">
          Discover our exclusive collection of luxurious sunglasses designed
          for the fashion-forward individual.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/shop"
            className="px-6 py-3 border border-white rounded transition-colors duration-300 hover:bg-black hover:text-white bg-white text-black "
          >
            Shop
          </Link>
          <Link
            to="/join"
            className="px-6 py-3 border rounded transition-colors duration-300 hover:bg-black hover:text-white"
          >
            Join
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ElevateSection;
