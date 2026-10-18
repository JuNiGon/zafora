export type ProductImage = {
  /** URL pública de download (Firebase Storage) ou caminho local de um asset. */
  url: string;
  /** Caminho do arquivo no Storage. Vazio quando a imagem não está no Storage. */
  path: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  colors: string[];
  images: ProductImage[];
  tag: string;
  visible: boolean;
  composition: string;
  care: string;
  createdAt: number;
  updatedAt: number;
};

/** Campos editáveis no painel administrativo. */
export type ProductInput = Omit<Product, "id" | "images" | "createdAt" | "updatedAt">;

export type CartItem = {
  /** Identificador único da linha: produto + tamanho + cor. */
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
};
