import { describe, expect, it } from "vitest";
import { formatPrice, parsePrice, selectProducts, selectionError, slugify } from "@/data/products";
import { whatsappUrl } from "@/data/config";
import { buildOrderMessage, orderTotal, orderWhatsappUrl } from "@/lib/order-message";
import type { Product } from "@/types/store";

const base: Omit<Product, "id" | "slug" | "name" | "category" | "price" | "description"> = {
  sizes: ["P", "M", "G"],
  colors: [],
  images: [],
  tag: "",
  visible: true,
  composition: "",
  care: "",
  createdAt: 0,
  updatedAt: 0,
};

const catalog: Product[] = [
  { ...base, id: "1", slug: "vestido-aurora", name: "Vestido Aurora", category: "Vestidos", price: 359, description: "Midi fluido", colors: ["Vinho", "Preto"], tag: "Novidade", createdAt: 3 },
  { ...base, id: "2", slug: "calca-areia", name: "Calça Areia", category: "Calças", price: 289, description: "Textura de linho", tag: "Destaque", createdAt: 1 },
  { ...base, id: "3", slug: "regata-trama", name: "Regata Trama", category: "Camisetas", price: 159, description: "Malha canelada", createdAt: 2 },
  { ...base, id: "4", slug: "bolsa-raiz", name: "Bolsa Raiz", category: "Acessórios", price: 219, description: "Trama de palha", sizes: [], createdAt: 4 },
  { ...base, id: "5", slug: "oculto", name: "Produto oculto", category: "Vestidos", price: 10, description: "Não aparece", visible: false },
];

describe("Catálogo", () => {
  it("ignora produtos ocultos", () => {
    expect(selectProducts(catalog).map((p) => p.id)).not.toContain("5");
  });
  it("filtra por categoria", () => {
    expect(selectProducts(catalog, "Vestidos").map((p) => p.slug)).toEqual(["vestido-aurora"]);
  });
  it("ordena por preço crescente", () => {
    expect(selectProducts(catalog, "", "", "price-asc").map((p) => p.price)).toEqual([159, 219, 289, 359]);
  });
  it("destaques primeiro na ordenação padrão", () => {
    expect(selectProducts(catalog)[0]?.slug).toBe("calca-areia");
  });
  it("busca sem diferenciar acentos", () => {
    expect(selectProducts(catalog, "", "calca").map((p) => p.slug)).toEqual(["calca-areia"]);
  });
  it("busca pela descrição e pela categoria", () => {
    expect(selectProducts(catalog, "", "canelada").map((p) => p.slug)).toEqual(["regata-trama"]);
    expect(selectProducts(catalog, "", "acessorios").map((p) => p.slug)).toEqual(["bolsa-raiz"]);
  });
  it("exige cor quando há mais de uma opção e tamanho quando houver", () => {
    const dress = catalog[0]!;
    expect(selectionError(dress, "", "M")).toBe("Selecione uma cor para continuar.");
    expect(selectionError(dress, "Vinho", "")).toBe("Selecione um tamanho para continuar.");
    expect(selectionError(dress, "Vinho", "M")).toBe("");
    expect(selectionError(catalog[3]!, "", "")).toBe("");
  });
});

describe("Utilitários", () => {
  it("gera slugs limpos", () => {
    expect(slugify("  Calça Pantalona — Linho  ")).toBe("calca-pantalona-linho");
  });
  it("interpreta preços no formato brasileiro", () => {
    expect(parsePrice("1.299,90")).toBe(1299.9);
    expect(parsePrice("129")).toBe(129);
    expect(parsePrice("89.5")).toBe(89.5);
    expect(parsePrice("abc")).toBeNaN();
  });
});

describe("Pedido pelo WhatsApp", () => {
  const items = [
    { name: "Vestido Aurora", size: "M", color: "Vinho", quantity: 2, price: 359 },
    { name: "Bolsa Raiz", size: "", color: "", quantity: 1, price: 219 },
  ];

  it("calcula o total aproximado", () => {
    expect(orderTotal(items)).toBe(937);
  });

  it("inclui cliente, itens, total e pedido de frete/pagamento", () => {
    const message = buildOrderMessage(items, { name: "Maria Silva", email: "maria@exemplo.com" });
    expect(message).toContain("*Cliente:* Maria Silva");
    expect(message).toContain("1. Vestido Aurora");
    expect(message).toContain("Tamanho: M | Cor: Vinho");
    expect(message).toContain(`Qtd: 2 × ${formatPrice(359)} = ${formatPrice(718)}`);
    expect(message).toContain(`*Total aproximado:* ${formatPrice(937)}`);
    expect(message).toMatch(/frete/);
    expect(message).toMatch(/chave de pagamento/);
  });

  it("omite o cliente quando não autenticado", () => {
    expect(buildOrderMessage(items)).not.toContain("Cliente:");
  });

  it("usa o número oficial e codifica a mensagem", () => {
    const url = orderWhatsappUrl(items, { name: "Ana" });
    expect(url).toBe(`https://wa.me/558293097204?text=${encodeURIComponent(buildOrderMessage(items, { name: "Ana" }))}`);
  });

  it("não cria link para número inválido", () => {
    expect(whatsappUrl("Olá!", "+55 00 0000")).toBeUndefined();
  });
});
