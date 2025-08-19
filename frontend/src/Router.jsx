import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./Layout";
import React from "react";
import NotFound from "./pages/NotFound";
export const Router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
