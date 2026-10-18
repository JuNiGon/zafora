import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  availableCategories,
  EmptyState,
  ErrorNotice,
  Filters,
  ProductGrid,
  ProductGridSkeleton,
} from "@/components/store/catalog";
import { useProducts } from "@/contexts/products";
import { selectProducts } from "@/data/products";
import { pageHead } from "@/data/seo";

export const Route = createFileRoute("/colecao")({
  validateSearch: (search: Record<string, unknown>) => ({
    categoria: typeof search["categoria"] === "string" ? search["categoria"] : "",
  }),
  head: () =>
    pageHead(
      "Nossa coleção",
      "Explore camisetas, calças, vestidos, jaquetas e acessórios Záfora. Filtre as peças e descubra o seu essencial.",
    ),
  component: Collection,
});

function Collection() {
  const { categoria } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { products, loading, error } = useProducts();
  const [sort, setSort] = useState("featured");
  const items = selectProducts(products, categoria, "", sort);

  const clear = () => {
    navigate({ search: { categoria: "" }, resetScroll: false });
    setSort("featured");
  };

  return (
    <main className="page-width pb-20">
      <div className="page-intro">
        <span className="eyebrow">Essência em cada detalhe</span>
        <h1>Nossa coleção</h1>
        <p>
          Formas leves, texturas naturais e um jeito próprio de vestir.
          <br />
          Encontre as peças que conversam com você.
        </p>
      </div>
      <div className="catalog-tools">
        <Filters
          value={categoria}
          options={availableCategories(products)}
          onChange={(value) => navigate({ search: { categoria: value }, resetScroll: false })}
        />
        <select
          aria-label="Ordenar produtos"
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="featured">Seleção da marca</option>
          <option value="newest">Mais recentes</option>
          <option value="name">Nome: A–Z</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
        </select>
      </div>
      {error && <ErrorNotice message={error} />}
      <div className="flex justify-between items-center mb-6">
        <p className="demo-note">
          {loading ? "Carregando peças…" : `${items.length} ${items.length === 1 ? "peça" : "peças"}`}
        </p>
        {(categoria || sort !== "featured") && (
          <Button variant="link" size="sm" onClick={clear}>
            Limpar filtros
          </Button>
        )}
      </div>
      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : items.length ? (
        <ProductGrid items={items} />
      ) : (
        <EmptyState onClear={clear} />
      )}
    </main>
  );
}
