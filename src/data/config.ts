export const brand = {
  name: "ZÁFORA",
  /** Número do WhatsApp comercial: código do país + DDD + número, somente dígitos. */
  whatsappNumber: "5582988487506",
  instagramUrl: "",
  pinterestUrl: "",
  serviceHours: "",
  email: "",
  announcement: "Um novo olhar para o essencial. Conheça a coleção.",
  story:
    "A Záfora propõe um olhar sensível para o vestir: formas leves, texturas naturais e peças que deixam espaço para a sua personalidade. Uma identidade construída no encontro entre o essencial e o expressivo.",
  history:
    "Este espaço será dedicado à história real da Záfora: suas origens, quem está por trás da marca e o que inspira cada coleção. O conteúdo institucional será atualizado com as informações da marca.",
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
