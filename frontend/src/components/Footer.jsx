import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { storeEmail } from "../api/api";
import { LoaderCircle } from "lucide-react";
const LINKS = [
  {
    key: "quickLinks",
    links: [
      { key: "aboutUs", path: "/about" },
      { key: "contactUs", path: "/contact-us" },
      { key: "shopNow", path: "/store" },
      { key: "returnsPolicy", path: "/returns-policy" },
    ],
  },
  {
    key: "customerService",
    links: [
      { key: "helpCenter", path: "/help-center" },
      { key: "shippingInfo", path: "/shipping-info" },
      { key: "termsOfUse", path: "/terms-of-use" },
    ],
  },
  {
    key: "followUs",
    links: [
      { key: "instagram", path: "https://www.instagram.com/nazra.sunglasses/" },
      { key: "facebook", path: "https://www.facebook.com/nazra.sunglasses/" },
      { key: "twitter", path: "https://twitter.com/nazra_sunglasses" },
      { key: "pinterest", path: "https://pinterest.com/nazra_sunglasses" },
    ],
  },
  {
    key: "legal",
    links: [
      { key: "privacyPolicy", path: "/privacy-policy" },
      { key: "termsAndConditions", path: "/terms-and-conditions" },
    ],
  },
  {
    key: "stayConnected",
    links: [
      { key: "subscribeNewsletter", path: "/subscribe" },
      { key: "exclusiveOffers", path: "/offers" },
      { key: "joinCommunity", path: "/community" },
      { key: "feedback", path: "/feedback" },
    ],
  },
  {
    key: "contactUs",
    links: [
      { key: "emailUs", path: "/email-us" },
      { key: "callUs", path: "/call-us" },
      { key: "liveChat", path: "/live-chat" },
    ],
  },
];

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleEmail = async (e) => {
    if(!email){
      return
    }
    setIsLoading(true);
    e?.preventDefault();
    try {
      const response = storeEmail(email);
      setEmail("");
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  };
  return (
    <div className="min-h-[50vh] mt-12 flex flex-col items-center justify-center">
      <div className="flex flex-col md:flex-row md:items-center justify-between w-11/12 mb-4 gap-6 mx-auto">
        <div className="text-center md:text-left md:w-1/2">
          <h3
            className="font-bold text-lg md:text-2xl lg:text-3xl"
            style={{ lineHeight: "1.2", letterSpacing: "2px" }}
          >
            {t("footer.subscribeTitle")}
          </h3>
          <p className="text-sm md:text-base mt-2">
            {t("footer.subscribeSubtitle")}
          </p>
        </div>

        <div className="flex flex-col gap-3 md:w-1/3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
            <input
              type="email"
              className="flex-1 py-3 px-3 border rounded focus:outline-none outline-none text-sm md:text-base"
              placeholder={t("footer.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e?.target?.value)}
            />
            <button
              className="px-6 py-3 text-white rounded transition-colors duration-300 hover:bg-white border bg-black hover:text-black text-sm md:text-base"
              onClick={handleEmail}
            >
              {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin"/> : <span>{t("footer.join")}</span>}
            </button>
          </div>

          <div className="text-xs sm:text-sm text-center sm:text-left">
            <Link>{t("footer.privacyNotice")}</Link>
          </div>
        </div>
      </div>

      <div className="w-11/12 grid grid-cols-3 md:grid-cols-6 gap-2 md:place-items-center border-black border-y py-10">
        {LINKS.map((section, idx) => (
          <div key={idx} className="flex flex-col gap-2 h-full">
            <h3 className="font-bold text-sm md:text-lg">
              {t(`footer.links.${section.key}.title`)}
            </h3>
            <ul className="flex flex-col gap-1">
              {section.links.map((link, i) => (
                <li key={i} className="text-sm hover:underline cursor-pointer">
                  <Link
                    to={link.path}
                    className="capitalize text-xs md:text-sm"
                  >
                    {t(`footer.links.${section.key}.items.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse md:flex-row-reverse justify-between items-center w-11/12 mt-6">
        <p className="text-center text-sm mt-4">
          © {year} Nazra Sunglasses. {t("footer.rights")}
        </p>
        <img
          src="/Main-logo.jpeg"
          className="w-[100px] mx-auto md:m-0 object-cover"
          alt="NAZRA"
        />
      </div>
    </div>
  );
};

export default Footer;
