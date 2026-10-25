import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <CarritoProvider>
        <App />
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </CarritoProvider>
    </AuthProvider>
  </BrowserRouter>
);