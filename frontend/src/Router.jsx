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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CheckoutCard from "./pages/CheckoutCard";
import ContactUs from "./pages/ContactUs";
import HelpCenter from "./pages/HelpCenter";
import ReturnsPolicy from "./pages/ReturnsPolicy";
import ShippingInfo from "./pages/ShippingInfo";
import TermsOfUse from "./pages/TermsOfUse";
import Privacy from "./pages/Privacy";
import WhyChooseUsPage from "./pages/WhyChooseUsPage";
import TermsAndConditions from "./pages/TermsAndConditions";
import StoreIntro from "./pages/StoreIntro";

import ComingSoonPage from "./pages/CommingSoonPage";

import ProductPage from "./pages/ProductPage";
import Favorites from "./pages/Favorites";
import NazraIcon from "./pages/NazraIcon";
import UVProtectionPage from "./pages/UVProtectionPage";
import AdminsPage from "./pages/AdminsPage";
import BlogPage from './Dashboard/BlogPage'
import { ABOUT, CHECKOUTCARD, COMMINGSOON, CONTACTUS, DASHBOARDADMINS, DASHBOARDBLOG, DASHBOARDHOME, DASHBOARDORDERS, DASHBOARDPRODUCTS, DASHBOARDPRODUCTSNEW, DISCOVER, EXPLORE, FAVORITES, FORGOT_PASSWORD, HELPCENTER, HOME, LOGIN, PRIVACYANDPOLICY, PRODUCTDETAILS, RESET_PASSWORD, RETURNPOLICY, SHIPPINGINFO, STORE, STOREPRODUCTS, TERMSANDCONDITIONS, TERMSOFUSE } from "./constant/routerConstants";
import { clearAuthStorage, hasStoredAuthSession } from "./utils/auth";

const ProtectedRoutes = ({ children }) => {
  if (!hasStoredAuthSession()) {
    clearAuthStorage();
    return <Navigate to={LOGIN} replace={true} />;
  }
  return children;
};

export const Router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: HOME,
        element: <HomePage />,
      },
      {
        path: "/nazra-icon.png",
        element: <NazraIcon />,
      },
      {
        path: ABOUT,
        element: <AboutPage />,
      },
      {
        path: DISCOVER,
        element: <WhyChooseUsPage />,
      },
      {
        path: EXPLORE,
        element: <UVProtectionPage />,
      },
      {
        path: STOREPRODUCTS,
        element: <StorePage />,
      },
      {
        path: STORE,
        element: <StoreIntro />,
      },
      {
        path: PRODUCTDETAILS,
        element: <ProductPage />,
      },
      {
        path: FAVORITES,
        element: <Favorites />,
      },
      {
        path: CHECKOUTCARD,
        element: <CheckoutCard />,
      },
      {
        path: CONTACTUS,
        element: <ContactUs />,
      },
      {
        path: HELPCENTER,
        element: <HelpCenter />,
      },
      {
        path: RETURNPOLICY,
        element: <ReturnsPolicy />,
      },
      {
        path: SHIPPINGINFO,
        element: <ShippingInfo />,
      },
      {
        path: TERMSOFUSE,
        element: <TermsOfUse />,
      },
      {
        path: PRIVACYANDPOLICY,
        element: <Privacy />,
      },
      {
        path: TERMSANDCONDITIONS,
        element: <TermsAndConditions />,
      },
      {
        path: COMMINGSOON,
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
        path: DASHBOARDHOME,
        element: <Dashboard />,
      },
      {
        path: DASHBOARDPRODUCTS,
        element: <DashboardProducts />,
      },
      {
        path: DASHBOARDPRODUCTSNEW,
        element: <AddProducts />,
      },
      {
        path: DASHBOARDORDERS,
        element: <OrderManagementPage />,
      },
      {
        path: DASHBOARDADMINS,
        element: <AdminsPage />,
      },
      {
        path: DASHBOARDBLOG,
        element: <BlogPage />,
      },
    ],
  },
  {
    path: LOGIN,
    element: <LoginPage />,
  },
  {
    path: FORGOT_PASSWORD,
    element: <ForgotPassword />,
  },
  {
    path: RESET_PASSWORD,
    element: <ResetPassword />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
