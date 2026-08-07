import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BadgeCheck, Quote, Star } from "lucide-react";
import { CUSTOMER_REVIEWS, localizeReview } from "../../constant/customerReviews";

/**
 * Customer review wall — two counter-scrolling infinite marquees.
 *
 * Notes:
 * - Content comes from `constant/customerReviews.js` (placeholder copy).
 *   It is deliberately NOT wired into Product/AggregateRating JSON-LD.
 * - Each track renders its list twice and translates by -50%, which makes the
 *   loop seamless with no JS running per frame.
 * - Animation only starts once the section is on screen, and stops entirely
 *   under `prefers-reduced-motion` (the track becomes a normal scroller).
 */

function Stars({ rating, label }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`h-3.5 w-3.5 ${value <= rating ? "fill-[#c79a63] text-[#c79a63]" : "fill-none text-stone-300"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, starLabel, verifiedLabel }) {
  return (
    <article className="group relative flex w-[82vw] shrink-0 flex-col justify-between rounded-sm border border-stone-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_12px_32px_-18px_rgba(0,0,0,.35)] sm:w-[360px]">
      <Quote
        className="absolute end-4 top-4 h-7 w-7 text-stone-100 transition duration-300 group-hover:text-[#c79a63]/30"
        aria-hidden="true"
      />

      <div>
        <Stars rating={review.rating} label={starLabel} />
        <p className="mt-3 text-sm leading-6 text-stone-700">{review.text}</p>
      </div>

      <footer className="mt-5 flex items-center gap-3 border-t border-stone-100 pt-4">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f4ede3] font-display text-xs font-bold text-[#906941]"
          aria-hidden="true"
        >
          {review.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-xs font-bold uppercase tracking-wide">{review.name}</p>
          <p className="truncate text-[11px] text-stone-500">
            {review.city} · {review.product}
          </p>
        </div>
        <span
          className="ms-auto inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700"
          title={verifiedLabel}
        >
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">{verifiedLabel}</span>
        </span>
      </footer>
    </article>
  );
}

function MarqueeRow({ reviews, reverse, duration, active, starLabel, verifiedLabel }) {
  return (
    <div className="nazra-reviews-marquee">
      <div
        className={`nazra-reviews-marquee__track${reverse ? " nazra-reviews-marquee__track--reverse" : ""}`}
        style={{
          animationDuration: `${duration}s`,
          animationPlayState: active ? "running" : "paused",
        }}
      >
        {[0, 1].map((pass) =>
          reviews.map((review) => (
            <ReviewCard
              key={`${pass}-${review.id}`}
              review={review}
              starLabel={starLabel}
              verifiedLabel={verifiedLabel}
            />
          )),
        )}
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef(null);
  const [active, setActive] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const language = i18n.resolvedLanguage || i18n.language;

  const reviews = useMemo(
    () => CUSTOMER_REVIEWS.map((review) => localizeReview(review, language?.split("-")[0])),
    [language],
  );

  const rows = useMemo(() => {
    const half = Math.ceil(reviews.length / 2);
    return [reviews.slice(0, half), reviews.slice(half)];
  }, [reviews]);

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  // Only animate while visible: saves CPU and keeps scrolling smooth on mobile.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") {
      setActive(true);
      setRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setActive(entry.isIntersecting);
        if (entry.isIntersecting) setRevealed(true);
      },
      { rootMargin: "150px 0px", threshold: 0.05 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const starLabel = t("home.reviews.starLabel", { rating: 5 });
  const verifiedLabel = t("home.reviews.verified");

  return (
    <section
      ref={sectionRef}
      className="nazra-section overflow-hidden bg-[#fcfaf7]"
      aria-labelledby="reviews-title"
    >
      <div className="nazra-container">
        <div
          className={`flex flex-col gap-5 md:flex-row md:items-end md:justify-between ${
            revealed ? "nazra-reveal" : "opacity-0"
          }`}
        >
          <div>
            <p className="nazra-eyebrow">{t("home.reviews.eyebrow")}</p>
            <h2 id="reviews-title" className="nazra-heading max-w-lg">
              {t("home.reviews.title")}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-stone-600">
              {t("home.reviews.copy")}
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-sm border border-stone-200 bg-white px-4 py-3">
            <div>
              <p className="font-display text-3xl font-semibold leading-none">
                {average.toLocaleString(language, { minimumFractionDigits: 1 })}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">
                {t("home.reviews.outOf")}
              </p>
            </div>
            <div className="border-s border-stone-200 ps-4">
              <Stars rating={Math.round(average)} label={starLabel} />
              <p className="mt-1.5 text-[11px] text-stone-500">
                {t("home.reviews.basedOn", { count: reviews.length })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full-bleed marquees so cards run edge to edge */}
      <div
        className={`mt-8 space-y-4 ${revealed ? "nazra-reveal nazra-reveal--delayed" : "opacity-0"}`}
      >
        {rows.map((row, index) => (
          <MarqueeRow
            key={index}
            reviews={row}
            reverse={index === 1}
            duration={index === 0 ? 68 : 82}
            active={active}
            starLabel={starLabel}
            verifiedLabel={verifiedLabel}
          />
        ))}
      </div>

      <div className="nazra-container mt-8 text-center">
        <Link
          to="/store/products"
          className="nazra-button bg-black text-white hover:bg-stone-800"
        >
          {t("home.reviews.cta")}
        </Link>
        <p className="mt-3 text-[11px] text-stone-500">{t("home.reviews.disclaimer")}</p>
      </div>
    </section>
  );
}
