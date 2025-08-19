import React from "react";
import { Link } from "react-router-dom";

function LuxurySection() {
  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 gap-6 items-center justify-center">
      <div className="flex flex-col gap-6">
        <h1
          className="font-bold text-[28px] md:text-left md:text-[46px]"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          Luxury Redefined in Every Frame
        </h1>
        <p>
          Crafting timeless eyewear with unmatched quality and UV protection
        </p>
        <div>
          <Link
            to="/shop"
            className="px-6 py-3 border rounded transition-colors duration-300 hover:bg-black hover:text-white"
          >
            EXPLORE OUR COLLECTION
          </Link>
        </div>
      </div>
      <div>
        <img src="/About/luxury-img.png" alt="luxury-img" />
      </div>
    </div>
  );
}

export default LuxurySection;
