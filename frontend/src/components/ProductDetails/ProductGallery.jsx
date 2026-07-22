import React, { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const FALLBACK = "/fall-back-sunglasses-image.webp";

export default function ProductGallery({ name, images, badge }) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const touchStart = useRef(null);
  const gallery = images.length ? images : [{ url: FALLBACK, alt: name }];
  const go = (next) => setCurrent((value) => (value + next + gallery.length) % gallery.length);

  useEffect(() => setCurrent(0), [images]);

  const handleTouchEnd = (event) => {
    if (touchStart.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 45 && gallery.length > 1) go(delta < 0 ? 1 : -1);
    touchStart.current = null;
  };

  const renderImage = (image, eager = false) => (
    <img
      src={image?.url || FALLBACK}
      alt={image?.alt || t("productDetails.image", { number: current + 1, name })}
      width="900"
      height="690"
      loading={eager ? "eager" : "lazy"}
      fetchpriority={eager ? "high" : undefined}
      onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK; }}
      className="h-full w-full object-contain"
    />
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <section className="grid min-w-0 gap-3 sm:grid-cols-[76px_minmax(0,1fr)] lg:grid-cols-[82px_minmax(0,1fr)]" aria-label={t("productDetails.gallery", { name })}>
        <div className="order-2 flex snap-x gap-2 overflow-x-auto pb-1 sm:order-1 sm:max-h-[535px] sm:flex-col sm:overflow-y-auto sm:pb-0">
          {gallery.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={t("productDetails.image", { number: index + 1, name })}
              aria-current={index === current ? "true" : undefined}
              className={`h-[72px] w-[72px] shrink-0 snap-start overflow-hidden rounded-[5px] bg-[#f4efe8] p-0.5 transition sm:h-[82px] sm:w-[76px] ${index === current ? "ring-1 ring-[#9a7447] ring-offset-1" : "ring-1 ring-stone-200 hover:ring-stone-500"}`}
            >
              <img src={image?.url || FALLBACK} alt="" width="152" height="164" loading={index < 4 ? "eager" : "lazy"} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK; }} />
            </button>
          ))}
        </div>

        <div
          className="relative order-1 aspect-[1.23/1] min-w-0 touch-pan-y overflow-hidden rounded-[6px] bg-[#f4efe8] sm:order-2 sm:aspect-auto sm:h-[535px]"
          onTouchStart={(event) => { touchStart.current = event.changedTouches[0].clientX; }}
          onTouchEnd={handleTouchEnd}
        >
          {renderImage(gallery[current], true)}
          {badge && <span className="absolute start-4 top-4 rounded-[3px] bg-[#ead7b8] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-[#3e2d1b]">{badge}</span>}
          <Dialog.Trigger asChild>
            <button type="button" className="absolute bottom-4 end-4 grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white/95 shadow-sm transition hover:scale-105" aria-label={t("productDetails.zoom")}><Search className="h-4 w-4" /></button>
          </Dialog.Trigger>
          {gallery.length > 1 && <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 sm:hidden" aria-hidden="true">{gallery.map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${index === current ? "w-5 bg-black" : "w-1.5 bg-black/30"}`} />)}</div>}
        </div>
      </section>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") go(-1);
            if (event.key === "ArrowRight") go(1);
          }}
          className="fixed inset-3 z-[101] flex items-center justify-center rounded-sm bg-[#f8f6f2] p-4 outline-none sm:inset-8"
        >
          <Dialog.Title className="sr-only">{t("productDetails.zoomTitle", { name })}</Dialog.Title>
          <div className="h-full w-full">{renderImage(gallery[current], true)}</div>
          <Dialog.Close className="absolute end-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white shadow" aria-label={t("productDetails.close")}><X /></Dialog.Close>
          {gallery.length > 1 && <>
            <button type="button" onClick={() => go(-1)} className="absolute start-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow" aria-label={t("productDetails.previousImage")}><ChevronLeft className="rtl:rotate-180" /></button>
            <button type="button" onClick={() => go(1)} className="absolute end-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow" aria-label={t("productDetails.nextImage")}><ChevronRight className="rtl:rotate-180" /></button>
          </>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
