import React, { useEffect, useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getProductReviews } from "../../api/api";

const ReviewsSkeleton = () => <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">{[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded border border-stone-200 bg-stone-100" />)}</div>;

export default function ProductReviews({ slug, rating, sectionRef }) {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: false, reviews: [], pagination: null });

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true, error: false }));
    getProductReviews(slug, { page, limit: 6 }, controller.signal)
      .then((response) => setState({ loading: false, error: false, reviews: response?.data?.reviews || [], pagination: response?.data?.pagination || null }))
      .catch((error) => {
        if (error?.code !== "ERR_CANCELED") setState({ loading: false, error: true, reviews: [], pagination: null });
      });
    return () => controller.abort();
  }, [slug, page]);

  const changePage = (next) => {
    setPage(next);
    requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const average = Number(rating?.average || 0);
  const count = Number(rating?.count || 0);
  return (
    <section ref={sectionRef} id="product-reviews" className="scroll-mt-28 min-w-0" aria-labelledby="reviews-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><h2 id="reviews-title" className="font-display text-xl font-semibold">{t("productDetails.reviewsTitle")}</h2>{count > 0 && <div className="mt-2 flex items-center gap-2 text-[10px]"><span className="text-2xl font-semibold">{average.toFixed(1)}</span><span><span className="flex text-[#d98213]">{[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-3 w-3 ${average >= value - .25 ? "fill-current" : ""}`} />)}</span><span className="mt-0.5 block text-stone-500">{t("productDetails.reviews", { count })}</span></span></div>}</div>
      </div>
      {state.loading ? <ReviewsSkeleton /> : state.error ? <div role="alert" className="rounded border border-red-200 bg-red-50 p-5 text-xs text-red-800">{t("productDetails.reviewError")}</div> : state.reviews.length === 0 ? <div className="rounded border border-stone-200 bg-[#faf8f4] p-7 text-center"><Star className="mx-auto h-6 w-6 text-stone-400" /><h3 className="mt-3 font-display text-base font-semibold">{t("productDetails.reviewsEmptyTitle")}</h3><p className="mt-1 text-xs text-stone-500">{t("productDetails.reviewsEmptyCopy")}</p></div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{state.reviews.map((review) => {
        const initial = String(review.displayName || "N").trim().charAt(0).toUpperCase();
        return <article key={review.id} className="min-h-36 rounded-[5px] border border-stone-200 bg-white p-4"><header className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e9dfd1] text-[11px] font-semibold" aria-hidden="true">{initial}</span><div><h3 className="text-[10px] font-semibold">{review.displayName}</h3>{review.verifiedPurchase && <span className="mt-0.5 inline-flex items-center gap-1 text-[8px] text-stone-500"><BadgeCheck className="h-3 w-3" />{t("productDetails.verified")}</span>}</div></header><div className="mt-2 flex text-[#d98213]" aria-label={t("productDetails.ratingOutOf", { rating: review.rating })}>{[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-3 w-3 ${Number(review.rating) >= value ? "fill-current" : ""}`} />)}</div>{review.title && <h4 className="mt-2 text-[10px] font-semibold">{review.title}</h4>}<p className="mt-1 text-[9px] leading-4 text-stone-600">{review.comment}</p><time dateTime={review.createdAt} className="mt-3 block text-[8px] text-stone-400">{new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(review.createdAt))}</time></article>;
      })}</div>}
      {state.pagination?.totalPages > 1 && <nav className="mt-4 flex items-center justify-end gap-2" aria-label={t("productDetails.reviewsTitle")}><button type="button" disabled={!state.pagination.hasPreviousPage || state.loading} onClick={() => changePage(page - 1)} className="inline-flex min-h-9 items-center gap-1 border border-stone-300 px-3 text-[9px] disabled:opacity-35"><ChevronLeft className="h-3 w-3 rtl:rotate-180" />{t("productDetails.previous")}</button><span className="text-[9px] text-stone-500">{page} / {state.pagination.totalPages}</span><button type="button" disabled={!state.pagination.hasNextPage || state.loading} onClick={() => changePage(page + 1)} className="inline-flex min-h-9 items-center gap-1 border border-stone-300 px-3 text-[9px] disabled:opacity-35">{t("productDetails.next")}<ChevronRight className="h-3 w-3 rtl:rotate-180" /></button></nav>}
    </section>
  );
}
