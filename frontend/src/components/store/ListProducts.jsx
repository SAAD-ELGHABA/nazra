import React, { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
function ListProducts({ products }) {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);
  const { t } = useTranslation();
  return (
    <div className="w-[90%] mx-auto my-8">
      <h4 className="underline text-xl mb-6">{t("store.allProducts")}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => (
          <Link
            key={product.id}
            className="relative rounded-lg  shadow hover:shadow-lg transition group"
            to={`/product/${product?.slug}`}
          >
            <div className="relative">
              <img
                src={product?.colors[0]?.images[0]}
                alt={product.name}
                className="w-full h-60 object-cover"
              />

              <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition w-full bg-black/50 h-full transation-all  items-center justify-center duration-300 ">
                <button className="p-1 bg-black/50 text-white rounded-full shadow hover:bg-black/70">
                  <Heart size={26} />
                </button>
                <button className="p-1 bg-black/50 text-white rounded-full shadow hover:bg-black/70">
                  <ShoppingCart size={26} />
                </button>
              </div>

              <p className="text-white font-bold absolute bottom-2 right-2">
                MAD {product.sale_price}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full mt-2">
              <div className="flex items-center justify-between">
                <h5 className="font-semibold">{product.name}</h5>
                <div className="flex items-center gap-1">
                  {product?.rating}
                  <Star size={12} className="fill-black" />
                </div>
              </div>
              <button className="w-full py-2 text-sm text-black rounded transition-colors duration-300 hover:bg-black border bg-white hover:text-white text-center cursor-pointer">
                Add To Bag
              </button>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`px-4 py-2 border rounded ${
              currentPage === number
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ListProducts;
