import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
function TrendingProducts({ products }) {
  const settings = {
    dots: false,
    infinite: true,
    speed: 5000,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    arrows: false,
    pauseOnHover: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 4 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const { t } = useTranslation();
  return (
    <div className="my-8  mx-auto">
      <div>
        <h4 className="underline text-xl mb-4">
          {t("store.trendingProducts")}
        </h4>
      </div>
      <div className="w-full">
        <Slider {...settings} className="px-2">
          {products?.map((product) => (
            <Link key={product.id} className="px-2 "
            to={`/product/${product?.slug}`}
            >
              <div className="shadow-xl rounded-lg overflow-hidden hover:shadow-lg transition relative">
                <img
                  src={product?.colors[0]?.images[0]}
                  alt={product?.name}
                  className="h-30 w-full md:h-48 object-cover"
                />
                <div className="p-2 absolute top-2 right-2">
                  <span className="bg-black text-white py-1 px-2 rounded-xl text-[10px] shadow-xl">
                    Trend
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default TrendingProducts;
