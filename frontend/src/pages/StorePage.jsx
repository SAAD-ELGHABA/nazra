import React, { useEffect } from "react";
import TrendingProducts from "../components/store/TrendingProducts";
import products from "../assets/products.json";
import ListProducts from "../components/store/ListProducts";
import { useTranslation } from "react-i18next";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
function StorePage() {
  useEffect(() => {
    document.title = "Store - Nazra";
    window.scrollTo({ top: 0, behavior: "smooth" });
    // here the promise ...
  }, []);
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col py-10 px-4">
      <div className="w-full flex flex-col items-center justify-center gap-5">
        <h1
          className="font-bold text-[32px] text-center md:text-left md:text-[56px]"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          {t("store.title")}
        </h1>
        <p>{t("store.description")}</p>
      </div>
      <div>
        <TrendingProducts
          products={products?.slice(
            products?.length - 10,
            products?.length - 1
          )}
        />
      </div>
      <ListProducts products={products} />
    </div>
  );
}

export default StorePage;
