import React from "react";
import { useTranslation } from "react-i18next";

export default function UserGeneratedContent() {
  const { t } = useTranslation();
  return (
    <section className="nazra-section bg-white" aria-labelledby="ugc-title">
      <div className="nazra-container lg:grid lg:grid-cols-[200px_1fr] lg:items-center lg:gap-6">
        <div className="mb-5 lg:mb-0">
          <h2 id="ugc-title" className="nazra-heading">{t("home.ugc.title")}</h2>
          <p className="mt-2 max-w-48 text-xs leading-5 text-stone-600">{t("home.ugc.copy")}</p>
        </div>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-0 sm:grid sm:grid-cols-4 sm:px-0">
          {[1, 2, 3, 4].map((number) => (
            <figure key={number} className="group min-w-[68vw] snap-center overflow-hidden rounded-sm sm:min-w-0">
              <img src={`/assets/images/home/ugc-0${number}.webp`} alt={t("home.ugc.imageAlt", { number })} width="600" height="760" loading="lazy" className="aspect-[4/5] h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
