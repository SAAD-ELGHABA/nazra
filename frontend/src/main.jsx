import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import React from "react";
import "./i18n";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { CardProvider } from "./context/CardContext.jsx";
import { Toaster } from "sonner";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster/>
    <FavoritesProvider>
      <CardProvider>
        <App />
      </CardProvider>
    </FavoritesProvider>
    <Toaster />
  </StrictMode>
);
