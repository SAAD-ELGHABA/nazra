import React from "react";
import { useFavorites } from "../context/FavoritesContext";
import { CircleMinus, HeartOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";

function Favorites() {
  const { favorites, removeFavorite } = useFavorites();
  const { addFavorite, isFavorite } = useFavorites();
  if (favorites.length === 0) {
    return (
      <div className="min-h-screen flex gap-4 flex-col items-center justify-center  text-lg">
        <HeartOff className="h-20 w-20" />
        <h1
          className="font-bold text-[16px] text-center md:text-left md:text-[20px]"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          You have no favorite items yet.
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Your Favorites</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {favorites.map((product) => (
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

              <div
                className="absolute top-0 right-0 flex gap-2 w-full h-full p-3 items-start justify-end 
                              lg:bg-black/50 lg:p-0 lg:items-center lg:justify-center 
                              opacity-100 lg:opacity-0 lg:group-hover:opacity-100 
                              transition-all duration-300"
              >
                <button
                  className={`p-1 ${
                    isFavorite(product.id) ? "bg-black/50" : "bg-transparent"
                  } text-white rounded-full shadow hover:bg-black/70`}
                >
                  <Heart
                    size={26}
                    onClick={(e) => {
                      e.preventDefault();
                      if (isFavorite(product.id)) {
                        removeFavorite(product.id);
                      } else {
                        addFavorite(product);
                      }
                    }}
                    className={`${
                      isFavorite(product.id) ? "fill-black" : "fill-transparent"
                    } hover:fill-black transition-colors duration-300 text-white`}
                  />
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
    </div>
  );
}

export default Favorites;
