import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./Layout";
import React from "react";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";
import StorePage from "./pages/StorePage";
import ProductPage from "./pages/ProductPage";
export const Router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/store",
        element: <StorePage />,
      },
      {
        path: "/product/:slug",
        element: <ProductPage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
