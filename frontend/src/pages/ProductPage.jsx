import React, { useEffect, useState } from "react";
import ProductPreview from "../components/ProductDetails/ProductPreview";
import { useParams } from "react-router-dom";
import ProductInfo from "../components/ProductDetails/ProductInfo";
import { useTranslation } from "react-i18next";
import { BadgeCheck, LogIn } from "lucide-react";
import Suggestions from "../components/ProductDetails/Suggestions";
import {
  getProducts,
  getSingleProduct,
  trackVisitPerProduct,
} from "../api/api";
import ProductNotAvailable from "./ProductNotAvailable";
function ProductPage() {
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [products, setProducts] = useState([]);
  const [statusPromise, setStatusPromise] = useState(null);
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const visitPerProduct = async (idProduct) => trackVisitPerProduct(idProduct);
  useEffect(() => {
    document.title = "Product - Nazra";
    window.scrollTo({ top: 0, behavior: "smooth" });
    const getProductsPromise = async () => {
      const res = await getProducts();

      setProducts(res?.data?.products);
    };
    getProductsPromise();
    const getProduct = async () => {
      setIsLoading(true);
      try {
        const res = await getSingleProduct(slug);
        setProduct(res?.data?.product);
        setSelectedColor(res?.data?.product?.colors[0]);
        visitPerProduct(res?.data?.product?._id);
        setStatusPromise(res?.data?.success);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getProduct();
  }, [slug]);
  const { t } = useTranslation();

  if (statusPromise == false) {
    return <ProductNotAvailable />;
  }
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="flex flex-col md:flex-row gap-6 w-[90%] mx-auto my-5">
          <div className="md:w-2/3 w-full bg-gray-300 animate-pulse h-full"></div>
          <div className="md:w-2/3 w-full bg-gray-300 animate-pulse h-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-2 justify-center w-full py-2 bg-black">
        <BadgeCheck className="text-white h-4 w-4" />
        <h1 className="text-white text-xs md:text-sm text-center">
          {t("product.note")}
        </h1>
      </div>
      <div className="py-4 px-4 flex flex-col md:flex-row ">
        <div className="flex flex-col md:flex-row items-start justify-center  md:w-2/3 w-full">
          <ProductPreview product={product} selectedColor={selectedColor} />
        </div>
        <div className="w-full md:w-1/3">
          <ProductInfo
            product={product}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        </div>
      </div>
      <div>
        <Suggestions
          products={products
            ?.filter(
              (p) => p.type === product?.type && p.slug !== product?.slug
            )
            ?.slice(0, 4)}
        />
      </div>
    </div>
  );
}

export default ProductPage;
