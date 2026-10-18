import {
  collection,
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentSnapshot,
  type FirestoreError,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { compressCoverImage } from "@/lib/image-compress";
import type { Product, ProductInput } from "@/types/store";

/*
 * Armazenamento das fotos (plano gratuito, sem Firebase Storage):
 *
 *   products/{id}        -> dados do produto + `cover` (miniatura comprimida, ~40 KB)
 *   productImages/{id}   -> `images`: fotos da galeria comprimidas (até 5, ~170 KB cada)
 *
 * As listagens baixam só as miniaturas; a galeria completa é carregada
 * apenas na página do produto e no formulário de edição.
 */

const PRODUCTS = "products";
const PRODUCT_IMAGES = "productImages";
export const MAX_IMAGES = 5;
/** Limite de segurança para o documento de imagens (o Firestore aceita até 1 MiB). */
export const MAX_GALLERY_CHARS = 950_000;
export const MAX_SOURCE_FILE_SIZE = 20 * 1024 * 1024;

const productsRef = collection(db, PRODUCTS);

const asString = (value: unknown) => (typeof value === "string" ? value : "");
const asStringList = (value: unknown) =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
const asMillis = (value: unknown) => {
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return typeof value === "number" ? value : Date.now();
};

/** Converte um documento do Firestore em `Product`, tolerando campos ausentes. */
export function toProduct(snapshot: QueryDocumentSnapshot | DocumentSnapshot): Product {
  const data = (snapshot.data() ?? {}) as Record<string, unknown>;
  const cover = asString(data["cover"]);

  return {
    id: snapshot.id,
    slug: asString(data["slug"]) || snapshot.id,
    name: asString(data["name"]),
    description: asString(data["description"]),
    price: typeof data["price"] === "number" ? data["price"] : 0,
    category: asString(data["category"]),
    sizes: asStringList(data["sizes"]),
    colors: asStringList(data["colors"]),
    images: cover ? [{ url: cover, path: "" }] : [],
    tag: asString(data["tag"]),
    visible: data["visible"] !== false,
    composition: asString(data["composition"]),
    care: asString(data["care"]),
    createdAt: asMillis(data["createdAt"]),
    updatedAt: asMillis(data["updatedAt"]),
  };
}

type Listener = (products: Product[]) => void;
type ErrorListener = (error: FirestoreError) => void;

/** Produtos visíveis na loja, em tempo real. */
export function subscribeToPublicProducts(onData: Listener, onError: ErrorListener) {
  return onSnapshot(
    query(productsRef, where("visible", "==", true)),
    (snap) => onData(snap.docs.map(toProduct)),
    onError,
  );
}

/** Todos os produtos (inclusive ocultos). Requer permissão de administrador. */
export function subscribeToAllProducts(onData: Listener, onError: ErrorListener) {
  return onSnapshot(
    productsRef,
    (snap) => onData(snap.docs.map(toProduct).sort((a, b) => b.createdAt - a.createdAt)),
    onError,
  );
}

/** Gera um ID de documento novo sem gravar nada. */
export const newProductId = () => doc(productsRef).id;

export function validateImageFile(file: File | Blob) {
  if (!file.type.startsWith("image/")) return "Envie apenas arquivos de imagem (JPG, PNG ou WebP).";
  if (file.size > MAX_SOURCE_FILE_SIZE) return "Cada imagem deve ter no máximo 20 MB.";
  return "";
}

/** Fotos completas da galeria de um produto (data URLs). */
export async function fetchProductImages(productId: string): Promise<string[]> {
  const snap = await getDoc(doc(db, PRODUCT_IMAGES, productId));
  return asStringList((snap.data() as Record<string, unknown> | undefined)?.["images"]);
}

export const galleryChars = (images: string[]) => images.reduce((total, img) => total + img.length, 0);

/**
 * Cria ou atualiza um produto e sua galeria em uma única operação.
 * `images` são as fotos já comprimidas (data URLs); a primeira vira a capa.
 */
export async function saveProduct(id: string, input: ProductInput, images: string[], isNew: boolean) {
  if (!images.length) throw new Error("O produto precisa de pelo menos uma imagem.");
  if (galleryChars(images) > MAX_GALLERY_CHARS) {
    throw Object.assign(new Error("Imagens muito grandes."), { code: "zafora/images-too-large" });
  }

  const cover = await compressCoverImage(images[0] as string);
  const batch = writeBatch(db);

  batch.set(
    doc(db, PRODUCTS, id),
    {
      ...input,
      cover,
      imageCount: images.length,
      updatedAt: serverTimestamp(),
      ...(isNew ? { createdAt: serverTimestamp() } : { images: deleteField() }),
    },
    { merge: !isNew },
  );
  batch.set(doc(db, PRODUCT_IMAGES, id), { images, updatedAt: serverTimestamp() });

  await batch.commit();
}

/** Alterações simples (ex.: visibilidade) sem mexer nas fotos. */
export async function updateProduct(id: string, input: Partial<ProductInput>) {
  await updateDoc(doc(db, PRODUCTS, id), { ...input, updatedAt: serverTimestamp() });
}

export async function deleteProduct(product: Product) {
  const batch = writeBatch(db);
  batch.delete(doc(db, PRODUCTS, product.id));
  batch.delete(doc(db, PRODUCT_IMAGES, product.id));
  await batch.commit();
}
