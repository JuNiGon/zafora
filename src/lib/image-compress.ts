/**
 * Redimensiona e comprime imagens no navegador, devolvendo uma data URL
 * (`data:image/webp;base64,...`) pronta para ser gravada no Firestore.
 *
 * O Firestore aceita até 1 MiB por documento, então cada foto é reduzida
 * até caber no limite de caracteres informado.
 */

type CompressOptions = {
  /** Maior lado da imagem final, em pixels. */
  maxDimension: number;
  /** Tamanho máximo da data URL, em caracteres (~ bytes). */
  maxChars: number;
};

const QUALITIES = [0.82, 0.74, 0.66, 0.58, 0.5, 0.42];

function loadImage(source: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => {
      if (typeof source !== "string") URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      if (typeof source !== "string") URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };
    img.src = url;
  });
}

let webpSupport: boolean | null = null;
function supportsWebp() {
  if (webpSupport === null) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    webpSupport = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  }
  return webpSupport;
}

export async function compressImage(source: Blob | string, { maxDimension, maxChars }: CompressOptions) {
  const img = await loadImage(source);
  const type = supportsWebp() ? "image/webp" : "image/jpeg";
  let scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));

  for (let attempt = 0; attempt < 6; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Seu navegador não permite processar imagens.");
    // Fundo branco para PNGs com transparência convertidos em JPEG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    for (const quality of QUALITIES) {
      const dataUrl = canvas.toDataURL(type, quality);
      if (dataUrl.length <= maxChars) return dataUrl;
    }
    scale *= 0.8;
  }
  throw new Error("Imagem muito grande mesmo após a compressão.");
}

/** Foto da galeria (página do produto). */
export const compressGalleryImage = (source: Blob | string) =>
  compressImage(source, { maxDimension: 1200, maxChars: 170_000 });

/** Miniatura usada nas listagens, no carrinho e no painel. */
export const compressCoverImage = (source: Blob | string) =>
  compressImage(source, { maxDimension: 520, maxChars: 45_000 });
