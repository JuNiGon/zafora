import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequireAdmin } from "@/components/auth/guards";
import { AdminProductsProvider } from "@/components/admin/admin-products";
import { privateHead } from "@/data/seo";

export const Route = createFileRoute("/admin")({
  head: () => privateHead("Painel"),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RequireAdmin>
      <AdminProductsProvider>
        <main className="page-width admin">
          <div className="admin-header">
            <div>
              <span className="eyebrow text-muted-foreground">Painel da loja</span>
              <h1>Produtos</h1>
            </div>
            <nav className="admin-nav" aria-label="Navegação do painel">
              <Link to="/admin" activeOptions={{ exact: true }}>
                Catálogo
              </Link>
              <Button asChild size="sm">
                <Link to="/admin/produtos/novo">
                  <Plus /> Novo produto
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/colecao" search={{ categoria: "" }}>
                  Ver loja <ExternalLink />
                </Link>
              </Button>
            </nav>
          </div>
          <Outlet />
        </main>
      </AdminProductsProvider>
    </RequireAdmin>
  );
}
