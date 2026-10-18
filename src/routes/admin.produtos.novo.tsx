import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/admin/product-form";
import { useAdminCatalog } from "@/components/admin/admin-products";

export const Route = createFileRoute("/admin/produtos/novo")({
  component: NewProduct,
});

function NewProduct() {
  const { products } = useAdminCatalog();
  return (
    <>
      <h2 className="admin-subtitle">Novo produto</h2>
      <ProductForm takenSlugs={products.map((p) => p.slug)} />
    </>
  );
}
