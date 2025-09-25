import React, { useEffect, useState } from "react";
import GlassesTryOn from "../GlassesTryOn";

function ProductPreview({ product, selectedColor }) {
  const [selectedImage, setSelectedImage] = useState("");
  useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setSelectedImage(
        selectedColor
          ? selectedColor?.images[0]?.url
          : product.colors[0].images[0]?.url
      );
    }
  }, [product, selectedColor]);
  const [loadedImages, setLoadedImages] = useState({});

  const handleImageLoad = (image) => {
    setLoadedImages((prev) => ({ ...prev, [image]: true }));
  };
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);

  return (
    <div className="p-2 md:p-4 w-full">
      <div className="flex flex-col-reverse md:flex-row gap-4 items-start justify-center w-full">
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-w-full md:max-h-[80vh] custom-scrollbar w-full md:w-24 lg:w-38">
          {product && product.colors?.length > 0 ? (
            (selectedColor || product.colors[0]).images?.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded"
              >
                {!loadedImages[image.url] && (
                  <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>
                )}
                <img
                  src={image.url}
                  alt={product.name}
                  loading="eager"
                  className={`w-full h-full object-cover rounded border-2 cursor-pointer
            ${
              selectedImage === image.url
                ? "border-black"
                : "border-transparent"
            }
            hover:border-black
            ${loadedImages[image.url] ? "block" : "hidden"}
          `}
                  onClick={() => setSelectedImage(image.url)}
                  onLoad={() => handleImageLoad(image.url)}
                />
              </div>
            ))
          ) : (
            <p>Loading product images...</p>
          )}
        </div>

        <div className="w-full max-w-full relative overflow-hidden">
          {!loadedImages[selectedImage] && (
            <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-200 animate-pulse rounded"></div>
          )}
          <img
            src={selectedImage}
            alt="main-img"
            loading="eager"
            className={`w-full max-w-full rounded h-64 sm:h-80 md:h-96 lg:h-[500px]  object-cover scale-150 ${
              loadedImages[selectedImage] ? "block" : "hidden"
            }`}
            onLoad={() => handleImageLoad(selectedImage)}
          />
          {/* <div className="absolute top-3 w-full flex items-center justify-center  px-2 py-0.5  font-semibold text-xs">
            <button
              className="bg-black/70 text-white px-4 py-2 rounded-lg"
              onClick={() => setIsTryOnOpen(true)}
            >
              Try On
            </button>
          </div> */}
        </div>
      </div>
      {/* {isTryOnOpen && selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 relative max-w-[700px] w-full">
            <button
              className="absolute top-2 right-2 text-white bg-red-500 rounded-full px-3 py-1 font-bold"
              onClick={() => setIsTryOnOpen(false)}
            >
              X
            </button>
            <GlassesTryOn glassesSrc={selectedImage} />
          </div>
        </div>
      )} */}
    </div>
  );
}

export default ProductPreview;
