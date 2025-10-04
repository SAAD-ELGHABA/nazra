import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function CheckoutToast({ isOpen, onClose, duration = 5000 }) {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(100);
  const { t } = useTranslation();
  useEffect(() => {
    let timer;
    let interval;

    if (isOpen) {
      setShow(true);
      setProgress(100);

      const start = Date.now();

      interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const percent = Math.max(100 - (elapsed / duration) * 100, 0);
        setProgress(percent);
      }, 100);

      timer = setTimeout(() => {
        setShow(false);
        onClose();
      }, duration);
    } else {
      setShow(false);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isOpen, onClose, duration]);

  if (!show) return null;

  return (
    <div className="fixed top-[65px] right-5 z-50 animate-slideIn">
      <div className="bg-white shadow-xl rounded-xl px-5 py-4 border border-gray-200 w-80 relative">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{t("checkoutModal.title")}</h3>
            <p className="text-gray-600 text-sm">
              {t("checkoutModal.message")}
            </p>
          </div>
          <button
            onClick={() => {
              setShow(false);
              onClose();
            }}
            className="text-gray-500 hover:text-black ml-3"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            {t("checkoutModal.cancel")}
          </button>
          <a
            href="/checkout-card"
            onClick={onClose}
            className="block w-full text-center bg-green-600 text-white py-3 rounded-lg text-sm font-bold transition-colors duration-300 hover:bg-green-700 shadow-xl shadow-green-600/30 tracking-wider uppercase"
          >
            {t("checkoutModal.confirm")}
          </a>
        </div>

        <div
          className="absolute bottom-0 left-0 h-1 bg-green-600 rounded-b-xl"
          style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
        />
      </div>
    </div>
  );
}

export default CheckoutToast;
