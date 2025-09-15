import React, { useEffect, useState } from "react";
import TrendingProducts from "../components/store/TrendingProducts";
import ListProducts from "../components/store/ListProducts";
import { useTranslation } from "react-i18next";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getProducts } from "../api/api";
import { LoaderCircle } from "lucide-react";
function StorePage() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    document.title = "Store - Nazra";
    window.scrollTo({ top: 0, behavior: "smooth" });
    const getProductsPromise = async () => {
      const res = await getProducts();
      setProducts(res?.data?.products);
    };
    getProductsPromise();
  }, []);
  const { t } = useTranslation();
  if (products?.length <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col py-10 md:px-4">
      <div className="w-full flex flex-col items-center justify-center gap-5">
        <h1
          className="font-bold text-[16px] text-center md:text-left md:text-[36px]"
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
