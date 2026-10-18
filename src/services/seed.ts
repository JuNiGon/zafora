import { demoProducts } from "@/data/demo-products";
import { compressGalleryImage } from "@/lib/image-compress";
import { newProductId, saveProduct } from "./products";

/**
 * Copia as peças iniciais (fotos incluídas no projeto) para o Firestore.
 * Produtos cujo slug já existe são ignorados, então pode ser executado mais de uma vez.
 */
export async function importDemoProducts(
  existingSlugs: string[],
  onProgress?: (done: number, total: number) => void,
) {
  const pending = demoProducts.filter((p) => !existingSlugs.includes(p.slug));
  let done = 0;
  onProgress?.(done, pending.length);

  for (const { imageFiles, ...input } of pending) {
    const images: string[] = [];
    for (const src of imageFiles) {
      const blob = await fetch(src).then((res) => res.blob());
      images.push(await compressGalleryImage(blob));
    }
    await saveProduct(newProductId(), input, images, true);
    done += 1;
    onProgress?.(done, pending.length);
  }

  return pending.length;
}
