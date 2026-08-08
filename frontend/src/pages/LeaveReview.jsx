import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2, LoaderCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { getReviewInvitation, submitProductReview } from "../api/api";
import { useNoIndex } from "../hooks/usePageSeo";

const MIN_COMMENT = 10;
const MAX_COMMENT = 2000;

/** Accessible star input: a radio group, so it works by keyboard and screen reader. */
function RatingInput({ value, onChange, disabled }) {
  const { t } = useTranslation();
  return (
    <fieldset className="border-0 p-0" disabled={disabled}>
      <legend className="text-xs font-bold uppercase tracking-wide text-stone-600">
        {t("review.ratingLabel")}
      </legend>
      <div className="mt-2 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <label key={score} className="cursor-pointer p-1" title={t("review.starLabel", { count: score })}>
            <input
              type="radio"
              name="rating"
              value={score}
              checked={value === score}
              onChange={() => onChange(score)}
              className="sr-only peer"
            />
            <Star
              size={30}
              aria-hidden="true"
              className={`transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 ${
                score <= value ? "fill-[#d8a12a] text-[#d8a12a]" : "text-stone-300"
              }`}
            />
            <span className="sr-only">{t("review.starLabel", { count: score })}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ReviewForm({ product, token, onDone }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (rating < 1) {
      setError(t("review.ratingRequired"));
      return;
    }
    if (comment.trim().length < MIN_COMMENT) {
      setError(t("review.commentTooShort", { count: MIN_COMMENT }));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await submitProductReview({
        token,
        productId: product.productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });
      toast.success(t("review.submitted"));
      onDone(product.productId);
    } catch (requestError) {
      const message = requestError?.response?.data?.message || t("review.submitError");
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} aria-busy={submitting} className="rounded-lg border border-stone-200 bg-white p-5">
      <div className="flex items-center gap-3">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt=""
            width="64"
            height="64"
            className="h-16 w-16 shrink-0 rounded object-cover"
          />
        )}
        <h2 className="font-display text-base font-semibold text-[#151515]">{product.name}</h2>
      </div>

      <div className="mt-4">
        <RatingInput value={rating} onChange={setRating} disabled={submitting} />
      </div>

      <div className="mt-4 space-y-1.5">
        <label htmlFor={`title-${product.productId}`} className="text-xs font-bold uppercase tracking-wide text-stone-600">
          {t("review.titleLabel")}
        </label>
        <input
          id={`title-${product.productId}`}
          type="text"
          value={title}
          maxLength={120}
          disabled={submitting}
          onChange={(event) => setTitle(event.target.value)}
          className="min-h-11 w-full rounded-sm border border-stone-300 bg-[#fbfaf7] px-3 text-sm"
        />
      </div>

      <div className="mt-4 space-y-1.5">
        <label htmlFor={`comment-${product.productId}`} className="text-xs font-bold uppercase tracking-wide text-stone-600">
          {t("review.commentLabel")}
        </label>
        <textarea
          id={`comment-${product.productId}`}
          rows={5}
          value={comment}
          maxLength={MAX_COMMENT}
          disabled={submitting}
          required
          onChange={(event) => setComment(event.target.value)}
          placeholder={t("review.commentPlaceholder")}
          className="w-full rounded-sm border border-stone-300 bg-[#fbfaf7] p-3 text-sm"
        />
        <p className="text-end text-[11px] text-stone-500">{comment.trim().length} / {MAX_COMMENT}</p>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="nazra-button mt-4 w-full bg-black text-white hover:bg-[#8d643d] disabled:opacity-60"
      >
        {submitting ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : t("review.submit")}
      </button>
    </form>
  );
}

/**
 * Guest review page, reached from the link emailed when an order is delivered.
 *
 * There is no login: the token in the URL is the proof of purchase, and the
 * server re-checks it on every submission. Never indexed — the URL is personal.
 */
export default function LeaveReview() {
  const { token } = useParams();
  const { t } = useTranslation();
  const [state, setState] = useState({ status: "loading", products: [], displayName: "", error: "" });

  useNoIndex(`${t("review.pageTitle")} | NAZRA`);

  useEffect(() => {
    const controller = new AbortController();
    getReviewInvitation(token, controller.signal)
      .then((response) => {
        setState({
          status: "ready",
          products: response?.data?.products || [],
          displayName: response?.data?.displayName || "",
          error: "",
        });
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED") return;
        setState({
          status: "error",
          products: [],
          displayName: "",
          error: error?.response?.data?.message || t("review.linkInvalid"),
        });
      });
    return () => controller.abort();
  }, [token, t]);

  const markReviewed = (productId) => {
    setState((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.productId === productId ? { ...product, alreadyReviewed: true } : product,
      ),
    }));
  };

  if (state.status === "loading") {
    return (
      <main className="nazra-container grid min-h-[60vh] place-items-center py-16" aria-busy="true">
        <LoaderCircle className="h-7 w-7 animate-spin text-stone-400" aria-label={t("review.loading")} />
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="nazra-container grid min-h-[60vh] place-items-center py-16 text-center">
        <div>
          <AlertCircle className="mx-auto h-8 w-8 text-stone-400" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-semibold">{t("review.linkInvalidTitle")}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">{state.error}</p>
          <Link to="/store/products" className="nazra-button mt-6 bg-black text-white hover:bg-[#8d643d]">
            {t("review.backToStore")}
          </Link>
        </div>
      </main>
    );
  }

  const pending = state.products.filter((product) => !product.alreadyReviewed);

  return (
    <main className="bg-[#fbfaf7]">
      <section className="nazra-container max-w-3xl py-10 sm:py-14">
        <p className="nazra-eyebrow">{t("review.eyebrow")}</p>
        <h1 className="mt-3 nazra-heading text-3xl sm:text-4xl">
          {state.displayName ? t("review.greeting", { name: state.displayName }) : t("review.pageTitle")}
        </h1>

        {pending.length === 0 ? (
          <div className="mt-8 rounded-lg border border-stone-200 bg-white p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden="true" />
            <h2 className="mt-4 font-display text-xl font-semibold">{t("review.allDoneTitle")}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">{t("review.allDoneCopy")}</p>
            <Link to="/store/products" className="nazra-button mt-6 bg-black text-white hover:bg-[#8d643d]">
              {t("review.backToStore")}
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{t("review.intro")}</p>
            <div className="mt-8 space-y-5">
              {pending.map((product) => (
                <ReviewForm key={product.productId} product={product} token={token} onDone={markReviewed} />
              ))}
            </div>
            <p className="mt-6 text-xs leading-5 text-stone-500">{t("review.moderationNote")}</p>
          </>
        )}
      </section>
    </main>
  );
}
