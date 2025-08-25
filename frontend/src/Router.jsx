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
import DashboardOrders from "./pages/DashboardOrders";
import AddProducts from "./pages/AddProducts";
import OrderManagementPage from "./pages/DashboardOrders";
import Login from "./pages/Login";
import LoginPage from "./pages/Login";


import ProductPage from "./pages/ProductPage";
import Favorites from "./pages/Favorites";

const ProtectedRoutes = ({children}) => {
  const localToken = localStorage.getItem("User_Data_token")
  const localUserData = localStorage.getItem("User_Data")
  if (!localToken) {
    if(localUserData) {
      localStorage.removeItem("User_Data")
    } 
    return <Navigate to={'/login'} replace={true} />

  }
  return children
}

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
        path: "/favorites",
        element: <Favorites />,
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
    ]
  },
  {
    path:'/login',
    element:<LoginPage />
  },
  {
    path: "*",
    element: <NotFound />,
  },
]

);
