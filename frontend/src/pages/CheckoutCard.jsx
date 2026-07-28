import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { createMyOrder } from "../api/api";
import { useCard } from "../context/CardContext";
import OrderConfirmationUpsell from "./OrderConfirmationUpsell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, normalizeSwatch } from "../components/store/storeUtils";

const getVariant = (item) => item?.colors?.[0] || {};
const getVariantId = (item) => getVariant(item)?._id || getVariant(item)?.id || getVariant(item)?.name || "";
const getLensOptionId = (item) =>
  item?.lensOptionId ||
  item?.lensOption?._id ||
  item?.lensOption?.id ||
  item?.selectedVariant?.lensOptionId ||
  "";
const getCartItemKey = (item) => `${item?._id || item?.id || "unknown"}-${getVariantId(item)}-${getLensOptionId(item)}`;
const createIdempotencyKey = () =>
  globalThis.crypto?.randomUUID?.() || `nazra-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const checkoutFields = [
  { name: "fullName", labelKey: "checkout.fullName", autoComplete: "name", type: "text" },
  { name: "email", labelKey: "checkout.email", autoComplete: "email", type: "email" },
  { name: "phone", labelKey: "checkout.phone", autoComplete: "tel", type: "tel" },
  { name: "adresse", labelKey: "checkout.address", autoComplete: "street-address", type: "text" },
];

const getImage = (item) =>
  getVariant(item)?.images?.[0]?.url ||
  item?.selectedVariant?.images?.[0]?.url ||
  "/fall-back-sunglasses-image.webp";

function CheckoutLineItem({
  item,
  checked,
  disabled,
  onSelect,
  onRemove,
  onQuantityChange,
}) {
  const { t, i18n } = useTranslation();
  const variant = getVariant(item);
  const quantity = Math.max(1, Number(item?.quantity) || 1);
  const price = Number(item?.sale_price) || 0;
  const lensName = item?.lensOption?.name || item?.selectedVariant?.lensName;

  return (
    <article className={`grid gap-4 rounded-lg border bg-white p-3 transition sm:grid-cols-[124px_1fr] ${checked ? "border-black shadow-sm" : "border-stone-200"}`}>
      <div className="relative overflow-hidden rounded-md bg-[#f4f0ea]">
        <Link to={`/product/${item?.slug}`}>
          <img
            src={getImage(item)}
            alt={item?.name || "NAZRA"}
            width="248"
            height="248"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/fall-back-sunglasses-image.webp";
            }}
            className="aspect-square w-full object-cover"
          />
        </Link>
        <label className="absolute start-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm">
          <input
            type="checkbox"
            checked={checked}
            onChange={onSelect}
            disabled={disabled}
            aria-label={`${t("checkoutPage.selectItem")} ${item?.name}`}
            className="h-4 w-4 accent-black"
          />
        </label>
      </div>

      <div className="min-w-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              to={`/product/${item?.slug}`}
              className="font-display text-sm font-bold uppercase tracking-wide hover:underline"
            >
              {item?.name}
            </Link>
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
          </div>
          <div className="text-start sm:text-end">
            <p className="text-xs text-stone-500">{t("cart.subtotal")}</p>
            <strong>{formatPrice(price * quantity, i18n.language)}</strong>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex h-10 items-center rounded-md border border-stone-300">
            <button
              type="button"
              disabled={disabled || quantity <= 1}
              onClick={() => onQuantityChange(quantity - 1)}
              className="grid h-10 w-10 place-items-center transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t("cart.decrease")}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold">{quantity}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onQuantityChange(quantity + 1)}
              className="grid h-10 w-10 place-items-center transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t("cart.increase")}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-xs font-semibold text-stone-500 transition hover:bg-stone-100 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t("cart.remove")}
          </button>
        </div>
      </div>
    </article>
  );
}

function CheckoutCard() {
  const { t, i18n } = useTranslation();
  const { cardItems, removeFromCard, updateQuantity } = useCard();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    adresse: "",
  });
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const submittingRef = useRef(false);
  const idempotencyKeyRef = useRef(null);

  useEffect(() => {
    document.title = `${t("checkout.title")} - Nazra`;
  }, [t]);

  useEffect(() => {
    const availableKeys = new Set(cardItems.map(getCartItemKey));
    setSelectedKeys((current) => {
      const available = current.filter((key) => availableKeys.has(key));
      return available.length === current.length ? current : available;
    });
  }, [cardItems]);

  const selectedItems = useMemo(
    () => cardItems.filter((item) => selectedKeys.includes(getCartItemKey(item))),
    [cardItems, selectedKeys],
  );

  const totals = useMemo(() => {
    const allItems = cardItems.reduce((sum, item) => sum + (Number(item?.sale_price) || 0) * (Number(item?.quantity) || 1), 0);
    const selected = selectedItems.reduce((sum, item) => sum + (Number(item?.sale_price) || 0) * (Number(item?.quantity) || 1), 0);
    const itemCount = selectedItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
    return { allItems, selected, itemCount };
  }, [cardItems, selectedItems]);

  const allSelected = cardItems.length > 0 && selectedKeys.length === cardItems.length;

  const handleChange = (event) => {
    const { name, value } = event.target;
    idempotencyKeyRef.current = null;
    setSubmitError("");
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const toggleSelect = (item) => {
    if (loading) return;
    idempotencyKeyRef.current = null;
    const key = getCartItemKey(item);
    setSelectedKeys((current) =>
      current.includes(key) ? current.filter((selected) => selected !== key) : [...current, key],
    );
  };

  const toggleSelectAll = () => {
    if (loading) return;
    idempotencyKeyRef.current = null;
    setSelectedKeys(allSelected ? [] : cardItems.map(getCartItemKey));
  };

  const removeCartItem = (item) => {
    idempotencyKeyRef.current = null;
    const key = getCartItemKey(item);
    removeFromCard(item?._id, getVariantId(item), getLensOptionId(item));
    setSelectedKeys((current) => current.filter((selected) => selected !== key));
    toast.success(t("cart.removeItem"));
  };

  const changeQuantity = (item, nextQuantity) => {
    idempotencyKeyRef.current = null;
    updateQuantity(item?._id, Math.max(1, nextQuantity), getVariantId(item), getLensOptionId(item));
  };

  const clearCheckoutList = (items) => {
    items.forEach((item) => removeFromCard(item?._id, getVariantId(item), getLensOptionId(item)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (selectedItems.length === 0) {
      toast.error(t("checkoutPage.selectAtLeastMsg"));
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    setSubmitError("");
    const submittedItems = [...selectedItems];
    const order = {
      products: submittedItems.map((item) => ({
        product: item._id,
        color: getVariantId(item),
        ...(getLensOptionId(item) ? { lensOption: getLensOptionId(item) } : {}),
        quantity: Math.max(1, Number(item.quantity) || 1),
      })),
      customer: formData,
    };

    try {
      const idempotencyKey = idempotencyKeyRef.current || createIdempotencyKey();
      idempotencyKeyRef.current = idempotencyKey;
      const response = await createMyOrder(order, idempotencyKey);
      const createdOrder = response?.data?.order;
      if (!createdOrder?._id) {
        throw new Error(t("checkoutPage.missingConfirmation"));
      }

      clearCheckoutList(submittedItems);
      setSelectedKeys([]);
      setFormData({ fullName: "", email: "", phone: "", adresse: "" });
      setConfirmedOrder(createdOrder);
      idempotencyKeyRef.current = null;
      toast.success(t("checkout.formSubmitted"));
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error.message ||
        t("checkoutPage.submitError");
      setSubmitError(message);
      toast.error(message);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  if (confirmedOrder) {
    return (
      <main className="min-h-screen bg-[#fbfaf7]">
        <section className="nazra-container py-12">
          <div className="mx-auto max-w-4xl rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold uppercase tracking-normal sm:text-5xl">
              {t("checkoutPage.successTitle")}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600">
              {t("checkoutPage.successCopy", { id: confirmedOrder._id })}
            </p>
            <div className="mt-8 text-start">
              <OrderConfirmationUpsell orderId={confirmedOrder._id} />
            </div>
            <Button asChild variant="outline" className="mt-8 min-h-11 rounded-sm">
              <Link to="/store/products">{t("cart.continueShopping")}</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (cardItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#fbfaf7]">
        <section className="nazra-container flex min-h-[72vh] items-center justify-center py-16">
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-stone-200 bg-white">
              <ShoppingBag className="h-9 w-9 text-stone-500" aria-hidden="true" />
            </span>
            <p className="mt-6 nazra-eyebrow">{t("checkoutPage.eyebrow")}</p>
            <h1 className="mt-3 nazra-heading text-3xl sm:text-5xl">{t("cart.empty")}</h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-stone-600">
              {t("cart.emptyHint")}
            </p>
            <Button asChild className="mt-7 min-h-11 rounded-sm bg-black px-6 text-white hover:bg-stone-800">
              <Link to="/store/products">{t("cart.continueShopping")}</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <section className="nazra-container py-10 sm:py-14">
        <div className="flex flex-col gap-5 border-b border-stone-200 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="nazra-eyebrow">{t("checkoutPage.eyebrow")}</p>
            <h1 className="mt-3 nazra-heading text-3xl sm:text-5xl">{t("checkout.title")}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              {t("checkoutPage.description")}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[360px]">
            <CheckoutStat icon={ShoppingBag} value={cardItems.length} label={t("checkoutPage.items")} />
            <CheckoutStat icon={PackageCheck} value={totals.itemCount} label={t("checkoutPage.selected")} />
            <CheckoutStat icon={Truck} value={formatPrice(totals.allItems, i18n.language)} label={t("cart.total")} />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <section aria-labelledby="cart-items-title" className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="cart-items-title" className="font-display text-sm font-bold uppercase tracking-wide">
                  {t("checkoutPage.reviewItems")}
                </h2>
                <p className="mt-1 text-sm text-stone-600">
                  {t("checkoutPage.selectedSummary", { count: selectedItems.length })}
                </p>
              </div>
              <label className="inline-flex min-h-10 items-center gap-2 rounded-md border border-stone-300 px-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  disabled={loading}
                  className="h-4 w-4 accent-black"
                />
                {t("checkoutPage.selectAll")}
              </label>
            </div>

            <div className="space-y-3">
              {cardItems.map((item) => {
                const key = getCartItemKey(item);
                return (
                  <CheckoutLineItem
                    key={key}
                    item={item}
                    checked={selectedKeys.includes(key)}
                    disabled={loading}
                    onSelect={() => toggleSelect(item)}
                    onRemove={() => removeCartItem(item)}
                    onQuantityChange={(nextQuantity) => changeQuantity(item, nextQuantity)}
                  />
                );
              })}
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-sm font-bold uppercase tracking-wide">
                    {t("checkoutPage.orderSummary")}
                  </h2>
                  <p className="mt-1 text-xs text-stone-500">{t("cart.shippingNote")}</p>
                </div>
                <ShieldCheck className="h-5 w-5 text-[#906941]" aria-hidden="true" />
              </div>

              <div className="mt-5 space-y-3 border-y border-stone-200 py-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-stone-500">{t("checkoutPage.selected")}</span>
                  <span>{totals.itemCount}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-stone-500">{t("cart.subtotal")}</span>
                  <strong>{formatPrice(totals.selected, i18n.language)}</strong>
                </div>
              </div>

              {submitError && (
                <div role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {submitError}
                </div>
              )}

              <form className="mt-5 space-y-4" onSubmit={handleSubmit} aria-busy={loading}>
                {checkoutFields.map((field) => (
                  <div key={field.name} className="space-y-1.5">
                    <label htmlFor={`checkout-${field.name}`} className="text-xs font-bold uppercase tracking-wide text-stone-600">
                      {t(field.labelKey)}
                    </label>
                    <Input
                      id={`checkout-${field.name}`}
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={t(field.labelKey)}
                      autoComplete={field.autoComplete}
                      disabled={loading}
                      required
                      className="min-h-11 rounded-sm border-stone-300 bg-[#fbfaf7]"
                    />
                  </div>
                ))}
                <Button
                  type="submit"
                  className="min-h-12 w-full rounded-sm bg-black text-white hover:bg-stone-800"
                  disabled={loading || selectedItems.length === 0}
                >
                  {loading ? t("cart.sending") : t("checkout.submit")}
                </Button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function CheckoutStat({ icon, value, label }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3">
      {React.createElement(icon, { className: "mx-auto h-4 w-4 text-[#906941]", "aria-hidden": true })}
      <p className="mt-2 truncate text-sm font-bold">{value}</p>
      <p className="mt-1 truncate text-[10px] uppercase tracking-wide text-stone-500">{label}</p>
    </div>
  );
}

export default CheckoutCard;
