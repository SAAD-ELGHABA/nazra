import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./Layout";
import React from "react";



export const Router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path:"/",
                element: <HomePage />
            }
        ]
    }
])


