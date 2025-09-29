import React, { useEffect, useState } from "react";
import { Expand } from "lucide-react";
// import DeepARTryOn from "../DeepARTryOn";

// Assuming these components are in the same directory or available via standard imports


// NOTE: ProductPreviewExpanded component is assumed to be defined elsewhere.
// import ProductPreviewExpanded from "./ProductPreviewExpanded";

export default function ProductPreview({ product, selectedColor }) {
  const [selectedImage, setSelectedImage] = useState("");
  const [loadedImages, setLoadedImages] = useState({});
  
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [isExpandModeOpen, setIsExpandModeOpen] = useState(false);

  // --- Core Logic Refinement ---
  
  // Determine the currently active color object
  const activeColor = selectedColor || (product && product.colors && product.colors.length > 0 ? product.colors[0] : null);

  // Get the DeepAR path for the currently selected color
  // IMPORTANT: Ensure your product data includes this field!
  const deepAREffectPath = activeColor?.deepAREffectPath; 
  
  // Set initial main image based on the active color
  useEffect(() => {
    if (activeColor) {
      setSelectedImage(activeColor.images[0]?.url || "");
    }
  }, [activeColor]);

  const handleImageLoad = (image) => {
    setLoadedImages((prev) => ({ ...prev, [image]: true }));
  };
  
  // --- Rendering ---
  
  // Fallback for ProductPreviewExpanded if it wasn't provided
  const ProductPreviewExpanded = ({ images, onclose }) => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]">
        <h2 className="text-white text-xl">Image Expansion Modal Placeholder</h2>
        <button onClick={() => onclose(false)} className="absolute top-4 right-4 text-white text-3xl">&times;</button>
    </div>
  );


  return (
    <div className="p-2 md:p-4 w-full">
      <div className="flex flex-col-reverse md:flex-row gap-4 items-start justify-center w-full ">
        
        {/* Thumbnail Gallery (Left/Bottom) */}
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
                className={`w-full h-full object-cover rounded  cursor-pointer 
                  ${selectedImage === image.url ? "border-black border-2" : "border border-gray-300 rounded"}
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

        {/* Main Image / VTO Launch Area (Center) */}
        <div className="w-full max-w-full relative overflow-hidden border border-gray-300 rounded shadow-lg">
          
          {/* Main Image Display */}
          <div className="w-full aspect-[4/3] md:aspect-[5/4] lg:h-[500px] overflow-hidden">
             {!loadedImages[selectedImage] && (
              <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>
             )}
             <img
               src={selectedImage}
               alt={`Main view of ${product?.name}`}
               loading="eager"
               className={`w-full h-full rounded object-cover transition-opacity duration-500 
                 ${loadedImages[selectedImage] ? "opacity-100" : "opacity-0"}
               `}
               onLoad={() => handleImageLoad(selectedImage)}
             />
          </div>

          {/* Action Buttons Overlay (Now styled better for mobile) */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 gap-3 flex items-center justify-center px-2 py-0.5 font-semibold text-xs">
            <button
              className="bg-black/60 text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 hover:bg-black/80 transition duration-200"
              onClick={() => setIsExpandModeOpen(true)}
              aria-label="Expand Images"
            >
              <Expand className="h-4 w-4" />
              <span>Expand</span>
            </button>
            
            {/* VTO Button - Prominent and checked for DeepAR path */}
            {deepAREffectPath ? (
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition duration-200"
                onClick={() => setIsTryOnOpen(true)}
                aria-label="Try on sunglasses in augmented reality"
              >
                🤳 Try On
              </button>
            ) : (
              <button
                 className="bg-gray-400 text-white px-4 py-2 rounded-full cursor-not-allowed"
                 disabled
              >
                 Try On (N/A)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image Expansion Modal */}
      {isExpandModeOpen && (
        <ProductPreviewExpanded 
          images={activeColor?.images} 
          onclose={setIsExpandModeOpen}
        />
      )}

      {/* VTO Modal - Renders the DeepARTryOn component */}
      {isTryOnOpen && deepAREffectPath && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 relative max-w-[800px] w-full">
            
            {/* Close Button */}
            <button
              className="absolute top-0 right-0 m-4 text-3xl text-gray-800 bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-md hover:bg-gray-100 transition"
              onClick={() => setIsTryOnOpen(false)}
              aria-label="Close Virtual Try On"
            >
              &times;
            </button>

            <h3 className="text-center text-2xl font-bold text-gray-900 mb-4">Virtual Try-On</h3>
            <p className="text-center text-sm text-gray-500 mb-4">
              Requires camera access. Look directly into the camera for the best fit.
            </p>

            {/* DEEPAR COMPONENT */}
            <DeepARTryOn effectPath={deepAREffectPath} /> 
            
          </div>
        </div>
      )}
    </div>
  );
}

// NOTE: To make this component runnable in a single context, 
// I've temporarily added a mock data structure below. In a real project, 
// this data would come from your API/database.

// export default ProductPreview;

// --- Mock Product Data for Demonstration ---
// const mockProduct = {
//   id: 1,
//   name: "The Voyager Aviator",
//   colors: [
//     {
//       name: "Classic Black",
//       images: [
//         { url: "https://placehold.co/800x600/1e293b/FFFFFF?text=BLACK+FRONT" },
//         { url: "https://placehold.co/800x600/1e293b/FFFFFF?text=BLACK+SIDE" },
//       ],
//       deepAREffectPath: "black_aviator_model.deepar", // <- This is the critical field!
//     },
//     {
//       name: "Tortoise Shell",
//       images: [
//         { url: "https://placehold.co/800x600/78350f/FFFFFF?text=TORTOISE+FRONT" },
//         { url: "https://placehold.co/800x600/78350f/FFFFFF?text=TORTOISE+SIDE" },
//       ],
//       deepAREffectPath: "tortoise_aviator_model.deepar",
//     },
//   ],
// };

// Example Usage Component (to allow easy running/testing)
// const App = () => {
//     const [color, setColor] = useState(mockProduct.colors[0]);

//     return (
//         <div className="p-8 bg-gray-100 min-h-screen">
//             <h1 className="text-3xl font-bold mb-6">Product Details Page</h1>
//             <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-xl shadow-2xl">
//                 {/* Left Side: Image Preview & VTO */}
//                 <div className="md:w-1/2">
//                     <ProductPreview product={mockProduct} selectedColor={color} />
//                 </div>
                
//                 {/* Right Side: Details & Selectors */}
//                 <div className="md:w-1/2 p-4">
//                     <h2 className="text-4xl font-extrabold mb-2">{mockProduct.name}</h2>
//                     <p className="text-2xl text-indigo-600 font-semibold mb-6">$99.99</p>
                    
//                     <h3 className="text-xl font-semibold mb-3">Color: {color.name}</h3>
//                     <div className="flex space-x-3 mb-6">
//                         {mockProduct.colors.map((c) => (
//                             <button
//                                 key={c.name}
//                                 onClick={() => setColor(c)}
//                                 className={`w-10 h-10 rounded-full border-4 transition-all ${
//                                     c.name === color.name ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-200 hover:border-indigo-400'
//                                 }`}
//                                 style={{ 
//                                     backgroundColor: c.name === "Classic Black" ? "#1e293b" : "#78350f" 
//                                 }}
//                                 aria-label={`Select color ${c.name}`}
//                             />
//                         ))}
//                     </div>

//                     <button className="w-full py-4 bg-teal-500 text-white text-lg font-bold rounded-lg shadow-md hover:bg-teal-600 transition">
//                         Add to Cart
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default App;