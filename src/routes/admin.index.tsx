import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, ImageOff, Pencil, PackageOpen, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageLoader } from "@/components/store/layout";
import { ErrorNotice } from "@/components/store/catalog";
import { useAdminCatalog } from "@/components/admin/admin-products";
import { coverImage, formatPrice, normalize } from "@/data/products";
import { deleteProduct, updateProduct } from "@/services/products";
import { importDemoProducts } from "@/services/seed";
import type { Product } from "@/types/store";

export const Route = createFileRoute("/admin/")({
  component: AdminProducts,
});

function AdminProducts() {
  const { products, loading, error } = useAdminCatalog();
  const [term, setTerm] = useState("");
  const [importing, setImporting] = useState("");

  const filtered = products.filter((p) =>
    normalize(`${p.name} ${p.category} ${p.slug}`).includes(normalize(term.trim())),
  );
  const visibleCount = products.filter((p) => p.visible).length;

  async function handleImport() {
    setImporting("Preparando…");
    try {
      const total = await importDemoProducts(
        products.map((p) => p.slug),
        (done, all) => setImporting(`Importando ${done}/${all}…`),
      );
      toast.success(total ? `${total} peças importadas.` : "As peças iniciais já estão no catálogo.");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao importar. Verifique as regras do Firestore e do Storage.");
    } finally {
      setImporting("");
    }
  }

  if (loading) return <PageLoader label="Carregando catálogo…" />;

  return (
    <>
      {error && <ErrorNotice message={error} />}

      <div className="admin-stats">
        <div>
          <strong>{products.length}</strong>
          <span>produtos</span>
        </div>
        <div>
          <strong>{visibleCount}</strong>
          <span>visíveis na loja</span>
        </div>
        <div>
          <strong>{products.length - visibleCount}</strong>
          <span>ocultos</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state panel">
          <PackageOpen className="mx-auto text-muted-foreground" size={30} />
          <h2>Nenhum produto cadastrado</h2>
          <p>Cadastre a primeira peça ou importe as peças iniciais da vitrine para começar.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/admin/produtos/novo">
                <Plus /> Cadastrar produto
              </Link>
            </Button>
            <Button variant="outline" onClick={() => void handleImport()} disabled={!!importing}>
              <Upload /> {importing || "Importar peças iniciais"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="admin-toolbar">
            <label className="admin-search">
              <Search size={16} aria-hidden="true" />
              <Input
                type="search"
                placeholder="Buscar por nome, categoria ou slug"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                aria-label="Buscar produtos no painel"
              />
            </label>
            <span className="demo-note">
              {filtered.length} de {products.length}
            </span>
          </div>

          <ul className="admin-list">
            {filtered.map((product) => (
              <AdminProductRow key={product.id} product={product} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function AdminProductRow({ product }: { product: Product }) {
  const [busy, setBusy] = useState(false);
  const image = coverImage(product);

  async function toggleVisible(visible: boolean) {
    setBusy(true);
    try {
      await updateProduct(product.id, { visible });
      toast.success(visible ? "Produto visível na loja." : "Produto ocultado da loja.");
    } catch {
      toast.error("Não foi possível alterar a visibilidade.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteProduct(product);
      toast.success(`"${product.name}" excluído.`);
    } catch {
      toast.error("Não foi possível excluir o produto.");
      setBusy(false);
    }
  }

  return (
    <li className="admin-row">
      <div className="admin-thumb">
        {image ? <img src={image} alt="" width={64} height={80} loading="lazy" /> : <ImageOff size={18} />}
      </div>
      <div className="admin-row-main">
        <strong>{product.name}</strong>
        <span>
          {product.category || "Sem categoria"} · {formatPrice(product.price)}
          {product.sizes.length > 0 && ` · ${product.sizes.join(", ")}`}
        </span>
        {product.tag && <span className="admin-pill">{product.tag}</span>}
      </div>
      <label className="admin-visibility">
        <Switch
          checked={product.visible}
          disabled={busy}
          onCheckedChange={(checked) => void toggleVisible(checked)}
          aria-label={`Exibir ${product.name} na loja`}
        />
        <span>{product.visible ? "Visível" : "Oculto"}</span>
      </label>
      <div className="admin-actions">
        {product.visible && (
          <Button asChild variant="ghost" size="icon" title="Ver na loja">
            <Link to="/produto/$slug" params={{ slug: product.slug }} aria-label={`Ver ${product.name} na loja`}>
              <Eye />
            </Link>
          </Button>
        )}
        <Button asChild variant="ghost" size="icon" title="Editar">
          <Link to="/admin/produtos/$id" params={{ id: product.id }} aria-label={`Editar ${product.name}`}>
            <Pencil />
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Excluir" disabled={busy} aria-label={`Excluir ${product.name}`}>
              <Trash2 />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir “{product.name}”?</AlertDialogTitle>
              <AlertDialogDescription>
                O produto e suas imagens serão removidos permanentemente. Para apenas tirá-lo da loja, use a opção
                “Oculto”.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => void handleDelete()}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}
