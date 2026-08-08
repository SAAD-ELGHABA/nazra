import { RouterProvider } from "react-router-dom";
import { Router } from "./Router";
import React, { Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { useEffect, useRef } from "react";
import { trackVisit } from "./api/api";
import { useCard } from "./context/CardContext";
import { useConsent } from "./context/ConsentContext";
import CheckoutModal from './components/CheckoutModal'
function App() {
  const { setHasProductAddedToCardEvent, hasProductAddedToCard } = useCard();
  const { categories } = useConsent();
  const hasTrackedVisit = useRef(false);

  // Audience measurement runs only with consent. The visitor identifier is
  // created at the moment consent is given — not on page load — so a visitor
  // who refuses is never assigned one, and withdrawing consent deletes it.
  useEffect(() => {
    if (!categories.analytics) {
      hasTrackedVisit.current = false;
      try {
        localStorage.removeItem("visitorId");
      } catch (error) {
        console.error("Failed to clear the visitor id:", error);
      }
      return;
    }

    // StrictMode runs effects twice in development; without this the accepting
    // visitor would be counted twice.
    if (hasTrackedVisit.current) return;
    hasTrackedVisit.current = true;

    const trackVisitor = async () => {
      try {
        if (!localStorage.getItem("visitorId")) {
          localStorage.setItem("visitorId", crypto.randomUUID());
        }
        const visitorId = localStorage.getItem("visitorId");
        await trackVisit(visitorId);
      } catch (error) {
        console.error("Failed to track visitor:", error);
      }
    };

    trackVisitor();
  }, [categories.analytics]);
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="min-h-screen flex flex-col">
          <RouterProvider router={Router} />
        </div>
      </Suspense>
      {hasProductAddedToCard && (
        <CheckoutModal
          isOpen={hasProductAddedToCard}
          onClose={setHasProductAddedToCardEvent}
        />
      )}
    </I18nextProvider>
  );
}

export default App;
