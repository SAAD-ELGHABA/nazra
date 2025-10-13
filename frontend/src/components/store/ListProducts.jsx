import React, { useState } from "react";
import { Heart, LayoutGrid, LayoutList, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFavorites } from "../../context/FavoritesContext";
import { useCard } from "../../context/CardContext";
import { toast } from "sonner";
import ProductComponent from "./ProductComponent";

function ListProducts({ products }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [gridType,setGridType] = useState("block-grid")

  const productsPerPage = gridType == "block-grid" ? 12 :8;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  const { t } = useTranslation();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { addToCard } = useCard();

  const AddItemToCard = (product) => {
    const choosedItem = { ...product, colors: [product.colors[0]], quantiy: 1 };
    addToCard(choosedItem);
    toast.success(t("cart.addItem"));
  };
  return (
    <div className="w-[90%] mx-auto my-8 ">
      <div className="flex items-center justify-between">
      <h4 className="text-lg font-semibold mb-6 ">
        {t("store.allProducts")}
      </h4>
      <div className="flex items-center justify-center gap-2">
        <button className={`p-2 rounded  cursor-pointer ${
          gridType == "block-grid" ? "bg-black text-white":"hover:bg-gray-300"
        }`}
          onClick={()=>setGridType("block-grid")}
        >
          <LayoutGrid />
        </button>
        <button
        className={`p-2 rounded  cursor-pointer ${
          gridType == "list-grid" ? "bg-black text-white":"hover:bg-gray-300"
        }`}
        onClick={()=>setGridType("list-grid")}
        >
          <LayoutList />
        </button>
      </div>
      </div>

      <div className={`grid  gap-2 ${
        gridType == "block-grid" ? "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4":"grid-cols-1 md:grid-cols-2"
      }`}>
        {currentProducts.map((product) => {
          const inFavorites = isFavorite(product._id);

          return (
            <ProductComponent
              product={product}
              inFavorites={inFavorites}
              removeFavorite={removeFavorite}
              addFavorite={addFavorite}
              AddItemToCard={AddItemToCard}
              gridType={gridType}
            />
          );
        })}
      </div>

      <div className="flex justify-center mt-8 gap-3 flex-wrap">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`px-4 py-2 rounded-md border font-medium transition-colors ${
              currentPage === number
                ? "bg-black text-white"
                : "bg-white text-black border-gray-300 hover:bg-gray-200"
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
