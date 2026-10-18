import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth";
import { fetchRemoteCart, saveRemoteCart } from "@/services/users";
import type { CartItem, Product } from "@/types/store";

const STORAGE_KEY = "zafora:cart";
const MAX_QUANTITY = 20;

type AddToCartInput = { product: Product; size: string; color: string; quantity: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (input: AddToCartInput) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export const cartItemKey = (productId: string, size: string, color: string) =>
  [productId, size, color].join("|");

const clampQuantity = (value: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(value)));

function isCartItem(value: unknown): value is CartItem {
  const item = value as Partial<CartItem> | null;
  return (
    !!item &&
    typeof item.key === "string" &&
    typeof item.productId === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number"
  );
}

function readLocalCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

function writeLocalCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* armazenamento indisponível (modo privado, cota cheia) */
  }
}

/** Une dois carrinhos mantendo a maior quantidade de cada item (evita duplicar ao recarregar). */
function mergeCarts(a: CartItem[], b: CartItem[]) {
  const map = new Map<string, CartItem>();
  for (const item of [...a, ...b.filter(isCartItem)]) {
    const existing = map.get(item.key);
    map.set(item.key, existing ? { ...item, quantity: Math.max(existing.quantity, item.quantity) } : item);
  }
  return [...map.values()];
}

/**
 * Carrinho do cliente.
 * - Visitante: salvo no navegador (localStorage).
 * - Logado: também sincronizado em `carts/{uid}` no Firestore, para continuar em outro aparelho.
 * - Ao sair da conta, o carrinho local é limpo para não ficar visível a outra pessoa.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const uid = user?.uid ?? null;
  const [items, setItems] = useState<CartItem[]>(() =>
    typeof window === "undefined" ? [] : readLocalCart(),
  );
  const [syncedUid, setSyncedUid] = useState<string | null>(null);
  const previousUid = useRef<string | null>(null);

  // Login / logout: mescla com o carrinho remoto ou limpa a sessão.
  useEffect(() => {
    if (authLoading) return;
    const previous = previousUid.current;
    previousUid.current = uid;

    if (!uid) {
      setSyncedUid(null);
      if (previous) setItems([]);
      return;
    }

    let cancelled = false;
    fetchRemoteCart(uid).then((remote) => {
      if (cancelled) return;
      setItems((local) => mergeCarts(local, remote));
      setSyncedUid(uid);
    });
    return () => {
      cancelled = true;
    };
  }, [uid, authLoading]);

  // Persistência local imediata.
  useEffect(() => writeLocalCart(items), [items]);

  // Persistência remota com debounce, somente depois da mesclagem inicial.
  useEffect(() => {
    if (!uid || syncedUid !== uid) return;
    const timer = window.setTimeout(() => {
      saveRemoteCart(uid, items).catch(() => undefined);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [items, uid, syncedUid]);

  const addItem = useCallback(({ product, size, color, quantity }: AddToCartInput) => {
    const key = cartItemKey(product.id, size, color);
    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: clampQuantity(item.quantity + quantity) } : item,
        );
      }
      return [
        ...current,
        {
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          // A miniatura é buscada no catálogo ao exibir o carrinho (não é salva aqui).
          image: "",
          size,
          color,
          quantity: clampQuantity(quantity),
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, quantity: clampQuantity(quantity) } : item)),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [items, addItem, updateQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de <CartProvider>.");
  return context;
}

export { MAX_QUANTITY };
