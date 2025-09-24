import React, { useEffect } from "react";
import { getProductsShortCut } from "../../api/api";
import { Link } from "react-router-dom";
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
    <div className="my-10 w-[95%]">
      <div className="w-full text-center my-5">
        <h1 className="text-2xl font-bold">Our Latest Product</h1>
      </div>
      <div className="hidden md:flex flex-col">
        <div className="w-full min-h-[300px] md:h-[400px] overflow-x-auto md:overflow-x-visible hide-scrollbar">
          <div
            className="
        grid grid-flow-col md:grid-flow-row 
        auto-cols-[80%] sm:auto-cols-[50%] 
        md:grid-cols-3 
        gap-4 
        w-max md:w-[95%] mx-auto h-full
      "
          >
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product?.slug}`}
                className="md:h-full  flex-shrink-0"
              >
                <div className="relative md:w-full md:h-full">
                  <img
                    src={
                      product?.colors[0]?.images[0]?.url ||
                      "/fall-back-sunglasses-image.webp"
                    }
                    alt={product.name}
                    className="w-full md:h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                  />

                  <div className="absolute inset-0 md:opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between items-center">
                    <h2 className="bg-black bg-opacity-50 text-white w-full text-center py-2 text-sm md:text-lg">
                      {product.name.length > 40
                        ? product.name.slice(0, 40) + "..."
                        : product.name}
                    </h2>

                    <div className="flex flex-col gap-2 items-center mb-2">
                      <div className="flex gap-2 items-center">
                        <h5 className="text-xs md:text-sm font-light line-through">
                          {product?.sale_price -
                            product?.original_price +
                            product?.sale_price +
                            ".00"}
                        </h5>
                        <h2 className="font-semibold text-sm md:text-xl">
                          {product?.sale_price + ".00 MAD"}
                        </h2>
                      </div>

                      <ul className="flex gap-1 items-center justify-center">
                        {product?.colors?.map((clr, index) => (
                          <li key={index}>
                            <div
                              className="h-5 w-5 rounded-full"
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
      <div>
        {/* phone device */}
      </div>
      <div className="w-full flex justify-center my-5">
        <button>
          <Link
            to="/products"
            className="w-full h-full bg-gray-200 flex items-center justify-center text-center px-3"
          >
            <span className="font-semibold">View All Products</span>
          </Link>
        </button>
      </div>
    </div>
  );
}

export default ProductsShortCut;
