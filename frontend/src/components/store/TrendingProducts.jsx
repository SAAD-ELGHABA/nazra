import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
// import "./TrendingProducts.css"; // 👈 import custom CSS

function TrendingProducts({ products }) {
  const { t } = useTranslation();

  return (
    <div className="my-8 w-full overflow-hidden">
      <h4 className="underline text-xl mb-4">
        {t("store.trendingProducts")}
      </h4>

      <div className="slider-wrapper relative w-full">
        <div className="slider-track">
          {[...products, ...products].map((product, idx) => (
            <Link
              key={idx}
              to={`/product/${product?.slug}`}
              className="slider-item"
            >
              <div className="shadow-xl rounded-lg overflow-hidden hover:shadow-lg transition relative">
                <img
                  src={product?.colors[0]?.images[0]}
                  alt={product?.name}
                  className="h-40 w-full object-cover"
                />
                <div className="p-2 absolute top-2 right-2">
                  <span className="bg-black text-white py-1 px-2 rounded-xl text-[10px] shadow-xl">
                    Trend
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* left gradient */}
        <div className="fade-left"></div>
        {/* right gradient */}
        <div className="fade-right"></div>
      </div>
    </div>
  );
}

export default TrendingProducts;
