import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCard } from "../context/CardContext";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createMyOrder } from "../api/api";

function CheckoutCard() {
  const { t } = useTranslation();
  const { cardItems, removeFromCard } = useCard();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    adresse: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const order = {
      products: cardItems.map((item) => ({
        product: item._id,
        color: item.colors[0]?.name,
        quantity: item.quantity,
      })),
      customer: formData,
    };
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await createMyOrder(order);
      toast.success(`${t("checkout.formSubmitted")}`)
    } catch (error) {
      console.log(error);
    }
  };

  const total = cardItems.reduce(
    (sum, item) => sum + item.sale_price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h2 className="text-2xl font-bold text-start mb-6">
        {t("checkout.title")}
      </h2>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-[2] bg-white p-4 rounded-lg shadow-md overflow-x-auto">
          {cardItems.length === 0 ? (
            <p className="text-center">{t("cart.empty")}</p>
          ) : (
            <table className="w-full table-auto border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-2 border-b border-gray-300 text-left">
                    {t("cart.item")}
                  </th>
                  <th className="p-2 border-b border-gray-300 text-center">
                    {t("cart.quantity")}
                  </th>
                  <th className="p-2 border-b border-gray-300 text-center">
                    {t("cart.price")}
                  </th>
                  <th className="p-2 border-b border-gray-300 text-center">
                    {t("cart.total")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {cardItems.map((item) => (
                  <tr key={item.id} className="text-center">
                    <td className="p-2 flex items-center gap-2 text-left">
                      <Link to={`/product/${item.slug}`}>
                        <img
                          src={item?.colors[0]?.images[0]?.url || ""}
                          alt={item?.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </Link>
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span
                          key={item?.colors[0]?.name}
                          style={{ backgroundColor: item?.colors[0]?.value }}
                          className={`
                  w-10 h-5 rounded-full flex items-center justify-center
                  hover:border-black transition-colors duration-300
                  text-[8px]
                  ${
                    item?.colors[0]?.name === "white" ||
                    item?.colors[0]?.name === "transparent"
                      ? "text-black"
                      : "text-white"
                  }
                `}
                        >
                          {item?.colors[0]?.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">MAD {item.sale_price.toFixed(2)}</td>
                    <td className="p-2 font-bold">
                      MAD {(item.sale_price * item.quantity).toFixed(2)}
                    </td>
                    <td className="p-2 font-bold">
                      <button
                        className="p-2 hover:bg-gray-200 rounded"
                        onClick={() => {
                          removeFromCard(item?.id, item?.colors[0]?.name);
                          toast.success(t("cart.removeItem"));
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-center border-t border-gray-300 pt-4">
                <tr>
                  <td colSpan="3" className="text-start font-bold pt-6">
                    {t("cart.total")}:
                  </td>
                  <td className="font-bold pt-6">MAD {total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <div className="flex-1">
          <div className="sticky top-20 bg-white p-6 rounded-lg shadow-md">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {["fullName", "email", "phone", "adresse"].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="mb-1">{t(`checkout.${field}`)}</label>
                  <input
                    type={
                      field === "email"
                        ? "email"
                        : field === "phone"
                        ? "tel"
                        : "text"
                    }
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder={t(`checkout.${field}`)}
                    className="px-3 py-2 rounded bg-gray-100 focus:outline-none"
                    required
                  />
                </div>
              ))}

              <button
                type="submit"
                className="w-full py-2 bg-black text-white rounded hover:bg-white hover:text-black border transition-colors duration-300"
              >
                {t("checkout.submit")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutCard;
