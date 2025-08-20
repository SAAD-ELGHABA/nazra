import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const faqsData = [
  { questionKey: "faqs.q1.question", answerKey: "faqs.q1.answer" },
  { questionKey: "faqs.q2.question", answerKey: "faqs.q2.answer" },
  { questionKey: "faqs.q3.question", answerKey: "faqs.q3.answer" },
  { questionKey: "faqs.q4.question", answerKey: "faqs.q4.answer" },
  { questionKey: "faqs.q5.question", answerKey: "faqs.q5.answer" },
];

function FAQs() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-2">{t("faqs.title")}</h1>
      <p className="text-gray-600 mb-8">{t("faqs.subtitle")}</p>

      <div className="space-y-6 text-left">
        {faqsData.map((faq, index) => (
          <div key={index}>
            <h3 className="font-semibold">{t(faq.questionKey)}</h3>
            <p className="text-gray-700 mt-1">{t(faq.answerKey)}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-2">{t("faqs.stillQuestions")}</h2>
        <p className="text-gray-600 mb-4">{t("faqs.helpText")}</p>
        <Link className="px-6 py-2 text-white  rounded transition-colors duration-300 hover:bg-white border bg-black hover:text-black mt-2">
          {t("faqs.contact")}
        </Link>
      </div>
    </div>
  );
}

export default FAQs;
