import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCheck, Phone, Ruler, Timer, Truck } from "lucide-react";
import { createWhatsAppLink, SITE_CONFIG } from "../../config/site";
import WhatsAppGlyph from "../common/WhatsAppGlyph";

const OPENS_AT = 9;
const CLOSES_AT = 21;
const BENEFITS = [
  ["fast", Timer],
  ["sizing", Ruler],
  ["cod", Truck],
];

/** Current hour in Casablanca, so the status is right whatever the visitor's device says. */
const casablancaHour = () => {
  try {
    return Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Casablanca",
        hour: "2-digit",
        hourCycle: "h23",
      }).format(new Date()),
    );
  } catch {
    return new Date().getHours();
  }
};

/**
 * "Order on WhatsApp" banner.
 *
 * WhatsApp is the highest-intent channel for Moroccan COD, so this is treated
 * as a real conversion surface rather than a support footnote:
 * - Official WhatsApp mark + brand green, so the affordance is recognised instantly
 * - Live open/closed status against Casablanca business hours (sets expectations
 *   instead of leaving a message unanswered overnight)
 * - A phone fallback, because a good share of COD buyers would rather call
 * - A short chat preview that shows a human answers, which is what actually
 *   converts hesitant first-time buyers
 */
export default function WhatsAppCTA() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [hour, setHour] = useState(() => casablancaHour());

  const isOpen = hour >= OPENS_AT && hour < CLOSES_AT;
  const href = useMemo(() => createWhatsAppLink(t("home.whatsapp.message")), [t]);
  const telHref = `tel:${SITE_CONFIG.phone.replace(/\s/g, "")}`;

  // Keep the status honest if the page is left open across opening time.
  useEffect(() => {
    const timer = window.setInterval(() => setHour(casablancaHour()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px 0px", threshold: 0.15 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="nazra-container pb-12 pt-2" aria-labelledby="whatsapp-title">
      <div className="relative overflow-hidden rounded-lg border border-[#dfd6c7] bg-[#faf6f0]">
        {/* Soft green light from the action side */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 120% at 100% 0%, rgba(37,211,102,.12), transparent 58%), radial-gradient(70% 90% at 0% 100%, rgba(144,105,65,.09), transparent 60%)",
          }}
        />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_minmax(0,.85fr)] lg:items-center lg:gap-12 lg:p-10">
          {/* ── Message + actions ─────────────────────────────── */}
          <div className={revealed ? "nazra-reveal" : "opacity-0"}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f7a3d]">
                <WhatsAppGlyph className="h-3.5 w-3.5" />
                {t("home.whatsapp.eyebrow")}
              </span>

              <span className="inline-flex items-center gap-2 text-[11px] font-medium text-stone-600">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  {isOpen && (
                    <span className="nazra-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-70" />
                  )}
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${isOpen ? "bg-[#25D366]" : "bg-stone-400"}`}
                  />
                </span>
                {isOpen
                  ? t("home.whatsapp.online")
                  : t("home.whatsapp.offline", { time: `${OPENS_AT}h` })}
              </span>
            </div>

            <h2 id="whatsapp-title" className="nazra-heading mt-4 max-w-lg">
              {t("home.whatsapp.title")}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-stone-600">
              {t("home.whatsapp.copy")}
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {BENEFITS.map(([key, Icon]) => (
                <li
                  key={key}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-700"
                >
                  {React.createElement(Icon, {
                    className: "h-3.5 w-3.5 text-[#906941]",
                    "aria-hidden": true,
                  })}
                  {t(`home.whatsapp.benefits.${key}`)}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                /* Hook point: fire the `Contact` pixel event here once analytics land. */
                className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-md bg-[#25D366] px-6 text-sm font-bold text-[#052e16] shadow-[0_10px_24px_-12px_rgba(37,211,102,.9)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#1fbe5b] hover:shadow-[0_14px_30px_-12px_rgba(37,211,102,1)] focus-visible:outline-[#0f7a3d]"
              >
                <WhatsAppGlyph className="h-5 w-5 transition group-hover:scale-110" />
                {t("home.whatsapp.cta")}
              </a>

              <a
                href={telHref}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-800 transition hover:border-stone-800"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {t("home.whatsapp.call")}
              </a>
            </div>

            <p className="mt-4 text-[11px] text-stone-500">
              <span dir="ltr" className="font-semibold text-stone-700">
                {SITE_CONFIG.phone}
              </span>
              {" · "}
              {t("home.whatsapp.hours", { from: `${OPENS_AT}h`, to: `${CLOSES_AT}h` })}
            </p>
          </div>

          {/* ── Chat preview (decorative) ─────────────────────── */}
          <div
            aria-hidden="true"
            className={`hidden select-none lg:block ${revealed ? "nazra-reveal nazra-reveal--delayed" : "opacity-0"}`}
          >
            <div className="mx-auto max-w-[320px] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_24px_50px_-30px_rgba(0,0,0,.5)]">
              <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 font-display text-xs font-bold">
                  N
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">{SITE_CONFIG.name}</p>
                  <p className="text-[10px] text-white/70">
                    {isOpen ? t("home.whatsapp.chat.status") : t("home.whatsapp.chat.statusAway")}
                  </p>
                </div>
                <WhatsAppGlyph className="ms-auto h-4 w-4 text-white/60" />
              </div>

              <div className="space-y-2.5 bg-[#efe7de] px-3.5 py-4">
                <div className="nazra-bubble ms-auto max-w-[78%] rounded-lg rounded-se-none bg-[#d9fdd3] px-3 py-2">
                  <p className="text-[11px] leading-5 text-stone-800">
                    {t("home.whatsapp.chat.customer")}
                  </p>
                  <span className="mt-1 flex items-center justify-end gap-1 text-[9px] text-stone-500">
                    10:24 <CheckCheck className="h-3 w-3 text-[#34b7f1]" />
                  </span>
                </div>

                <div
                  className="nazra-bubble max-w-[82%] rounded-lg rounded-ss-none bg-white px-3 py-2"
                  style={{ animationDelay: "0.35s" }}
                >
                  <p className="text-[11px] leading-5 text-stone-800">
                    {t("home.whatsapp.chat.agent")}
                  </p>
                  <span className="mt-1 block text-end text-[9px] text-stone-400">10:25</span>
                </div>

                <div
                  className="nazra-bubble inline-flex items-center gap-1 rounded-lg rounded-ss-none bg-white px-3 py-2.5"
                  style={{ animationDelay: "0.7s" }}
                >
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="nazra-typing h-1.5 w-1.5 rounded-full bg-stone-400"
                      style={{ animationDelay: `${dot * 0.18}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
