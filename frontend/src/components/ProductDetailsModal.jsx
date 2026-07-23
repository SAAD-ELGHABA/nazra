import React from "react";
import { Link } from "react-router-dom";
import {
  formatMAD,
  getLineTotal,
  getProductSnapshotImage,
  getProductSnapshotName,
  getProductSnapshotSlug,
} from "../utils/adminFormatting";

export default function ProductDetailsModal({ isOpen, onClose, products }) {
  if (!isOpen || !products) return null;

  const totalAmount = products.reduce((acc, item) => acc + getLineTotal(item), 0);

  return (
    <div className="fixed inset-0 z-50 flex h-full w-full items-center overflow-y-auto bg-black/50" role="dialog" aria-modal="true" aria-labelledby="ordered-products-title">
      <div className="relative mx-auto w-full max-w-2xl rounded-md bg-white p-5 shadow-lg">
        <div className="mt-3">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 id="ordered-products-title" className="text-xl font-medium text-gray-900">
              Ordered Products
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close ordered products"
            >
              <span aria-hidden="true" className="text-2xl leading-none">&times;</span>
            </button>
          </div>

          <div className="mt-4 max-h-96 overflow-y-auto">
            {products.map((item, idx) => {
              const product = item.product || {};
              const colorObj = product.colors?.find((c) => c.name === item.color);
              const imageUrl = getProductSnapshotImage(item);
              const name = getProductSnapshotName(item);
              const slug = getProductSnapshotSlug(item);
              const lineTotal = getLineTotal(item);

              return (
                <div key={item._id || idx} className="flex items-center border-b border-gray-300 py-4">
                  {slug ? (
                    <Link to={`/product/${slug}`} className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                      {imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" /> : <span className="text-sm text-gray-400">No Image</span>}
                    </Link>
                  ) : (
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                      {imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" /> : <span className="text-sm text-gray-400">No Image</span>}
                    </div>
                  )}

                  <div className="ml-4 flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{name}</h4>

                    <div className="mt-1 flex items-center">
                      <span className="text-sm text-gray-600">Color: </span>
                      <div
                        className="ml-2 h-4 w-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: colorObj?.value || "#ccc" }}
                      />
                      <span className="ml-1 text-sm text-gray-800">{item.color || "N/A"}</span>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      <span className="text-sm font-medium text-gray-900">{formatMAD(lineTotal)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-semibold text-gray-900">{formatMAD(totalAmount)}</span>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-black px-4 py-2 text-base font-medium text-white shadow-sm hover:border hover:bg-transparent hover:text-black"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
