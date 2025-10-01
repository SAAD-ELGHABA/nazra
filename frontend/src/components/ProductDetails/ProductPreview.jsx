import React, { useEffect, useState } from "react";
import { Expand } from "lucide-react";
import ProductPreviewExpanded from "./ProductPreviewExpanded";
import DeepARTryOn from "../VirtualTryOn";
import VirtualTryOn from "../VirtualTryOn";

export default function ProductPreview({ product, selectedColor }) {
  const [selectedImage, setSelectedImage] = useState("");
  const [loadedImages, setLoadedImages] = useState({});

  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [isExpandModeOpen, setIsExpandModeOpen] = useState(false);

  const activeColor =
    selectedColor ||
    (product && product.colors && product.colors.length > 0
      ? product.colors[0]
      : null);

  const deepAREffectPath = activeColor?.test;

  useEffect(() => {
    if (activeColor) {
      setSelectedImage(activeColor.images[0]?.url || "");
    }
  }, [activeColor]);

  const handleImageLoad = (image) => {
    setLoadedImages((prev) => ({ ...prev, [image]: true }));
  };

  return (
    <div className="p-2 md:p-4 w-full">
      <div className="flex flex-col-reverse md:flex-row gap-4 items-start justify-center w-full ">
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-w-full custom-scrollbar w-full md:w-24 lg:w-38 md:max-h-[78vh]">
          {activeColor?.images?.map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded "
            >
              {!loadedImages[image.url] && (
                <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>
              )}
              <img
                src={image.url}
                alt={product.name}
                loading="eager"
                className={`w-full h-full object-cover rounded cursor-pointer 
                  ${
                    selectedImage === image.url
                      ? "border-black border-2"
                      : "border border-gray-300 rounded"
                  }
                  hover:border-black transition-all
                  ${loadedImages[image.url] ? "block" : "hidden"}
                `}
                onClick={() => setSelectedImage(image.url)}
                onLoad={() => handleImageLoad(image.url)}
              />
            </div>
          ))}
          {!product && <p>Loading product images...</p>}
        </div>

        <div className="w-full max-w-full relative overflow-hidden border border-gray-300 rounded shadow-lg">
          <div className="w-full aspect-[4/3] md:aspect-[5/4] lg:h-[500px] overflow-hidden">
            {!loadedImages[selectedImage] && (
              <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>
            )}
            <img
              src={selectedImage}
              alt={`Main view of ${product?.name}`}
              loading="eager"
              className={`w-full h-full rounded object-cover scale-200 transition-opacity duration-500 
                 ${loadedImages[selectedImage] ? "opacity-100" : "opacity-0"}
               `}
              onLoad={() => handleImageLoad(selectedImage)}
            />
          </div>

          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 gap-3 flex items-center justify-center px-2 py-0.5 font-semibold text-xs">
            <button
              className="bg-black/60 text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 hover:bg-black/80 transition duration-200"
              onClick={() => setIsExpandModeOpen(true)}
              aria-label="Expand Images"
            >
              <Expand className="h-4 w-4" />
              <span>Expand</span>
            </button>

            {deepAREffectPath && (
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition duration-200"
                onClick={() => setIsTryOnOpen(true)}
                aria-label="Try on sunglasses in augmented reality"
              >
                🤳 Try On
              </button>
            ) }
          </div>
        </div>
      </div>

      {isExpandModeOpen && (
        <ProductPreviewExpanded
          images={activeColor?.images}
          onclose={setIsExpandModeOpen}
        />
      )}

      {isTryOnOpen && deepAREffectPath && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 relative max-w-[800px] w-full">
            <button
              className="absolute top-0 right-0 m-4 text-3xl text-gray-800 bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-md hover:bg-gray-100 transition"
              onClick={() => setIsTryOnOpen(false)}
              aria-label="Close Virtual Try On"
            >
              &times;
            </button>

            <h3 className="text-center text-2xl font-bold text-gray-900 mb-4">
              Virtual Try-On
            </h3>
            <p className="text-center text-sm text-gray-500 mb-4">
              Requires camera access. Look directly into the camera for the best
              fit.
            </p>

            <VirtualTryOn 
            glassesImage={selectedColor?.images[3]?.url}
            // glassesImage={"/model3d/eyeglasses_3d_model.glb"}
             />
          </div>
        </div>
      )}
    </div>
  );
}
