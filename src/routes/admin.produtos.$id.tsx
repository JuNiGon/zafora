import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { useAdminCatalog } from "@/components/admin/admin-products";
import { PageLoader } from "@/components/store/layout";
import { fetchProductImages } from "@/services/products";

export const Route = createFileRoute("/admin/produtos/$id")({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const { products, loading } = useAdminCatalog();
  const product = products.find((p) => p.id === id);
  const [gallery, setGallery] = useState<string[] | null>(null);

  // A galeria completa fica em productImages/{id}; carrega uma vez ao abrir a edição.
  useEffect(() => {
    let active = true;
    setGallery(null);
    fetchProductImages(id)
      .then((images) => active && setGallery(images))
      .catch(() => active && setGallery([]));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading || (product && gallery === null)) return <PageLoader />;
  if (!product) {
    return (
      <div className="empty-state">
        <h2>Produto não encontrado</h2>
        <p>Ele pode ter sido excluído.</p>
        <Link className="text-link" to="/admin">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  // Produtos antigos sem galeria usam a capa como primeira foto.
  const initialImages = gallery?.length ? gallery : product.images.map((img) => img.url);

  return (
    <>
      <h2 className="admin-subtitle">Editar · {product.name}</h2>
      <ProductForm
        key={product.id}
        product={product}
        initialImages={initialImages}
        takenSlugs={products.filter((p) => p.id !== product.id).map((p) => p.slug)}
      />
    </>
  );
}
