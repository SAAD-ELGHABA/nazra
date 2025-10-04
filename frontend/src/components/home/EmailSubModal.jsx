import React, { useEffect, useState } from "react";
import { storeEmail } from "../../api/api";
import { useTranslation } from "react-i18next";
import { toast} from 'sonner'
function EmailSubModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
useEffect(() => {
  const subscribed = localStorage.getItem("emailSubscribed");
  if (subscribed) return;

  const lastSeen = localStorage.getItem("emailModalLastSeen");
  if (lastSeen) {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();

    const oneWeekLater = new Date(lastSeenDate);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);

    if (now < oneWeekLater) return;
  }

  const timer = setTimeout(() => {
    setIsOpen(true);
    setShowModal(true);
  }, 3000);

  return () => clearTimeout(timer);
}, []);


  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
    localStorage.setItem("emailModalLastSeen", new Date().toISOString());
  };

  const handleSubscribe = async () => {
    setShowModal(false);
    setTimeout(() => {
      setIsOpen(false);
      const response = storeEmail(email);
      setEmail("");
      toast.success(response?.message)
    }, 300);
    localStorage.setItem("emailSubscribed", "true");
  };
  const {t} = useTranslation()
  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-transform duration-3000 ${
        showModal ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="bg-black/90 shadow-xl rounded-xl p-5 w-80 relative text-white">
        <button
          onClick={handleClose}
          className="absolute top-2 right-3 text-white hover:text-gray-300"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-2">
          {t("EmailModal.title")}
        </h2>

        <p className="text-sm mb-4">
          {t("EmailModal.message")}
        </p>

        <div className="flex flex-col gap-2">
          <input
            type="email"
            placeholder={`${t("EmailModal.placeholder")}`}
            className="flex-grow border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-white text-white"
            value={email}
            onChange={(e) => setEmail(e?.target?.value)}
          />
          <button
            onClick={handleSubscribe}
            className="bg-white text-black px-4 py-2 rounded-lg hover:bg-white/80"
          >
            {t("EmailModal.subscribe")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailSubModal;
