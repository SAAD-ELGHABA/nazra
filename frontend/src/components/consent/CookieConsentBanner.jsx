import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { COOKIEPOLICY } from "../../constant/routerConstants";
import { useConsent } from "../../context/ConsentContext";

/**
 * Consent prompt for visitors who have not chosen yet.
 *
 * Two deliberate choices:
 *
 * 1. "Refuse all" carries the same visual weight as "Accept all". Burying
 *    refusal behind a link is the single most-cited dark pattern in consent
 *    enforcement, so the two act as a matched pair.
 * 2. z-40 keeps the banner under the cart and checkout sheets, which sit at
 *    z-50. It informs; it must never be able to cover a buy button.
 */
export default function CookieConsentBanner() {
  const { t } = useTranslation();
  const { isBannerOpen, acceptAll, refuseAll, openPreferences } = useConsent();
  const [isVisible, setIsVisible] = useState(false);

  // Mount first, animate on the next frame, so the banner slides in instead of
  // appearing fully formed on top of the page.
  useEffect(() => {
    if (!isBannerOpen) {
      setIsVisible(false);
      return undefined;
    }
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [isBannerOpen]);

  if (!isBannerOpen) return null;

  return (
    <div
      role="region"
      aria-label={t("cookies.banner.label")}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="nazra-container flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-[#151515]">
            {t("cookies.banner.title")}
          </h2>
          <p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-stone-600">
            {t("cookies.banner.copy")}{" "}
            <Link
              to={COOKIEPOLICY}
              className="font-semibold text-[#8d643d] underline underline-offset-4 hover:text-[#a97849]"
            >
              {t("cookies.banner.more")}
            </Link>
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={refuseAll}
            className="nazra-button border border-black/25 bg-white text-black hover:border-black"
          >
            {t("cookies.banner.refuseAll")}
          </button>
          <button
            type="button"
            onClick={openPreferences}
            className="nazra-button border border-black/25 bg-white text-black hover:border-black"
          >
            {t("cookies.banner.customize")}
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="nazra-button bg-black text-white hover:bg-[#8d643d]"
          >
            {t("cookies.banner.acceptAll")}
          </button>
        </div>
      </div>
    </div>
  );
}
