import { RouterProvider } from "react-router-dom";
import { Router } from "./Router";
import React, { Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { useEffect } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { trackVisit } from "./api/api";
import {Toaster} from 'sonner'

function App() {
  useEffect(() => {
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
  }, []);
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="min-h-screen flex flex-col">
          <RouterProvider router={Router} />
          <Toaster />
        </div>
      </Suspense>
    </I18nextProvider>
  );
}

export default App;
