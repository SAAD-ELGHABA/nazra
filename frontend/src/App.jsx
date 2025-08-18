import { RouterProvider } from "react-router-dom";
import "./App.css";
import { Router } from "./Router";
import React from "react";




function App() {
  return (
    <div>
      <RouterProvider router={Router} />
      
    </div>
  );
}

export default App;
