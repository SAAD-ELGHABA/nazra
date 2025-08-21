import React, { useEffect, useState } from "react";

function ProductPreview({ product, selectedColor }) {
  const [selectedImage, setSelectedImage] = useState("");
  useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setSelectedImage(
        selectedColor ? selectedColor?.images[0] : product.colors[0].images[0]
      );
    }
  }, [product, selectedColor]);
  const [loadedImages, setLoadedImages] = useState({});

  const handleImageLoad = (image) => {
    setLoadedImages((prev) => ({ ...prev, [image]: true }));
  };

  return (
    <div className="p-2 md:p-4 w-full">
      <div className="flex flex-col-reverse md:flex-row gap-4 items-start justify-center w-full">
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-w-full md:max-h-[80vh] custom-scrollbar w-full md:w-24 lg:w-38">
          {product ? (
            selectedColor?.images?.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded"
              >
                {!loadedImages[image] && (
                  <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>
                )}
                <img
                src={image}
                alt={product?.name}
                loading="eager"
                className={`w-full h-full object-cover rounded border-2 cursor-pointer
                ${selectedImage === image ? "border-black" : "border-transparent"}
                hover:border-black
                ${loadedImages[image] ? "block" : "hidden"}`}
                onClick={() => setSelectedImage(image)}
                onLoad={() => handleImageLoad(image)}
                />

              </div>
            ))
          ) : (
            <p>Loading product images...</p>
          )}
        </div>

        <div className="w-full max-w-full relative ">
          {!loadedImages[selectedImage] && (
            <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-200 animate-pulse rounded"></div>
          )}
          <img
            src={selectedImage}
            alt="main-img"
            loading="eager"
            className={`w-full max-w-full rounded h-64 sm:h-80 md:h-96 lg:h-[500px]  object-cover ${
              loadedImages[selectedImage] ? "block" : "hidden"
            }`}
            onLoad={() => handleImageLoad(selectedImage)}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductPreview;
