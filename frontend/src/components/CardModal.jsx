import React from "react";
import { useCard } from "../context/CardContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
function CardModal({ isOpen, onClose }) {
  const { cardItems, updateQuantity, removeFromCard } = useCard();

  const total = cardItems.reduce(
    (sum, item) => sum + item.sale_price * item.quantity,
    0
  );
  const { t } = useTranslation();
  return (
    <>
      <div
        className={`overlay ${isOpen ? "overlay-show" : ""}`}
        onClick={onClose}
      ></div>

      <div
        className={`modal ${
          isOpen ? "modal-slide-in" : "modal-slide-out"
        } flex flex-col`}
      >
        <div className="modal-header">
          <h2 className="font-bold">{t("cart.yourCart")}</h2>
          <button onClick={onClose}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cardItems.length === 0 ? (
            <p className="p-4 text-center">{t("cart.empty")}</p>
          ) : (
            <ul className="p-4 space-y-4">
              {cardItems.map((item) => (
                <li
                  key={item?.id}
                  className="flex justify-between items-center border-b border-gray-300 pb-4"
                >
                  <div className="flex items-center gap-4">
                    <Link to={`/product/${item?.slug}`} onClick={onClose}>
                      <img
                        src={item?.colors[0]?.images[0]}
                        alt={item?.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </Link>
                    <div>
                      <h3 className="font-semibold">{item?.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          onClick={() =>
                            updateQuantity(item?.id, item?.quantity - 1)
                          }
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          −
                        </button>
                        <span>{item?.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item?.id, item?.quantity + 1)
                          }
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span
                          key={item?.colors[0]?.name}
                          style={{ backgroundColor: item?.colors[0]?.hex }}
                          className={`
                  w-10 h-5 rounded-full flex items-center justify-center
                  hover:border-black transition-colors duration-300
                  text-xs
                  ${
                    item?.colors[0]?.name === "white" ||
                    item?.colors[0]?.name === "transparent"
                      ? "text-black"
                      : "text-white"
                  }
                `}
                        >
                          {item?.colors[0]?.name}
                        </span>
                        <button
                          onClick={() => removeFromCard(item?.id)}
                          className="text-xs text-red-500 hover:underline mt-1"
                        >
                          {t("cart.remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold">
                    MAD {(item?.sale_price * item?.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cardItems.length > 0 && (
          <div className="border-t border-gray-300 p-4 w-full sticky bottom-0 bg-white">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold">{t("cart.total")}:</span>
              <span className="font-bold text-sm">MAD {total.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout-card"
              onClick={onClose}
              className="block w-full text-center bg-black text-white py-2 rounded transition-colors duration-300 hover:bg-white hover:text-black border"
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
