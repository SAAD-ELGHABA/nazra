import React, { useEffect, useState } from "react";
import { CheckCircle, Clipboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProducts } from "../api/api";
import { getLocalizedText } from "../components/ProductDetails/productUtils";
import { formatPrice, getProductImages } from "../components/store/storeUtils";

const getProductKey = (product) => product?._id || product?.id || product?.slug;
const getProductPath = (product) => product?.slug ? `/product/${product.slug}` : "/store/products";
const getProductImage = (product) => getProductImages(product)[0] || product?.imageUrl || "/fall-back-sunglasses-image.webp";

function OrderConfirmationUpsell({ orderId }) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [products, setProducts] = useState([]);

  const COUPON_CODE = `NAZRA-${orderId || "THANKYOU"}-10`;
  const handleCopy = () => {
    navigator.clipboard.writeText(COUPON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  useEffect( () => {getRandomProducts()}, []);

  const getRandomProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(Array.isArray(response?.data?.products) ? response.data.products.slice(0, 4) : []);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mt-12 p-6 bg-white rounded-xl shadow-2xl border-t-4 border-black max-w-5xl mx-auto">
      {/* 1. Future Purchase Incentive (High Visibility) */}
      <div className="text-center mb-10 pb-6 border-b border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          {t("checkoutPage.upsellTitle")}
        </h2>
        <p className="text-indigo-600 text-xl font-semibold mb-6">
          {t("checkoutPage.upsellSubtitle")}
        </p>

        <div className="inline-flex items-center justify-center p-3 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg shadow-inner">
          <span className="text-2xl font-mono font-bold tracking-widest text-gray-800">
            {COUPON_CODE}
          </span>
          <button
            onClick={handleCopy}
            className={`ml-4 p-2 rounded-lg transition duration-200 
                    ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-200"
                    } 
                    flex items-center gap-1 shadow-md`}
            aria-label={copied ? "Copied!" : "Copy coupon code"}
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>{t("checkoutPage.couponCopied")}</span>
              </>
            ) : (
              <>
                <Clipboard className="h-4 w-4" />
                <span>{t("checkoutPage.couponCopy")}</span>
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-600 font-medium">
          {t("checkoutPage.couponDetails")}
        </p>
      </div>

      {/* 2. Immediate Cross-Sell (Complementary Accessories) */}
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {t("checkoutPage.recommendedTitle")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product, index) => {
          const description = getLocalizedText(product?.description, i18n.resolvedLanguage || i18n.language);
          const image = getProductImage(product);
          const price = Number(product?.sale_price ?? product?.price ?? 0);

          return (
            <div
              key={getProductKey(product) || index}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center shadow-md hover:shadow-lg transition duration-300"
            >
              <Link to={getProductPath(product)} className="flex-shrink-0">
                <img
                  src={image}
                  alt={product?.name || "NAZRA"}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/fall-back-sunglasses-image.webp";
                  }}
                  className="w-20 h-20 object-cover rounded-md mr-4 border border-gray-100"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-lg truncate">{product?.name}</h4>
                {description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {description}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-indigo-600">
                    {formatPrice(price, i18n.language)}
                  </span>
                  <Link
                    to={getProductPath(product)}
                    className="rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
                  >
                    {t("checkoutPage.viewProduct")}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// NOTE: Example for your OrderConfirmationPage to use this component
/*
function OrderConfirmationPage() {
    // Assume you fetch or receive the order details here
    const mockOrderId = "ABC-12345"; 
    
    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-5xl font-light text-center text-green-600 mb-4">
                Order Placed Successfully!
            </h1>
            <p className="text-center text-xl text-gray-700 mb-8">
                Your order #{mockOrderId} is confirmed and will ship soon.
            </p>

            <OrderConfirmationUpsell orderId={mockOrderId} />
        </div>
    );
}
*/

export default OrderConfirmationUpsell;
