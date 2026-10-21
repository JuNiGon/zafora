import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  availableCategories,
  EmptyState,
  Filters,
  ProductGrid,
  ProductGridSkeleton,
} from "@/components/store/catalog";
import { useProducts } from "@/contexts/products";
import { selectProducts } from "@/data/products";
import { pageHead } from "@/data/seo";

export const Route = createFileRoute("/busca")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s["q"] === "string" ? s["q"] : "" }),
  head: () =>
    pageHead(
      "Encontre sua peça",
      "Busque na coleção Záfora por nome, descrição ou categoria e descubra suas próximas peças favoritas.",
    ),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { products, loading } = useProducts();
  const [category, setCategory] = useState("");
  // O texto digitado fica só no campo; a busca é aplicada ao pressionar Enter ou clicar na lupa.
  const [term, setTerm] = useState(q);
  useEffect(() => setTerm(q), [q]);
  const items = selectProducts(products, category, q);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({ search: { q: term.trim() }, replace: true, resetScroll: false });
  }

  return (
    <main className="page-width pb-20">
      <div className="page-intro">
        <span className="eyebrow">Uma nova descoberta</span>
        <h1>O que você procura?</h1>
        <p>Encontre uma peça, uma textura ou um novo essencial.</p>
        <form className="search-form" role="search" onSubmit={handleSearch}>
          <input
            className="search-input"
            type="search"
            placeholder="Busque por peça, descrição ou categoria"
            aria-label="Pesquisar produtos"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <Button type="submit" size="icon" aria-label="Pesquisar">
            <Search />
          </Button>
        </form>
      </div>
      <div className="catalog-tools">
        <Filters value={category} onChange={setCategory} options={availableCategories(products)} />
        <Link className="text-link" to="/colecao" search={{ categoria: "" }}>
          Voltar à coleção
        </Link>
      </div>
      <p className="demo-note mb-6">
        {items.length} {items.length === 1 ? "peça encontrada" : "peças encontradas"}
      </p>
      {loading ? (
        <ProductGridSkeleton />
      ) : items.length ? (
        <ProductGrid items={items} />
      ) : (
        <EmptyState
          title="Ainda não encontramos essa peça"
          description="Tente um termo como linho, vestido ou camiseta, ou explore outra categoria."
          onClear={() => {
            setCategory("");
            setTerm("");
            navigate({ search: { q: "" }, resetScroll: false });
          }}
        />
      )}
    </main>
  );
}
