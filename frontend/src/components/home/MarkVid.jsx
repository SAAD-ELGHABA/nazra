import React from "react";
import { ShieldCheck, Truck, CreditCard, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

function MarkVid() {
  const { t } = useTranslation();

  const features = [
    { icon: <ShieldCheck className="w-5 h-5" />, text: t("markVid.features.uvProtection") },
    { icon: <Truck className="w-5 h-5" />, text: t("markVid.features.shipping") },
    { icon: <CreditCard className="w-5 h-5" />, text: t("markVid.features.cod") },
    { icon: <Star className="w-5 h-5" />, text: t("markVid.features.trusted") },
  ];

  return (
    <section className="w-full px-6 py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="flex flex-col gap-6 justify-center">
          <h2
            className="font-bold text-[25px] md:text-[36px] lg:text-[46px]"
            style={{ lineHeight: "1.2", letterSpacing: "4px" }}
          >
            {t("markVid.title")}
          </h2>
          <video
            src="https://res.cloudinary.com/dmiaxmuiy/video/upload/v1755626196/video-ad_b79qe2.mp4"
            autoPlay
            preload="auto"
            loop
            muted
            playsInline
            controls={false}
            className="w-full max-w-lg rounded-xl shadow-lg"
          />
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <p>{t("markVid.description")}</p>

          <div className="space-y-3">
            {features.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-2 bg-white shadow-md rounded-lg hover:bg-gray-100 cursor-pointer transition"
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <button className="mt-2 px-6 py-3 rounded-lg shadow hover:bg-black hover:text-white transition border">
            {t("markVid.shopButton")}
          </button>
        </div>
      </div>
    </section>
  );
}

export default MarkVid;
