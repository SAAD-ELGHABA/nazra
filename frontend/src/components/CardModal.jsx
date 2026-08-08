import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCard } from "../context/CardContext";
import { estimateDeliveryFee } from "../config/delivery";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { formatPrice, normalizeSwatch } from "./store/storeUtils";

const getVariant = (item) => item?.colors?.[0] || {};
const getVariantId = (item) => getVariant(item)?._id || getVariant(item)?.id || getVariant(item)?.name || "";
const getLensId = (item) =>
  item?.lensOptionId ||
  item?.lensOption?._id ||
  item?.lensOption?.id ||
  item?.selectedVariant?.lensOptionId ||
  "";
const getItemKey = (item) => `${item?._id || item?.id || "item"}-${getVariantId(item)}-${getLensId(item)}`;
const getImage = (item) =>
  getVariant(item)?.images?.[0]?.url ||
  item?.selectedVariant?.images?.[0]?.url ||
  "/fall-back-sunglasses-image.webp";

function CartLineItem({ item, onClose }) {
  const { t, i18n } = useTranslation();
  const { updateQuantity, removeFromCard } = useCard();
  const variant = getVariant(item);
  const quantity = Math.max(1, Number(item?.quantity) || 1);
  const price = Number(item?.sale_price) || 0;
  const lensName = item?.lensOption?.name || item?.selectedVariant?.lensName;

  return (
    <li className="grid grid-cols-[88px_1fr] gap-3 border-b border-stone-200 py-4 last:border-b-0">
      <Link
        to={`/product/${item?.slug}`}
        onClick={onClose}
        className="block overflow-hidden rounded-md bg-[#f4f0ea]"
      >
        <img
          src={getImage(item)}
          alt={item?.name || "NAZRA"}
          width="176"
          height="176"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/fall-back-sunglasses-image.webp";
          }}
          className="aspect-square h-full w-full object-cover"
        />
      </Link>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/product/${item?.slug}`}
            onClick={onClose}
            className="font-display text-xs font-bold uppercase tracking-wide text-stone-950 hover:underline"
          >
            {item?.name}
          </Link>
          <strong className="shrink-0 text-sm">{formatPrice(price * quantity, i18n.language)}</strong>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-500">
          {variant?.name && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-full border border-stone-300"
                style={{ backgroundColor: normalizeSwatch(variant?.value || variant?.name) }}
                aria-hidden="true"
              />
              {variant.name}
            </span>
          )}
          {lensName && <span>{lensName}</span>}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="inline-flex h-10 items-center rounded-md border border-stone-300">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={quantity <= 1}
              onClick={() => updateQuantity(item?._id, quantity - 1, getVariantId(item), getLensId(item))}
              aria-label={t("cart.decrease")}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold">{quantity}</span>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center text-stone-700 transition hover:bg-stone-100"
              onClick={() => updateQuantity(item?._id, quantity + 1, getVariantId(item), getLensId(item))}
              aria-label={t("cart.increase")}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-stone-500 transition hover:bg-stone-100 hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            onClick={() => removeFromCard(item?._id, getVariantId(item), getLensId(item))}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t("cart.remove")}
          </button>
        </div>
      </div>
    </li>
  );
}

function CardModal({ isOpen, onClose }) {
  const { cardItems } = useCard();
  const { t, i18n } = useTranslation();
  const itemCount = cardItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
  const total = useMemo(
    () => cardItems.reduce((sum, item) => sum + (Number(item?.sale_price) || 0) * (Number(item?.quantity) || 1), 0),
    [cardItems],
  );
  // Display only; the server prices delivery on the real order.
  const deliveryFee = estimateDeliveryFee(total);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={i18n.dir() === "rtl" ? "left" : "right"}
        className="w-full gap-0 border-stone-200 bg-[#fbfaf7] p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-stone-200 bg-white p-5 pe-12 text-start">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#906941]">
            NAZRA
          </p>
          <SheetTitle className="font-display text-2xl uppercase tracking-normal">
            {t("cart.yourCart")}
          </SheetTitle>
          <SheetDescription>
            {itemCount > 0 ? t("cart.drawerSummary", { count: itemCount }) : t("cart.emptyHint")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5">
          {cardItems.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-stone-100">
                <ShoppingBag className="h-7 w-7 text-stone-500" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold uppercase tracking-normal">
                {t("cart.empty")}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-stone-600">
                {t("cart.emptyHint")}
              </p>
              <Button asChild className="mt-6 min-h-11 rounded-sm bg-black px-5 text-white hover:bg-stone-800">
                <Link to="/store/products" onClick={onClose}>
                  {t("cart.continueShopping")}
                </Link>
              </Button>
            </div>
          ) : (
            <ul>
              {cardItems.map((item) => (
                <CartLineItem key={getItemKey(item)} item={item} onClose={onClose} />
              ))}
            </ul>
          )}
        </div>

        {cardItems.length > 0 && (
          <SheetFooter className="border-t border-stone-200 bg-white p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-stone-500">{t("cart.subtotal")}</span>
                <span>{formatPrice(total, i18n.language)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-stone-500">{t("checkoutPage.delivery")}</span>
                {deliveryFee > 0 ? (
                  <span>{formatPrice(deliveryFee, i18n.language)}</span>
                ) : (
                  <span className="font-semibold text-emerald-700">{t("checkoutPage.deliveryFree")}</span>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-stone-700">{t("checkoutPage.totalToPay")}</span>
                <strong className="text-lg">{formatPrice(total + deliveryFee, i18n.language)}</strong>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button asChild variant="outline" className="min-h-11 rounded-sm">
                <Link to="/store/products" onClick={onClose}>
                  {t("cart.continueShopping")}
                </Link>
              </Button>
              <Button asChild className="min-h-11 rounded-sm bg-black text-white hover:bg-stone-800">
                <Link to="/checkout-card" onClick={onClose}>
                  {t("cart.checkout")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CardModal;
