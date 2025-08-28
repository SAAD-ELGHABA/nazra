import React from "react";
import {Link} from 'react-router-dom'
export default function ProductDetailsModal({ isOpen, onClose, products }) {
  if (!isOpen || !products) return null;

  const totalAmount = products.reduce(
    (acc, item) => acc + (item.product.sale_price || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto flex items-center h-full w-full z-50">
      <div className="relative mx-auto p-5 w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center pb-4 border-b">
            <h3 className="text-xl font-medium text-gray-900">
              Ordered Products
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mt-4 max-h-96 overflow-y-auto">
            {products.map((item, idx) => {
              const colorObj = item.product.colors?.find(
                (c) => c.name === item.color
              );
              const imageUrl = colorObj?.images?.[0]?.url || item.product.image;

              return (
                <div
                  key={idx}
                  className="flex items-center py-4 border-b border-gray-300"
                >
                  <Link
                  to={`/product/${item?.product?.slug}`}
                  className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No Image</span>
                    )}
                  </Link>

                  <div className="ml-4 flex-1">
                    <h4 className="text-lg font-medium text-gray-900">
                      {item.product.name}
                    </h4>

                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-600">Color: </span>
                      <div
                        className="h-4 w-4 rounded-full ml-2 border border-gray-300"
                        style={{ backgroundColor: colorObj?.value || "#ccc" }}
                      ></div>
                      <span className="text-sm text-gray-800 ml-1">
                        {item.color}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ${(item.product.sale_price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between items-center border-t pt-4">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-semibold text-gray-900">
              ${totalAmount.toFixed(2)}
            </span>
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
