import { X } from "lucide-react";
import React, { useState } from "react";

function ProductPreviewExpanded({ images, onclose }) {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images?.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === images?.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={() => onclose(false)}>
          <X />
        </button>
      </div>
      <div className="relative w-full h-full overflow-hidden">
        {images?.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === current
                ? "translate-x-0"
                : index < current
                ? "-translate-x-full"
                : "translate-x-full"
            }`}
          >
            <img
              src={img?.url}
              alt={`slide-${index}`}
              className="w-full h-full object-contain scale-120 md:scale-200"
            />
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-5 top-1/2 -translate-y-1/2 text-white text-3xl bg-black/50 rounded-full p-2"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-5 top-1/2 -translate-y-1/2 text-white text-3xl bg-black/50 rounded-full p-2"
      >
        ❯
      </button>

      <div className="absolute bottom-5 w-full flex justify-center gap-2">
        {images?.map((_, idx) => (
          <span
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              idx === current ? "bg-black" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductPreviewExpanded;
