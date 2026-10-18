import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { AuthProvider } from "./contexts/auth";
import { ProductsProvider } from "./contexts/products";
import { CartProvider } from "./contexts/cart";
import "./services/firebase";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("Elemento #root não encontrado em index.html.");

createRoot(container).render(
  <StrictMode>
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  </StrictMode>,
);
