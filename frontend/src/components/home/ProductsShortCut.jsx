import React, { useEffect } from "react";
import { getProductsShortCut } from "../../api/api";
import { Link } from "react-router-dom";

/**
 * Price display.
 *
 * This component previously synthesised the "was" price as
 * `2 x sale_price - original_price`, which invented a reference price that had
 * never been charged (and rendered the literal string "NaN.00" when
 * original_price was missing). These helpers mirror the guarded pattern used by
 * StoreProductCard and productUtils: a struck-through price is shown only when
 * a real, higher reference price exists.
 */
const toPrice = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const salePrice = (product) => toPrice(product?.sale_price) ?? 0;
const referencePrice = (product) => toPrice(product?.compareAtPrice) ?? toPrice(product?.original_price);
const hasDiscount = (product) => {
  const reference = referencePrice(product);
  return reference !== null && reference > salePrice(product);
};
const formatAmount = (value) => Number(value || 0).toFixed(2);

function ProductsShortCut() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [products, setProducts] = React.useState([]);
  const getProductsShortCutPromise = async () => {
    setIsLoading(true);
    try {
      const response = await getProductsShortCut();
      setProducts(response?.data?.products || []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getProductsShortCutPromise();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[300px] md:h-[400px]">
        <div className="flex  md:flex-row gap-2 md:gap-6 w-[95%] mx-auto my-5 h-full">
          <div className="md:w-1/3 w-1/2  bg-gray-300 animate-pulse h-full"></div>
          <div className="md:w-1/3 w-1/2  bg-gray-300 animate-pulse h-full"></div>
          <div className="md:w-1/3 w-1/2  bg-gray-300 animate-pulse h-full"></div>
          <div className="md:w-1/3 w-full hidden md:flex bg-gray-300 animate-pulse h-full"></div>
        </div>
      </div>
    );
  }
  return products.length === 0 ? (
    <div className="w-full h-[300px] md:h-[400px]">
      <p className="text-center my-10">No products found</p>
    </div>
  ) : (
    <div className="my-10 w-[95%] bg-gray-100">
      <div className="text-start my-5 w-[95%] mx-auto">
        <h1 className="text-2xl font-bold">Our Latest Product</h1>
      </div>
      <div className="hidden md:flex flex-col">
        <div className="w-full min-h-[300px] md:h-[400px] overflow-x-auto md:overflow-x-visible hide-scrollbar">
          <div
            className="
        grid grid-flow-col md:grid-flow-row 
         
        md:grid-cols-4 
        gap-4 
        w-max md:w-[95%] mx-auto h-full
      "
          >
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product?.slug}`}
                className="md:h-full  flex-shrink-0 border border-gray-300 rounded"
              >
                <div className="relative md:w-full md:h-full overflow-hidden">
                  <img
                    src={
                      product?.colors[0]?.images[0]?.url ||
                      "/fall-back-sunglasses-image.webp"
                    }
                    alt={product.name}
                    className="w-full md:h-full scale-120 object-cover transition-opacity duration-300 group-hover:opacity-0 group-hover:scale-150"
                  />

                  <div className="absolute inset-0 md:opacity-50 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between items-center">
                    
                    <div className="flex gap-2 text-xs mt-2">
                      <span className="bg-gray-400 px-1.5 py-1 text-white border rounded border-gray-300">
                        {product?.category}
                      </span>
                      <span className="bg-black text-white border border-gray-300 px-1.5 py-1 rounded ">
                        {
                          product?.type
                        }
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 items-center mb-2">
                    <h2 className="bg-opacity-50 text-black w-full text-center py-2 text-sm md:text-sm">
                      {product.name.length > 30
                        ? product.name.slice(0,30) + "..."
                        : product.name}
                    </h2>
                      <div className="flex gap-2 items-center">
                        {hasDiscount(product) && (
                          <h5 className="text-xs md:text-sm font-light line-through text-red-500">
                            {formatAmount(referencePrice(product))}
                          </h5>
                        )}
                        <h2 className="font-semibold text-sm md:text-xl">
                          {formatAmount(salePrice(product))} MAD
                        </h2>
                      </div>

                      <ul className="flex gap-1 items-center justify-center">
                        {product?.colors?.map((clr, index) => (
                          <li key={index}>
                            <div
                              className="h-5 w-5 rounded-full border border-gray-300"
                              style={{ backgroundColor: clr?.value }}
                            ></div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* phone device */}
      <div className="flex md:hidden overflow-x-auto hide-scrollbar gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product?.slug}`}
            className="flex-shrink-0 w-[90vw] h-[300px] rounded border border-gray-300" 
          >
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={
                  product?.colors[0]?.images[0]?.url ||
                  "/fall-back-sunglasses-image.webp"
                }
                alt={product.name}
                className="w-full h-full scale-120 object-cover transition-opacity duration-300 group-hover:opacity-0 rounded-lg"
              />

                  <div className="absolute inset-0 md:opacity-50 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between items-center">
                    
                    <div className="flex gap-2 text-xs mt-2">
                      <span className="bg-gray-400 px-1.5 py-1 text-white border rounded border-gray-300">
                        {product?.category}
                      </span>
                      <span className="bg-black text-white border border-gray-300 px-1.5 py-1 rounded ">
                        {
                          product?.type
                        }
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 items-center mb-2">
                    <h2 className="bg-opacity-50 text-black w-full text-center py-2 text-sm md:text-sm">
                      {product.name.length > 30
                        ? product.name.slice(0,30) + "..."
                        : product.name}
                    </h2>
                      <div className="flex gap-2 items-center">
                        {hasDiscount(product) && (
                          <h5 className="text-xs md:text-sm font-light line-through text-red-500">
                            {formatAmount(referencePrice(product))}
                          </h5>
                        )}
                        <h2 className="font-semibold text-sm md:text-xl">
                          {formatAmount(salePrice(product))} MAD
                        </h2>
                      </div>

                      <ul className="flex gap-1 items-center justify-center">
                        {product?.colors?.map((clr, index) => (
                          <li key={index}>
                            <div
                              className="h-5 w-5 rounded-full border border-gray-300"
                              style={{ backgroundColor: clr?.value }}
                            ></div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="w-full flex justify-center my-5">
       
          <Link
            to="/store/products"
            className=" bg-transparent border border-black py-1 hover:bg-black hover:text-white transition-colors duration-300 ease-in-out flex items-center justify-center text-center px-3"
          >
            View All Products
          </Link>
        
      </div>
    </div>
  );
}

export default ProductsShortCut;
