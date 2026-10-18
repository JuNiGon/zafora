import { createContext, useContext, type ReactNode } from "react";
import { useAdminProducts } from "@/contexts/products";
import type { Product } from "@/types/store";

type AdminProductsState = { products: Product[]; loading: boolean; error: string };

const AdminProductsContext = createContext<AdminProductsState | null>(null);

/** Uma única assinatura em tempo real de todos os produtos para as telas do painel. */
export function AdminProductsProvider({ children }: { children: ReactNode }) {
  const state = useAdminProducts(true);
  return <AdminProductsContext.Provider value={state}>{children}</AdminProductsContext.Provider>;
}

export function useAdminCatalog() {
  const context = useContext(AdminProductsContext);
  if (!context) throw new Error("useAdminCatalog precisa estar dentro de <AdminProductsProvider>.");
  return context;
}
