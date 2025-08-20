import { Webhook } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

function WebflowSection() {
  const { t } = useTranslation();

  return (
    <div className="md:p-10 p-4 w-full flex flex-col items-center gap-8">
      <div className="flex items-center gap-3">
        <Webhook />
        <h3 className="font-semibold">{t("webflow.platform")}</h3>
      </div>
      <div className="md:w-2/5">
        <p className="text-center font-semibold">"{t("webflow.testimonial.text")}"</p>
      </div>
      <img src="/Avatar Image.png" alt="Avatar" className="w-12 h-12 rounded-full" />
      <div className="text-sm text-center">
        <h5 className="font-medium">{t("webflow.testimonial.name")}</h5>
        <h5>{t("webflow.testimonial.role")}</h5>
      </div>
    </div>
  );
}

export default WebflowSection;
