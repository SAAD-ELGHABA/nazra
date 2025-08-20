import { RouterProvider } from "react-router-dom";
import "./App.css";
import { Router } from "./Router";
import React, { Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="min-h-screen flex flex-col">
          <RouterProvider router={Router} />
        </div>
      </Suspense>
    </I18nextProvider>
  );
}

export default App;
