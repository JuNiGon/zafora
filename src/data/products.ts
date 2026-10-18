import type { Product } from "@/types/store";

export type { Product } from "@/types/store";

export type SortOption = "featured" | "newest" | "name" | "price-asc" | "price-desc";

const priceFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatPrice = (price: number) => priceFormatter.format(price);

export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export const slugify = (value: string) =>
  normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/** Converte "1.299,90", "1299.90" ou "129" em número. Retorna NaN se inválido. */
export function parsePrice(value: string): number {
  const clean = value.replace(/[^\d,.-]/g, "").trim();
  if (!clean) return Number.NaN;
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const result = Number(normalized);
  return Number.isFinite(result) ? Math.round(result * 100) / 100 : Number.NaN;
}

const tagWeight = (tag: string) => (tag === "Destaque" ? 2 : tag === "Novidade" ? 1 : 0);

export function selectProducts(
  list: Product[],
  category = "",
  query = "",
  sort: SortOption | string = "featured",
) {
  const term = normalize(query.trim());
  const result = list.filter(
    (p) =>
      p.visible &&
      (!category || p.category === category) &&
      (!term ||
        normalize(`${p.name} ${p.description} ${p.category} ${p.colors.join(" ")}`).includes(term)),
  );
  return result.sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.localeCompare(b.name, "pt-BR");
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
        return b.createdAt - a.createdAt;
      default:
        return tagWeight(b.tag) - tagWeight(a.tag) || b.createdAt - a.createdAt;
    }
  });
}

export function selectionError(product: Product, color: string, size: string) {
  if (product.colors.length > 1 && !product.colors.includes(color))
    return "Selecione uma cor para continuar.";
  if (product.sizes.length && !product.sizes.includes(size))
    return "Selecione um tamanho para continuar.";
  return "";
}

/** Primeira imagem do produto, ou string vazia. */
export const coverImage = (product: Pick<Product, "images">) => product.images[0]?.url ?? "";
