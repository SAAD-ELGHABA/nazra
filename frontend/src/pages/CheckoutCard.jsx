import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCard } from "../context/CardContext";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createMyOrder } from "../api/api";
import OrderConfirmationUpsell from "./OrderConfirmationUpsell";

const getVariant = (item) => item?.colors?.[0] || {};
const getVariantId = (item) => getVariant(item)?._id || getVariant(item)?.name || "";
const getLensOptionId = (item) => item?.lensOptionId || item?.lensOption?._id || item?.lensOption?.id || item?.selectedVariant?.lensOptionId || "";
const getCartItemKey = (item) => `${item?._id || "unknown"}-${getVariantId(item)}-${getLensOptionId(item)}`;
const createIdempotencyKey = () => globalThis.crypto?.randomUUID?.() || `nazra-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function CheckoutCard() {
  const { t } = useTranslation();
  const { cardItems, removeFromCard } = useCard();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    adresse: "",
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const submittingRef = useRef(false);
  const idempotencyKeyRef = useRef(null);

  useEffect(() => {
    const availableKeys = new Set(cardItems.map(getCartItemKey));
    setSelectedItems((current) => {
      const available = current.filter((item) => availableKeys.has(item.key));
      return available.length === current.length ? current : available;
    });
  }, [cardItems]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    idempotencyKeyRef.current = null;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const toggleSelect = (item) => {
    if (loading) return;
    idempotencyKeyRef.current = null;
    const key = getCartItemKey(item);
    setSelectedItems((current) =>
      current.some((selected) => selected.key === key)
        ? current.filter((selected) => selected.key !== key)
        : [...current, { ...item, key, color: getVariantId(item) }]
    );
  };

  const toggleSelectAll = () => {
    if (loading) return;
    idempotencyKeyRef.current = null;
    if (selectedItems.length === cardItems.length) {
      setSelectedItems([]);
      return;
    }
    setSelectedItems(cardItems.map((item) => ({
      ...item,
      key: getCartItemKey(item),
      color: getVariantId(item),
    })));
  };

  const removeCartItem = (item) => {
    idempotencyKeyRef.current = null;
    const key = getCartItemKey(item);
    removeFromCard(item?._id, getVariantId(item), getLensOptionId(item));
    setSelectedItems((current) => current.filter((selected) => selected.key !== key));
    toast.success(t("cart.removeItem"));
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
    const submittedItems = [...selectedItems];
    const order = {
      products: submittedItems.map((item) => ({
        product: item._id,
        color: item.color,
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
        throw new Error("The order was created without a confirmation number.");
      }

      clearCheckoutList(submittedItems);
      setSelectedItems([]);
      setFormData({ fullName: "", email: "", phone: "", adresse: "" });
      setConfirmedOrder(createdOrder);
      idempotencyKeyRef.current = null;
      toast.success(t("checkout.formSubmitted"));
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error.message ||
          "Unable to place your order."
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const total = selectedItems.reduce(
    (sum, item) => sum + (Number(item.sale_price) || 0) * (Number(item.quantity) || 1),
    0
  );

  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-md sm:p-8">
          <h1 className="mb-4 text-center text-3xl font-light text-green-700 sm:text-5xl">
            Order Placed Successfully!
          </h1>
          <p className="mb-8 text-center text-lg text-gray-700 sm:text-xl">
            Your order #{confirmedOrder._id} is confirmed and will ship soon.
          </p>
          <OrderConfirmationUpsell orderId={confirmedOrder._id} />
          <div className="mt-8 text-center">
            <Link
              to="/store/products"
              className="inline-flex min-h-11 items-center justify-center rounded border border-black px-5 text-sm hover:bg-black hover:text-white"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="mb-6 text-start text-2xl font-bold">{t("checkout.title")}</h2>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-[2] overflow-x-auto rounded-lg bg-white p-4 shadow-md">
          {cardItems.length === 0 ? (
            <p className="text-center">{t("cart.empty")}</p>
          ) : (
            <table className="min-w-[700px] w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-gray-300 p-2 text-center">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={cardItems.length > 0 && selectedItems.length === cardItems.length}
                      disabled={loading}
                      aria-label="Select all cart items"
                      className="h-4 w-4 cursor-pointer accent-black"
                    />
                  </th>
                  <th className="border-b border-gray-300 p-2 text-left">{t("cart.item")}</th>
                  <th className="border-b border-gray-300 p-2 text-center">{t("cart.quantity")}</th>
                  <th className="border-b border-gray-300 p-2 text-center">{t("cart.price")}</th>
                  <th className="border-b border-gray-300 p-2 text-center">{t("cart.total")}</th>
                  <th className="border-b border-gray-300 p-2 text-center"><span className="sr-only">{t("cart.removeItem")}</span></th>
                </tr>
              </thead>
              <tbody>
                {cardItems.map((item) => {
                  const key = getCartItemKey(item);
                  const variant = getVariant(item);
                  const isChecked = selectedItems.some((selected) => selected.key === key);
                  const unitPrice = Number(item.sale_price) || 0;
                  const quantity = Number(item.quantity) || 1;

                  return (
                    <tr key={key} className="text-center">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(item)}
                          disabled={loading}
                          aria-label={`Select ${item.name}`}
                          className="h-4 w-4 cursor-pointer accent-black"
                        />
                      </td>
                      <td className="flex items-center gap-2 p-2 text-left">
                        <Link to={`/product/${item.slug}`}>
                          <img
                            src={variant?.images?.[0]?.url || ""}
                            alt={item?.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                        </Link>
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          {(item?.lensOption?.name || item?.selectedVariant?.lensName) && <span className="text-[10px] text-stone-500">{item?.lensOption?.name || item?.selectedVariant?.lensName}</span>}
                          <span
                            style={{ backgroundColor: variant?.value }}
                            className={`flex h-5 w-10 items-center justify-center rounded-full text-[8px] ${
                              variant?.name === "white" || variant?.name === "transparent"
                                ? "text-black"
                                : "text-white"
                            }`}
                            title={variant?.name}
                          />
                        </div>
                      </td>
                      <td className="p-2">{quantity}</td>
                      <td className="p-2">MAD {unitPrice.toFixed(2)}</td>
                      <td className="p-2 font-bold">MAD {(unitPrice * quantity).toFixed(2)}</td>
                      <td className="p-2 font-bold">
                        <button
                          type="button"
                          className="rounded p-2 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={loading}
                          aria-label={`${t("cart.removeItem")} ${item.name}`}
                          onClick={() => removeCartItem(item)}
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t border-gray-300 pt-4 text-center">
                <tr>
                  <td colSpan="4" className="pt-6 text-start font-bold">{t("cart.total")}:</td>
                  <td className="pt-6 font-bold">MAD {total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <div className="flex-1">
          <div className="sticky top-20 rounded-lg bg-white p-6 shadow-md">
            <form className="space-y-4" onSubmit={handleSubmit} aria-busy={loading}>
              {["fullName", "email", "phone", "adresse"].map((field) => (
                <div key={field} className="flex flex-col">
                  <label htmlFor={`checkout-${field}`} className="mb-1">{t(`checkout.${field}`)}</label>
                  <input
                    id={`checkout-${field}`}
                    type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder={t(`checkout.${field}`)}
                    className="rounded bg-gray-100 px-3 py-2 focus:outline-none"
                    required
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full rounded border bg-black py-2 text-white transition-colors duration-300 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                {loading ? t("cart.sending") || "Sending..." : t("checkout.submit")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutCard;
