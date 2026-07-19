import React from "react";
import { CreditCard, Headphones, RefreshCw, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SocialProofStrip() {
  const { t } = useTranslation();
  const items = [
    [CreditCard, t("home.proof.payment"), ""],
    [Truck, t("home.proof.delivery"), ""],
    [RefreshCw, t("home.proof.returnsValue"), t("home.proof.returnsLabel")],
    [Headphones, t("home.proof.support"), "WhatsApp"],
  ];
  return (
    <section className="nazra-container pb-5" aria-label="Engagements NAZRA">
      <div className="grid grid-cols-2 rounded-sm bg-[#f2ece3] lg:grid-cols-4">
        {items.map(([Icon, value, label], index) => (
          <div key={index} className="flex min-h-24 items-center justify-center gap-3 border-stone-300 p-4 even:border-s lg:border-e lg:last:border-e-0 rtl:lg:border-e-0 rtl:lg:border-s">
            {React.createElement(Icon, { className: "h-6 w-6 stroke-[1.4] text-[#9a7044]", "aria-hidden": true })}
            <div><p className="font-display text-lg font-semibold">{value}</p>{label && <p className="text-[10px] text-stone-600">{label}</p>}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
