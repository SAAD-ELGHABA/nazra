import { createBrowserRouter, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./Layout";
import React from "react";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";
import StorePage from "./pages/StorePage";
import CheckoutCard from "./pages/CheckoutCard";
import ContactUs from "./pages/ContactUs";
import HelpCenter from "./pages/HelpCenter";
import ReturnsPolicy from "./pages/ReturnsPolicy";
import ShippingInfo from "./pages/ShippingInfo";
import TermsOfUse from "./pages/TermsOfUse";
import Privacy from "./pages/Privacy";
import CookiePolicy from "./pages/CookiePolicy";
import WhyChooseUsPage from "./pages/WhyChooseUsPage";
import TermsAndConditions from "./pages/TermsAndConditions";
import StoreIntro from "./pages/StoreIntro";

import ComingSoonPage from "./pages/CommingSoonPage";

import ProductPage from "./pages/ProductPage";
import Favorites from "./pages/Favorites";
import NazraIcon from "./pages/NazraIcon";
import UVProtectionPage from "./pages/UVProtectionPage";

/**
 * The back office is lazy-loaded.
 *
 * These 20 modules pull in recharts, xlsx and react-quill. Statically imported,
 * every shopper downloaded the entire admin dashboard before seeing a product.
 * Now they are fetched only when an admin actually opens one.
 *
 * The storefront routes above stay eager: they are what the shopper came for,
 * and splitting them would only add a round trip.
 */
const DashboardLayout = React.lazy(() => import("./DashboardLayout"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const DashboardProducts = React.lazy(() => import("./pages/DashboardProducts"));
const AddProducts = React.lazy(() => import("./pages/AddProducts"));
const OrderManagementPage = React.lazy(() => import("./pages/DashboardOrders"));
const LoginPage = React.lazy(() => import("./pages/Login"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const AdminsPage = React.lazy(() => import("./pages/AdminsPage"));
const BlogPage = React.lazy(() => import("./Dashboard/BlogPage"));
const DashboardAnalytics = React.lazy(() => import("./pages/DashboardAnalytics"));
const DashboardSubscribers = React.lazy(() => import("./pages/DashboardSubscribers"));
const DashboardActivity = React.lazy(() => import("./pages/DashboardActivity"));
const DashboardContacts = React.lazy(() => import("./pages/DashboardContacts"));
const DashboardCustomers = React.lazy(() => import("./pages/DashboardCustomers"));
const DashboardExports = React.lazy(() => import("./pages/DashboardExports"));
const DashboardInventory = React.lazy(() => import("./pages/DashboardInventory"));
const DashboardReviews = React.lazy(() => import("./pages/DashboardReviews"));
const DashboardSettings = React.lazy(() => import("./pages/DashboardSettings"));
const Forbidden = React.lazy(() => import("./pages/Forbidden"));

/** Lazy routes need a Suspense boundary between them and the router. */
const AdminChunk = ({ children }) => (
  <React.Suspense
    fallback={
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    }
  >
    {children}
  </React.Suspense>
);
import { ABOUT, CHECKOUTCARD, COMMINGSOON, CONTACTUS, COOKIEPOLICY, DASHBOARDADMINS, DASHBOARDACTIVITY, DASHBOARDANALYTICS, DASHBOARDBLOG, DASHBOARDCONTACTS, DASHBOARDCUSTOMERS, DASHBOARDEXPORTS, DASHBOARDHOME, DASHBOARDINVENTORY, DASHBOARDORDERS, DASHBOARDPRODUCTS, DASHBOARDPRODUCTSNEW, DASHBOARDREVIEWS, DASHBOARDSETTINGS, DASHBOARDSUBSCRIBERS, DISCOVER, EXPLORE, FAVORITES, FORGOT_PASSWORD, HELPCENTER, HOME, LOGIN, PRIVACYANDPOLICY, PRODUCTDETAILS, RESET_PASSWORD, RETURNPOLICY, SHIPPINGINFO, STORE, STOREPRODUCTS, TERMSANDCONDITIONS, TERMSOFUSE } from "./constant/routerConstants";
import { clearAuthStorage, hasStoredAuthSession } from "./utils/auth";
import { getCurrentAdmin } from "./api/api";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";

const ProtectedRoutes = ({ children }) => {
  const [state, setState] = React.useState({
    loading: true,
    currentUser: null,
    capabilities: [],
    sessionError: "",
  });

  const refreshCurrentUser = React.useCallback(async () => {
    setState((previous) => ({
      ...previous,
      loading: true,
      sessionError: "",
    }));

    try {
      const response = await getCurrentAdmin();
      const user = response?.data?.user;
      const capabilities = Array.isArray(user?.capabilities) ? user.capabilities : [];
      setState({
        loading: false,
        currentUser: user,
        capabilities,
        sessionError: "",
      });
      return user;
    } catch (error) {
      const unauthorized = error?.response?.status === 401;

      if (unauthorized) {
        clearAuthStorage();
      }

      setState({
        loading: false,
        currentUser: null,
        capabilities: [],
        sessionError: unauthorized
          ? ""
          : error?.response?.data?.message ||
            "The admin session could not be verified. Check your connection and try again.",
      });
      return null;
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    if (!hasStoredAuthSession()) {
      clearAuthStorage();
      setState((previous) => ({ ...previous, loading: false }));
      return;
    }

    refreshCurrentUser().finally(() => {
      if (!active) return;
    });

    return () => {
      active = false;
    };
  }, [refreshCurrentUser]);

  if (!hasStoredAuthSession()) {
    clearAuthStorage();
    return <Navigate to={LOGIN} replace={true} />;
  }
  if (state.loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading admin session...
      </div>
    );
  }
  if (state.sessionError) {
    return (
      <main className="grid min-h-screen place-items-center bg-muted/30 p-6">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Admin session unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{state.sessionError}</p>
          <button
            type="button"
            onClick={refreshCurrentUser}
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }
  if (!state.currentUser) return <Navigate to={LOGIN} replace={true} />;

  const authValue = {
    currentUser: state.currentUser,
    capabilities: state.capabilities,
    hasCapability: (capability) => state.capabilities.includes(capability),
    refreshCurrentUser,
  };

  return <AdminAuthProvider value={authValue}>{children}</AdminAuthProvider>;
};

const CapabilityRoute = ({ capability, children }) => {
  const { hasCapability } = useAdminAuth();
  const requiredCapabilities = Array.isArray(capability) ? capability : [capability];
  return requiredCapabilities.every((entry) => hasCapability(entry))
    ? children
    : <Forbidden />;
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
        path: COOKIEPOLICY,
        element: <CookiePolicy />,
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
    // One boundary for the whole back office: child routes render into
    // DashboardLayout's Outlet, so they resolve inside this Suspense too.
    element: (
      <AdminChunk>
        <ProtectedRoutes>
          <DashboardLayout />
        </ProtectedRoutes>
      </AdminChunk>
    ),
    children: [
      {
        path: DASHBOARDHOME,
        element: (
          <CapabilityRoute capability={["dashboard.view", "analytics.read"]}>
            <Dashboard />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDPRODUCTS,
        element: (
          <CapabilityRoute capability="products.read">
            <DashboardProducts />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDPRODUCTSNEW,
        element: (
          <CapabilityRoute capability="products.manage">
            <AddProducts />
          </CapabilityRoute>
        ),
      },
      {
        path: "/admins/dashboard/products/:id/edit",
        element: (
          <CapabilityRoute capability="products.manage">
            <AddProducts />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDORDERS,
        element: (
          <CapabilityRoute capability="orders.read">
            <OrderManagementPage />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDADMINS,
        element: (
          <CapabilityRoute capability="admins.manage">
            <AdminsPage />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDBLOG,
        element: (
          <CapabilityRoute capability="blog.manage">
            <BlogPage />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDANALYTICS,
        element: (
          <CapabilityRoute capability="analytics.read">
            <DashboardAnalytics />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDSUBSCRIBERS,
        element: (
          <CapabilityRoute capability="subscribers.read">
            <DashboardSubscribers />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDINVENTORY,
        element: (
          <CapabilityRoute capability="inventory.read">
            <DashboardInventory />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDCUSTOMERS,
        element: (
          <CapabilityRoute capability="customers.read">
            <DashboardCustomers />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDCONTACTS,
        element: (
          <CapabilityRoute capability="contacts.read">
            <DashboardContacts />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDREVIEWS,
        element: (
          <CapabilityRoute capability="reviews.read">
            <DashboardReviews />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDACTIVITY,
        element: (
          <CapabilityRoute capability="activity.read">
            <DashboardActivity />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDEXPORTS,
        element: (
          <CapabilityRoute capability="orders.export">
            <DashboardExports />
          </CapabilityRoute>
        ),
      },
      {
        path: DASHBOARDSETTINGS,
        element: (
          <CapabilityRoute capability="settings.read">
            <DashboardSettings />
          </CapabilityRoute>
        ),
      },
    ],
  },
  {
    path: LOGIN,
    element: <AdminChunk><LoginPage /></AdminChunk>,
  },
  {
    path: FORGOT_PASSWORD,
    element: <AdminChunk><ForgotPassword /></AdminChunk>,
  },
  {
    path: RESET_PASSWORD,
    element: <AdminChunk><ResetPassword /></AdminChunk>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
