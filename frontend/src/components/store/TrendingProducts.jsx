import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
function TrendingProducts({ products }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    arrows: true,
    nextArrow: <div className="slick-next">Next</div>,
    prevArrow: <div className="slick-prev">Prev</div>,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 5 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 },
      },
    ],
  };
  const { t } = useTranslation();
  return (
    <div className="my-8 w-[90%] mx-auto">
      <div>
        <h4 className="underline text-xl mb-4">
            {t("store.trendingProducts")}
        </h4>
      </div>
      <Slider {...settings}>
        {products?.map((product) => (
          <Link key={product.id} className="px-2">
            <div className="shadow-xl rounded-lg overflow-hidden hover:shadow-lg transition relative">
              <img
                src={product?.image}
                alt={product?.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-2 absolute top-2 right-2">
                <span className="bg-black text-white py-1 px-3 rounded-xl text-sm shadow-xl">
                  Trend
                </span>
              </div>
            </div>
          </Link>
        ))}
      </Slider>
    </div>
  );
}

export default TrendingProducts;
