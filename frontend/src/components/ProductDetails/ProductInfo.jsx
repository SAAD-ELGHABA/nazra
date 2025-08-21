import { Glasses, Heart, Star } from "lucide-react";
import React, { useState } from "react";
import { useFavorites } from "../../context/FavoritesContext";

function ProductInfo({ product, selectedColor, setSelectedColor }) {
  const [quantity, setQuantity] = useState(1);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const toggleFavorite = (e) => {
    e.preventDefault();
    if (isFavorite(product?.id)) {
      removeFavorite(product?.id);
    } else {
      addFavorite(product);
    }
  };
  return (
    <div className="md:h-[80vh] flex flex-col justify-between relative p-2 md:p-4">
      <div className="w-full max-w-2xl mx-auto flex-1">
        <div className="flex items-center justify-between mb-4">
          <h1
            className="font-bold text-[22px] w-1/2 text-center md:text-left md:text-[36px]"
            style={{ lineHeight: "1.2" }}
          >
            {product?.name}
          </h1>
          <button onClick={toggleFavorite} className="p-1 rounded-full">
            <Heart
              size={26}
              className={`
          cursor-pointer 
          transition-colors duration-300
          ${
            isFavorite(product?.id)
              ? "fill-black"
              : "fill-transparent hover:fill-black"
          }
        `}
            />
          </button>
        </div>

        <div className="flex justify-between items-center gap-2 mb-4">
          {product?.colors && product?.colors.length > 0 && (
            <div>
              <div className="mb-4">
                <h1
                  className="font-bold text-[12px] text-start md:text-left md:text-[20px]"
                  style={{ lineHeight: "1.2", letterSpacing: "2px" }}
                >
                  Colors
                </h1>
              </div>
              <div className="flex items-center gap-2 mb-4">
                {product.colors.map((color) => (
                  <div
                    key={color.name}
                    style={{ backgroundColor: color.hex }}
                    className={`
                  w-10 h-10 rounded-full cursor-pointer
                  ${
                    color.name === selectedColor?.name
                      ? "border-2 border-black"
                      : ""
                  }
                  hover:border-black transition-colors duration-300
                `}
                    onClick={() => setSelectedColor(color)}
                  ></div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-black">
            <h1
              className="font-bold text-[26px] text-center md:text-left md:text-[36px]"
              style={{ lineHeight: "1.2", letterSpacing: "4px" }}
            >
              {product?.rating}
            </h1>
            <Star size={26} />
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 ">
            <span>{product?.type}</span>
            <Glasses />
          </div>
          <div className="flex items-center gap-2 border border-gray-300 rounded">
            <button
              onClick={decrement}
              className="px-4 py-1 text-lg font-bold hover:bg-gray-200 rounded"
            >
              -
            </button>
            <span className="w-6 text-center">{quantity}</span>
            <button
              onClick={increment}
              className="px-4 py-1 text-lg font-bold hover:bg-gray-200 rounded"
            >
              +
            </button>
          </div>
        </div>

        <p className="text-gray-700 mb-6 md:mb-0">
          {product?.description ||
            `    Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam officia iste dicta eligendi nulla voluptates consequatur atque, eius eveniet tempora perspiciatis eos, provident, dolorum impedit labore molestiae quia soluta! Quod nisi totam delectus voluptatum reiciendis a obcaecati quidem doloremque reprehenderit fuga sunt repellat laborum tempore quas, quaerat molestias, aperiam itaque quasi.
`}
        </p>

        <div className="md:absolute sticky bottom-0 bg-white p-4 border-t flex items-center justify-between w-full">
          <p
            className="font-bold text-[18px] w-1/2 text-center md:text-left md:text-[22px]"
            style={{ lineHeight: "1.2" }}
          >
            MAD {product?.sale_price}
          </p>
          <button className="py-2 text-sm text-white bg-black rounded transition-colors duration-300 hover:bg-transparent border hover:text-black w-1/2">
            Add To Bag
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductInfo;
