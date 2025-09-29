// import React, { useEffect, useRef, useState } from 'react';
// // NOTE: You must install the DeepAR SDK: npm install deepar
// import {deepar} from 'deepar'; 

// // IMPORTANT: Replace this placeholder with your actual DeepAR License Key.
// // You might need to adjust how you access environment variables (e.g., process.env.REACT_APP_DEEPAR_KEY)
// const DEEPAR_LICENSE_KEY = import.meta.REACT_APP_DEEPAR_SDK_KEY; 

// /**
//  * Renders the DeepAR virtual try-on experience.
//  * @param {string} effectPath - The path or ID of the DeepAR sunglasses effect file.
//  */
// const DeepARTryOn = ({ effectPath }) => {
//   const canvasRef = useRef(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const deepAR = useRef(null); // Reference to the DeepAR instance

//   useEffect(() => {
//     // If the effectPath is missing (e.g., data not loaded), stop initialization.
//     if (!effectPath) {
//       setError("Error: Sunglasses model path is missing.");
//       setLoading(false);
//       return;
//     }

//     const initializeDeepAR = async () => {
//       setLoading(true);
//       setError(null);
      
//       try {
//         // 1. Initialize the DeepAR engine
//         deepAR.current = await deepar.initialize({
//           // Using the static key for demonstration; replace with your environment variable logic
//           licenseKey: DEEPAR_LICENSE_KEY, 
//           canvas: canvasRef.current,
//           // You may need to specify paths for DeepAR's core files:
//           // deeparWasmPath: '/deepar_assets/deepar.wasm', 
//           // faceTrackingModelPath: '/deepar_assets/models/face/models.bin',
//         });

//         // 2. Start the camera and facial tracking
//         await deepAR.current.startVideo(true); 

//         // 3. Load the specific sunglasses effect associated with the product
//         await deepAR.current.switchEffect(effectPath); 
        
//         setLoading(false);

//       } catch (err) {
//         console.error("DeepAR Initialization Failed:", err);
//         // Provide user-friendly feedback on common issues
//         setError("VTO failed: Check camera permissions and ensure DeepAR assets are correctly hosted.");
//         setLoading(false);
//       }
//     };

//     initializeDeepAR();

//     // Cleanup function: stop video and destroy the instance when the modal closes
//     return () => {
//       if (deepAR.current) {
//         deepAR.current.stopVideo();
//         deepAR.current.destroy();
//         deepAR.current = null;
//       }
//     };
//   }, [effectPath]); // Re-run effect only if a different pair of glasses is selected

//   // --- Rendering UI ---
//   return (
//     <div className="relative w-full aspect-[4/3] max-h-[60vh] mx-auto bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
      
//       {/* The canvas is where DeepAR draws the video feed and the AR sunglasses overlay */}
//       <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10"></canvas>

//       {/* Loading Overlay */}
//       {(loading || error) && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black bg-opacity-70 text-white p-4">
//           {loading && (
//             <>
//               <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
//               <p className="mt-4 text-lg font-semibold">Loading Virtual Try-On...</p>
//               <p className="mt-2 text-sm text-gray-300">Please grant camera permission.</p>
//             </>
//           )}
//           {error && <p className="mt-4 text-rose-400 text-center font-medium">{error}</p>}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DeepARTryOn;