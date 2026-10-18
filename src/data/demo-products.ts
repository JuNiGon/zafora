import camiseta from "@/assets/camiseta-essencial.jpg";
import camisetaDetail from "@/assets/camiseta-essencial-detalhe.jpg";
import calca from "@/assets/calca-areia.jpg";
import calcaDetail from "@/assets/calca-areia-detalhe.jpg";
import vestido from "@/assets/vestido-aurora.jpg";
import vestidoDetail from "@/assets/vestido-aurora-detalhe.jpg";
import blazer from "@/assets/blazer-horizonte.jpg";
import blazerDetail from "@/assets/blazer-horizonte-detalhe.jpg";
import oliva from "@/assets/vestido-oliva.jpg";
import olivaDetail from "@/assets/vestido-oliva-detalhe.jpg";
import jaqueta from "@/assets/jaqueta-terra.jpg";
import jaquetaDetail from "@/assets/jaqueta-terra-detalhe.jpg";
import bolsa from "@/assets/bolsa-raiz.jpg";
import bolsaDetail from "@/assets/bolsa-raiz-detalhe.jpg";
import regata from "@/assets/regata-trama.jpg";
import regataDetail from "@/assets/regata-trama-detalhe.jpg";
import type { ProductInput } from "@/types/store";

/**
 * Peças iniciais da vitrine. Podem ser importadas para o Firestore pelo painel
 * administrativo (botão "Importar peças iniciais") e depois editadas ou excluídas.
 */
export type DemoProduct = ProductInput & { imageFiles: string[] };

const sizes = ["P", "M", "G", "GG"];

export const demoProducts: DemoProduct[] = [
  {
    slug: "camiseta-essencial",
    name: "Camiseta Essencial",
    category: "Camisetas",
    description:
      "O ponto de partida de um guarda-roupa leve. Camiseta de toque macio, modelagem reta e decote redondo, para acompanhar o seu ritmo com simplicidade.",
    price: 129,
    imageFiles: [camiseta, camisetaDetail],
    colors: ["Off-white"],
    sizes,
    tag: "Destaque",
    visible: true,
    composition: "100% algodão.",
    care: "Lavar à mão com água fria e secar à sombra.",
  },
  {
    slug: "calca-areia",
    name: "Calça Areia",
    category: "Calças",
    description:
      "Linhas amplas, cintura alta e movimento natural. Uma calça de inspiração em alfaiataria com textura de linho, perfeita para composições descomplicadas.",
    price: 289,
    imageFiles: [calca, calcaDetail],
    colors: ["Areia"],
    sizes: ["36", "38", "40", "42", "44"],
    tag: "Destaque",
    visible: true,
    composition: "70% viscose, 30% linho.",
    care: "Lavar delicadamente, sem alvejante.",
  },
  {
    slug: "vestido-aurora",
    name: "Vestido Aurora",
    category: "Vestidos",
    description:
      "Um vestido que traduz presença em movimento. Comprimento midi, alças largas e silhueta fluida em um tom vinho profundo. Para dias que pedem um toque especial.",
    price: 359,
    imageFiles: [vestido, vestidoDetail],
    colors: ["Vinho"],
    sizes,
    tag: "Novidade",
    visible: true,
    composition: "100% viscose.",
    care: "Lavar à mão e passar em temperatura baixa.",
  },
  {
    slug: "blazer-horizonte",
    name: "Blazer Horizonte",
    category: "Jaquetas",
    description:
      "Alfaiataria com uma atitude contemporânea. Blazer de caimento relaxado e corte limpo, pensado para ser usado aberto e criar sobreposições versáteis.",
    price: 429,
    imageFiles: [blazer, blazerDetail],
    colors: ["Grafite"],
    sizes,
    tag: "Destaque",
    visible: true,
    composition: "",
    care: "",
  },
  {
    slug: "vestido-oliva",
    name: "Vestido Oliva",
    category: "Vestidos",
    description:
      "Leveza em sua forma mais natural. Vestido longo de alças e corte amplo, com textura de linho e um verde oliva que aproxima o vestir da natureza.",
    price: 389,
    imageFiles: [oliva, olivaDetail],
    colors: ["Oliva"],
    sizes,
    tag: "Novidade",
    visible: true,
    composition: "",
    care: "",
  },
  {
    slug: "jaqueta-terra",
    name: "Jaqueta Terra",
    category: "Jaquetas",
    description:
      "Uma sobreposição de personalidade. Jaqueta curta com bolsos frontais, acabamento utilitário e tom terroso, para combinar com texturas e proporções diferentes.",
    price: 329,
    imageFiles: [jaqueta, jaquetaDetail],
    colors: ["Terra"],
    sizes,
    tag: "",
    visible: true,
    composition: "",
    care: "",
  },
  {
    slug: "bolsa-raiz",
    name: "Bolsa Raiz",
    category: "Acessórios",
    description:
      "Textura natural para acompanhar os seus dias. Bolsa em trama de palha com alças de aparência de couro e espaço para os seus essenciais.",
    price: 219,
    imageFiles: [bolsa, bolsaDetail],
    colors: ["Natural"],
    sizes: [],
    tag: "",
    visible: true,
    composition: "",
    care: "",
  },
  {
    slug: "regata-trama",
    name: "Regata Trama",
    category: "Camisetas",
    description:
      "Trama delicada, toque suave e linhas essenciais. Regata de malha canelada com decote redondo, para compor sobreposições ou deixar a textura falar por si.",
    price: 159,
    imageFiles: [regata, regataDetail],
    colors: ["Off-white"],
    sizes,
    tag: "Novidade",
    visible: true,
    composition: "",
    care: "",
  },
];
