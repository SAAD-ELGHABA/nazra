import React from "react";
import { useCard } from "../context/CardContext";
import { RemoveFormatting, Trash2, X } from "lucide-react";
// NOTE: Assuming useCard, Link, and useTranslation are correctly available in the environment.

// Mock imports for runnable component in a single file environment
// In a real project, replace these mocks with your actual imports.
// const useCard = () => ({
//     cardItems: [
//         { id: 1, name: "The Voyager Aviator", slug: "voyager-aviator", sale_price: 99.99, quantity: 1, colors: [{ name: "Onyx Black", value: "#000000", images: [{ url: "https://placehold.co/100x100/1e293b/FFFFFF?text=BLACK" }] }] },
//         { id: 2, name: "Desert Sunset Round", slug: "sunset-round", sale_price: 149.99, quantity: 2, colors: [{ name: "Amber Tortoise", value: "#8B4513", images: [{ url: "https://placehold.co/100x100/78350f/FFFFFF?text=TORTOISE" }] }] },
//     ],
//     updateQuantity: (id, qty) => console.log(`Updating item ${id} to ${qty}`),
//     removeFromCard: (id, color) => console.log(`Removing item ${id} (${color})`),
// });
const Link = ({ to, onClick, className, children }) => <a href={to} onClick={onClick} className={className}>{children}</a>;
const useTranslation = () => ({ t: (key) => key.split('.').pop() }); // Mock translation

/**
 * Renders the Cart Modal (Slide-out Drawer) with a luxury, modern aesthetic.
 */
function CardModal({ isOpen, onClose }) {
  const { cardItems, updateQuantity, removeFromCard } = useCard();
  const { t } = useTranslation();

  const total = cardItems.reduce(
    (sum, item) => sum + item.sale_price * item.quantity,
    0
  );

  return (
    <>
      {/* Custom Styles for Animation and Layout */}
      <style>
        {`
          .overlay {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background-color: rgba(0, 0, 0, 0);
            transition: background-color 0.3s ease-in-out;
            z-index: 40; /* Tailwind z-40 */
            pointer-events: none;
          }
          .overlay-show {
            background-color: rgba(0, 0, 0, 0.6);
            pointer-events: auto;
          }
          .modal {
            position: fixed;
            top: 0;
            right: 0;
            height: 100%;
            width: 100%;
            max-width: 420px; /* Max width for luxury feel */
            background-color: #ffffff;
            box-shadow: -4px 0 10px rgba(0, 0, 0, 0.2);
            transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Smooth slide */
            z-index: 50; /* Tailwind z-50 */
            transform: translateX(100%);
          }
          .modal-slide-in {
            transform: translateX(0%);
          }
          .modal-slide-out {
            transform: translateX(100%);
          }
          @media (max-width: 640px) {
            .modal {
              max-width: 100%;
            }
          }
        `}
      </style>

      {/* Overlay backdrop */}
      <div
        className={`overlay ${isOpen ? "overlay-show" : ""}`}
        onClick={onClose}
      ></div>

      {/* Slide-out Modal */}
      <div
        className={`modal ${
          isOpen ? "modal-slide-in" : "modal-slide-out"
        } flex flex-col`}
      >
        
        {/* Modal Header: High Contrast */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-100">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
            {t("cart.yourCart")}
            <span className="ml-2 text-sm font-medium text-green-600">
              ({cardItems.length})
            </span>
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-black transition text-3xl leading-none"
            aria-label="Close cart"
          >
           <X />
          </button>
        </div>

        {/* Cart Items List: Elegant Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {cardItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg mb-2">{t("cart.empty")}</p>
              <button 
                onClick={onClose} 
                className="text-green-600 hover:text-green-800 font-medium transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {cardItems.map((item) => (
                <li
                  key={item?.id}
                  className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-b-0"
                >
                  
                  {/* Item Image */}
                  <Link to={`/product/${item?.slug}`} onClick={onClose} className="flex-shrink-0">
                    <img
                      src={item?.colors[0]?.images[0]?.url || "https://placehold.co/80x80/E5E7EB/A1A1AA?text=NAZRA"}
                      alt={item?.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-100 shadow-sm transition-opacity hover:opacity-80"
                      loading="lazy"
                    />
                  </Link>

                  {/* Item Details and Controls */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <Link to={`/product/${item?.slug}`} onClick={onClose} className="hover:text-indigo-600 transition">
                        <h3 className="font-semibold text-sm text-gray-900 truncate whitespace-pre-line pr-2">{item?.name}</h3>
                      </Link>
                      <span className="font-bold text-base text-gray-900 whitespace-nowrap">
                        MAD {(item?.sale_price * item?.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Color and Quantity Controls */}
                    <div className="flex items-center justify-between mt-2 text-sm">
                      
                      {/* Color Tag & Remove Button */}
                      <div className="flex items-center gap-2">
                        {/* Color Swatch */}
                        <span
                          style={{ backgroundColor: item?.colors[0]?.value }}
                          className={`
                            w-6 h-6 rounded-full inline-block border-2 shadow-inner
                            ${item?.colors[0]?.name === "Onyx Black" ? "border-gray-500" : "border-transparent"}
                          `}
                          title={`Color: ${item?.colors[0]?.name}`}
                        >
                        </span>
                        
                        <button
                          onClick={() => removeFromCard(item?.id, item?.colors[0]?.name)}
                          className="text-xs text-red-500 hover:text-red-700 transition font-medium ml-2"
                        >
                          <Trash2 />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item?.id, item?.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item?.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-3 text-sm font-semibold">{item?.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item?.id, item?.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-lg font-medium text-gray-700 hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fixed Footer: Total and Checkout (Luxury Dark Block) */}
        {cardItems.length > 0 && (
          <div className="border-t border-gray-200 p-6 w-full bg-gray-100  sticky bottom-0">
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium tracking-wide capitalize">{t("cart.total")}:</span>
              <span className="text-2xl font-extrabold">MAD {total.toFixed(2)}</span>
            </div>
            
            <p className="text-xs text-gray-400 mb-4 text-center">
                Shipping calculated at checkout.
            </p>

            <Link
              to="/checkout-card"
              onClick={onClose}
              className="block w-full text-center bg-green-600 text-white py-3 rounded-lg text-sm font-bold transition-colors duration-300 hover:bg-green-700 shadow-xl shadow-green-600/30 tracking-wider uppercase"
            >
              {t("cart.checkout")}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default CardModal;