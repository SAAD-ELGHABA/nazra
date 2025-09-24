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
    <div className=" my-10 w-[95%]">
      <div className="w-full overflow-x-auto h-[300px] md:h-[400px] hide-scrollbar">
        <div className="flex gap-4 w-max md:w-[95%] mx-auto my-5 h-full">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product?.slug}`}
              className="min-w-[150px] sm:min-w-[100px] md:min-w-0 h-full bg-red-500 flex-shrink-0"
            >
              <div className="relative w-full h-full">
                <img
                  src={
                    product?.colors[0]?.images[0]?.url ||
                    "/fall-back-sunglasses-image.webp"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductsShortCut;
