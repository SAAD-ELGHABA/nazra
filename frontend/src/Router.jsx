import { createBrowserRouter, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./Layout";
import React from "react";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";
import StorePage from "./pages/StorePage";
import DashboardLayout from "./DashboardLayout";
import Dashboard from "./pages/Dashboard";
import DashboardProducts from "./pages/DashboardProducts";
import AddProducts from "./pages/AddProducts";
import OrderManagementPage from "./pages/DashboardOrders";
import LoginPage from "./pages/Login";
import CheckoutCard from "./pages/CheckoutCard";
import ContactUs from "./pages/ContactUs";
import HelpCenter from "./pages/HelpCenter";
import ReturnsPolicy from "./pages/ReturnsPolicy";
import ShippingInfo from "./pages/ShippingInfo";
import TermsOfUse from "./pages/TermsOfUse";
import Privacy from "./pages/Privacy";
import TermsAndConditions from "./pages/TermsAndConditions";
import StoreIntro from "./pages/StoreIntro";

import ComingSoonPage from "./pages/CommingSoonPage";

import ProductPage from "./pages/ProductPage";
import Favorites from "./pages/Favorites";

const ProtectedRoutes = ({ children }) => {
  const localToken = localStorage.getItem("User_Data_token");
  const localUserData = localStorage.getItem("User_Data");
  if (!localToken) {
    if (localUserData) {
      localStorage.removeItem("User_Data");
    }
    return <Navigate to={"/login"} replace={true} />;
  }
  return children;
};

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
        path: "/store/products",
        element: <StorePage />,
      },
      {
        path: "/store",
        element: <StoreIntro />,
      },
      {
        path: "/product/:slug",
        element: <ProductPage />,
      },
      {
        path: "/favorites",
        element: <Favorites />,
      },
      {
        path: "/checkout-card",
        element: <CheckoutCard />,
      },
      {
        path: "/contact-us",
        element: <ContactUs />,
      },
      {
        path: "/help-center",
        element: <HelpCenter />,
      },
      {
        path: "/returns-policy",
        element: <ReturnsPolicy />,
      },
      {
        path: "/shipping-info",
        element: <ShippingInfo />,
      },
      {
        path: "/terms-of-use",
        element: <TermsOfUse />,
      },
      {
        path: "/privacy-policy",
        element: <Privacy />,
      },
      {
        path: "/terms-and-conditions",
        element: <TermsAndConditions />,
      },
      {
        path: "/comming-soon-page",
        element: <ComingSoonPage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoutes>
        <DashboardLayout />,
      </ProtectedRoutes>
    ),
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/dashboard/products",
        element: <DashboardProducts />,
      },
      {
        path: "/dashboard/products/new",
        element: <AddProducts />,
      },
      {
        path: "/dashboard/orders",
        element: <OrderManagementPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
