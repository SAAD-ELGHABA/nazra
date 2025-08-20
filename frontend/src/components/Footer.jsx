import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LINKS = [
  {
    key: "quickLinks",
    links: [
      { key: "aboutUs", path: "/about" },
      { key: "contactUs", path: "/contact" },
      { key: "shopNow", path: "/shop" },
      { key: "returnsPolicy", path: "/returns-policy" },
    ],
  },
  {
    key: "customerService",
    links: [
      { key: "helpCenter", path: "/help-center" },
      { key: "shippingInfo", path: "/shipping-info" },
      { key: "giftCard", path: "/gift-card" },
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
      { key: "accessibilityStatement", path: "/accessibility-statement" },
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

  return (
    <div className="min-h-[50vh] mt-12 flex flex-col items-center justify-center">
      <div className="flex flex-col md:flex-row md:items-center justify-between w-11/12 mb-4 gap-6">
        <div>
          <h3
            className="font-bold text-[15px] md:text-[26px] lg:text-[26px]"
            style={{ lineHeight: "1.2", letterSpacing: "4px" }}
          >
            {t("footer.subscribeTitle")}
          </h3>
          <p>{t("footer.subscribeSubtitle")}</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 ">
            <input
              type="email"
              className="py-3 px-2 border hover:outline-none outline-none rounded"
              placeholder={t("footer.emailPlaceholder")}
            />
            <button className="px-6 py-3 text-white  rounded transition-colors duration-300 hover:bg-white border bg-black hover:text-black">
              {t("footer.join")}
            </button>
          </div>
          <div className="text-sm">
            <Link>{t("footer.privacyNotice")}</Link>
          </div>
        </div>
      </div>

      <div className="w-11/12 grid grid-cols-3 md:grid-cols-6 gap-2 md:place-items-center border-black border-y py-10">
        {LINKS.map((section, idx) => (
          <div key={idx} className="flex flex-col gap-2 h-full">
            <h3 className="font-bold text-sm md:text-lg">{t(`footer.links.${section.key}.title`)}</h3>
            <ul className="flex flex-col gap-1">
              {section.links.map((link, i) => (
                <li key={i} className="text-sm hover:underline cursor-pointer">
                  <a href={link.path} className="capitalize text-xs md:text-sm">
                    {t(`footer.links.${section.key}.items.${link.key}`)}
                  </a>
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
