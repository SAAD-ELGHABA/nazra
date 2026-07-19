import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ListProducts from "../components/store/ListProducts";
import { useTranslation } from "react-i18next";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getProducts } from "../api/api";
import { LoaderCircle } from "lucide-react";
import Offer from "../components/store/Offer";
function StorePage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState(() => {
    if ([...searchParams.keys()].length > 0) return [];
    const stored = sessionStorage.getItem("products");
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = "Store - Nazra";
    window.scrollTo({ top: 0, behavior: "smooth" });
    const getProductsPromise = async () => {
      setLoading(true);
      setError(false);
      try {
        const params = Object.fromEntries(searchParams.entries());
        delete params.sort;
        const res = await getProducts(params);
        setProducts(res?.data?.products || []);
        if (Object.keys(params).length === 0) sessionStorage.setItem("products", JSON.stringify(res?.data?.products || []));
      } catch {
        setProducts([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    getProductsPromise();
  }, [searchParams]);
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin" />
      </div>
    );
  }
  if (error || products.length === 0) {
    return <div className="nazra-container flex min-h-[55vh] flex-col items-center justify-center text-center"><p className="text-sm text-stone-600">{t(error ? "home.bestSellers.error" : "home.bestSellers.empty")}</p><Link to="/store/products" className="nazra-button mt-5 bg-black text-white">{t("home.bestSellers.viewAll")}</Link></div>;
  }
  return (
    <div className="min-h-screen flex flex-col py-10 md:px-4 bg-gray-200">
      <Offer/>
      <div className="w-full flex flex-col items-center justify-start gap-5">
      </div>
      <ListProducts products={products} />

    </div>
  );
}

export default StorePage;
