import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";

function ProductComponent({
  product,
  inFavorites,
  removeFavorite,
  addFavorite,
  AddItemToCard,
  gridType="block-grid"
}) {
  const { t } = useTranslation();
  if(gridType == "block-grid"){
    return (
      <div className="relative group bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-500 ease-out hover:z-40">
        <Link
          key={product.id}
          to={`/product/${product?.slug}`}
          className="block duration-300"
        >
          <div className="relative w-full h-65 overflow-hidden rounded-t-xl">
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={
                  product?.colors[0]?.images[0]?.url ||
                  "/fall-back-sunglasses-image.webp"
                }
                alt={product.name}
                className="w-full h-full object-cover scale-150 transition-all duration-300 ease-out group-hover:scale-110"
              />
              {product?.colors[0]?.images[1] && (
                <img
                  src={
                    product?.colors[0]?.images[1]?.url ||
                    "/fall-back-sunglasses-image.webp"
                  }
                  alt={product.name}
                  className="absolute top-0 left-0 w-full h-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-160"
                />
              )}
            </div>
          </div>
  
          <div className="px-3 flex-col flex gap-2 w-full items-center pb-16 relative z-20 bg-white transition-all duration-500 group-hover:pb-4">
            <div className="flex items-center justify-center w-full gap-2 transform transition-transform duration-300">
              <div className="flex gap-2 items-center">
                <span className="text-black px-3 py-1 text-xl rounded-lg font-black backdrop-blur-sm">
                  MAD {product.sale_price + ".00"}
                </span>
                <span className="line-through text-red-500">
                  {(
                    product?.sale_price -
                    product?.original_price +
                    product?.sale_price
                  )?.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-center items-center w-full transform transition-transform duration-300">
              <h5 className="text-sm font-semibold text-center text-gray-900">
                {product?.name?.length >= 30
                  ? product?.name?.substring(0, 30) + ".."
                  : product?.name}
              </h5>
            </div>
          </div>
        </Link>
  
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-3 px-3 rounded-b-xl md:transform md:translate-y-full md:group-hover:translate-y-0 md:transition-all duration-500 ease-out">
          <div className="flex gap-2 items-center justify-center">
            <button
              className={`p-3 rounded-full transition-all duration-300 ease-out hover:bg-gray-100`}
              onClick={(e) => {
                e.preventDefault();
                inFavorites ? removeFavorite(product._id) : addFavorite(product);
              }}
            >
              <Heart
                size={22}
                className={`transition-transform duration-300 ${
                  inFavorites
                    ? "fill-red-500 text-red-500"
                    : "text-black"
                }`}
              />
            </button>
  
            <button
              className="py-3 flex-1 max-w-[200px] text-sm font-medium bg-black/95 backdrop-blur-sm text-white 
              hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-300 ease-out flex items-center gap-2 justify-center rounded-lg "
              onClick={(e) => {
                e.preventDefault();
                AddItemToCard(product);
              }}
            >
              <span className="transition-all duration-300">
                {t("cart.addToBag")}
              </span>
              <ShoppingCart className="h-5 w-5 transition-transform duration-300" />
            </button>
          </div>
        </div>
  
        <div className="absolute inset-0 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 group-hover:shadow-2xl transition-all duration-500 pointer-events-none -z-10" />
      </div>
    );

  }else{
    return (
    <div >
        <Link
          key={product.id}
          to={`/product/${product?.slug}`}
          className=" duration-300 flex items-center justify-center bg-white hover:shadow"
        >
          <div className="relative w-1/3 md:w-2/5 h-50 md:h-65 overflow-hidden rounded-t-xl">
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={
                  product?.colors[0]?.images[0]?.url ||
                  "/fall-back-sunglasses-image.webp"
                }
                alt={product.name}
                className="w-full h-full object-cover scale-110 md:scale-150 transition-all duration-300 ease-out group-hover:scale-110"
              />
              {product?.colors[0]?.images[1] && (
                <img
                  src={
                    product?.colors[0]?.images[1]?.url ||
                    "/fall-back-sunglasses-image.webp"
                  }
                  alt={product.name}
                  className="absolute top-0 left-0 w-full h-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-160"
                />
              )}
            </div>
          </div>
  
          <div className="px-3 flex-col flex gap-2 w-2/3 md:w-3/5 items-center py-2 relative z-20 bg-white transition-all duration-500 group-hover:pb-4">
            <div className="flex items-start text-start justify-center w-full gap-2 transform transition-transform duration-300 ">
              <div className="flex gap-2 items-center justify-start text-start  w-full">
                <span className="text-black px-3 py-1 text-sm md:text-xl rounded-lg font-black backdrop-blur-sm">
                  MAD {product.sale_price + ".00"}
                </span>
                <span className="line-through text-red-500">
                  {(
                    product?.sale_price -
                    product?.original_price +
                    product?.sale_price
                  )?.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-center items-center w-full transform transition-transform duration-300">
              <h5 className="md:text-sm text-xs font-semibold text-start text-gray-900">
                {product?.name}
              </h5>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 w-full">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  title={`${color?.name}-color`}
                  className={`relative h-10 md:h-14 w-16 md:w-20 rounded-lg overflow-hidden border-2 transition ${
                    color.name === product?.colors[0]?.images?.name
                      ? "border-black"
                      : "border-gray-300 hover:border-black"
                  }`}
                  style={{ backgroundColor: color?.value , borderColor:color?.value}}
                >
                  <img
                    src={color?.images[0]?.url}
                    alt={color?.name}
                    className="w-full h-full object-cover scale-130"
                  />
                </button>
              ))}
            </div>
          <div className="flex gap-2 w-full items-center justify-start">
            <button
              className={`p-3 rounded-full transition-all duration-300 ease-out hover:bg-gray-100`}
              onClick={(e) => {
                e.preventDefault();
                inFavorites ? removeFavorite(product._id) : addFavorite(product);
              }}
            >
              <Heart
                size={22}
                className={`transition-transform duration-300 ${
                  inFavorites
                    ? "fill-red-500 text-red-500"
                    : "text-black"
                }`}
              />
            </button>
  
            <button
              className="py-3 flex-1 max-w-[200px] text-sm font-medium bg-black/95 backdrop-blur-sm text-white 
              hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-300 ease-out flex items-center gap-2 justify-center rounded-lg "
              onClick={(e) => {
                e.preventDefault();
                AddItemToCard(product);
              }}
            >
              <span className="transition-all duration-300">
                {t("cart.addToBag")}
              </span>
              <ShoppingCart className="h-5 w-5 transition-transform duration-300" />
            </button>
          </div>
          </div>
        </Link>
    </div>

    )
  }
}

export default ProductComponent;
