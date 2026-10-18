import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { subscribeToAllProducts, subscribeToPublicProducts } from "@/services/products";
import type { Product } from "@/types/store";

type ProductsState = {
  products: Product[];
  loading: boolean;
  error: string;
};

const ProductsContext = createContext<ProductsState | null>(null);

export function firestoreErrorMessage(error: { code?: string }) {
  if (error.code === "permission-denied")
    return "Sem permissão para ler os produtos. Verifique as regras de segurança do Firestore.";
  if (error.code === "unavailable") return "Sem conexão com o servidor. Tentando novamente…";
  return "Não foi possível carregar os produtos.";
}

/**
 * Mantém o catálogo público sincronizado com o Firestore em tempo real:
 * qualquer alteração feita no painel aparece na loja sem recarregar a página.
 */
export function ProductsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProductsState>({ products: [], loading: true, error: "" });

  useEffect(
    () =>
      subscribeToPublicProducts(
        (products) => setState({ products, loading: false, error: "" }),
        (error) => setState((prev) => ({ ...prev, loading: false, error: firestoreErrorMessage(error) })),
      ),
    [],
  );

  return <ProductsContext.Provider value={state}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts precisa estar dentro de <ProductsProvider>.");
  return context;
}

export function useProduct(slug: string) {
  const { products, loading, error } = useProducts();
  const product = useMemo(() => products.find((p) => p.slug === slug), [products, slug]);
  return { product, loading, error, products };
}

/** Lista completa para o painel administrativo (inclui produtos ocultos). */
export function useAdminProducts(enabled: boolean) {
  const [state, setState] = useState<ProductsState>({ products: [], loading: true, error: "" });

  useEffect(() => {
    if (!enabled) return;
    return subscribeToAllProducts(
      (products) => setState({ products, loading: false, error: "" }),
      (error) => setState((prev) => ({ ...prev, loading: false, error: firestoreErrorMessage(error) })),
    );
  }, [enabled]);

  return state;
}
