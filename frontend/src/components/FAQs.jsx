import React from "react";
import { Link } from "react-router-dom";

function FAQs() {
  const faqs = [
    {
      question: "What is UV protection?",
      answer:
        "UV protection is essential for safeguarding your eyes from harmful rays. Our sunglasses provide 100% UV protection, ensuring your eyes stay safe while looking stylish. Enjoy the sun without worry!",
    },
    {
      question: "How is shipping handled?",
      answer:
        "We offer fast and reliable shipping options for all orders. Standard shipping typically takes 3-5 business days. You will receive a tracking number once your order is shipped.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We accept returns within 30 days of purchase. Items must be unworn and in their original packaging. Please contact our support team for return instructions.",
    },
    {
      question: "How to care for sunglasses?",
      answer:
        "To maintain your sunglasses, clean the lenses with a microfiber cloth. Avoid using harsh chemicals or abrasive materials. Store them in a protective case when not in use.",
    },
    {
      question: "Do you offer warranties?",
      answer:
        "Yes, we provide a one-year warranty against manufacturing defects. This warranty covers repairs or replacements for any issues that arise during normal use. Please keep your receipt for warranty claims.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-2">FAQs</h1>
      <p className="text-gray-600 mb-8">
        Find answers to your most common questions about our sunglasses and
        services.
      </p>

      <div className="space-y-6 text-left">
        {faqs.map((faq, index) => (
          <div key={index}>
            <h3 className="font-semibold">{faq.question}</h3>
            <p className="text-gray-700 mt-1">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
        <p className="text-gray-600 mb-4">We're here to help!</p>
        <Link className="border border-gray-700 px-6 py-2 rounded hover:bg-black hover:text-white transition">
          Contact
        </Link>
      </div>
    </div>
  );
}

export default FAQs;
