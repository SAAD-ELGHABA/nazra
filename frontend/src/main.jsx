import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import React from "react";
import "./i18n";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { CardProvider } from "./context/CardContext.jsx";
import { ConsentProvider } from "./context/ConsentContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { Toaster } from "sonner";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster richColors position="top-center" />
    {/* Wraps everything, including the providers: a throw inside one of them
        would otherwise blank the page with no way back. */}
    <ErrorBoundary>
      {/* Outermost provider: App reads consent before deciding whether to track a visit. */}
      <ConsentProvider>
        <FavoritesProvider>
          <CardProvider>
            <App />
          </CardProvider>
        </FavoritesProvider>
      </ConsentProvider>
    </ErrorBoundary>
  </StrictMode>
);
