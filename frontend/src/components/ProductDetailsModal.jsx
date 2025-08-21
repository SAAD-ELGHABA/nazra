import React from "react";


export default function ProductDetailsModal({ isOpen, onClose, products }) {
  if (!isOpen) return null;

  // Sample product data with images and colors
  const productDetails =  [
    {
      id: 1,
      name: 'Aviator Classic',
      color: 'Black',
      price: '$129.99',
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400&q=80'
    },
    {
      id: 2,
      name: 'Wayfarer Premium',
      color: 'Tortoise',
      price: '$159.99',
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400&q=80'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto flex items-center h-full w-full z-50">
      <div className="relative  mx-auto p-5  w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center pb-4 border-b">
            <h3 className="text-xl font-medium text-gray-900">Ordered Products</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 max-h-96 overflow-y-auto">
            {productDetails.map((product) => (
              <div key={product.id} className="flex items-center py-4 border-b">
                <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-600">Color: </span>
                    <div 
                      className="h-4 w-4 rounded-full ml-2 border border-gray-300"
                      style={{ 
                        backgroundColor: product.color.toLowerCase() === 'black' ? '#000' : 
                                        product.color.toLowerCase() === 'tortoise' ? '#964B00' : '#ccc'
                      }}
                    ></div>
                    <span className="text-sm text-gray-800 ml-1">{product.color}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Qty: {product.quantity}</span>
                    <span className="text-sm font-medium text-gray-900">{product.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-black text-white text-base font-medium rounded-md shadow-sm hover:bg-transparent hover:text-black hover:border"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}