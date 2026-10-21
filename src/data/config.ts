export const brand = {
  name: "ZÁFORA",
  /** Número do WhatsApp comercial: código do país + DDD + número, somente dígitos. */
  whatsappNumber: "558293097204",
  /** Número formatado para exibição no site. */
  whatsappDisplay: "+55 82 9309-7204",
  instagramUrl: "https://www.instagram.com/zaforamaceio/",
  instagramHandle: "@zaforamaceio",
  address: "Av. Comendador Gustavo Paiva, 2990 – Cruz das Almas, Maceió – AL",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Av.+Comendador+Gustavo+Paiva,+2990,+Cruz+das+Almas,+Macei%C3%B3+-+AL",
  pinterestUrl: "",
  serviceHours: "",
  email: "",
  announcement: "Um novo olhar para o essencial. Conheça a coleção.",
  story: "Frescor, sofisticação e estilo em cada detalhe.",
  history:
    "A Záfora é uma loja de roupas requintada e cheia de estilo, nascida com o propósito de transmitir confiança, elegância e autenticidade a cada pessoa que veste nossas peças.",
};

/** Categorias exibidas nos filtros e no formulário de cadastro de produtos. */
export const categories = [
  "Camisetas",
  "Blusas",
  "Calças",
  "Saias",
  "Shorts",
  "Vestidos",
  "Jaquetas",
  "Acessórios",
] as const;

/** Tamanhos sugeridos no cadastro. Outros podem ser adicionados manualmente. */
export const sizeOptions = ["PP", "P", "M", "G", "GG", "XG", "34", "36", "38", "40", "42", "44", "Único"];

/** Selos opcionais exibidos sobre a foto do produto. */
export const productTags = ["", "Novidade", "Destaque", "Promoção", "Últimas peças"];

export const isWhatsappConfigured = (number = brand.whatsappNumber) => /^\d{8,15}$/.test(number);

export function whatsappUrl(message: string, number = brand.whatsappNumber) {
  return isWhatsappConfigured(number)
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : undefined;
}
