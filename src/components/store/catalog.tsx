import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ImageOff, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categories } from "@/data/config";
import { coverImage, formatPrice, type Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const image = coverImage(product);
  return (
    <article className="product-card">
      <Link to="/produto/$slug" params={{ slug: product.slug }} aria-label={`Ver ${product.name}`}>
        <div className="product-photo">
          {image ? (
            <img src={image} alt={product.name} loading="lazy" width={768} height={960} />
          ) : (
            <div className="product-photo-empty">
              <ImageOff size={22} aria-hidden="true" />
            </div>
          )}
          {product.tag && <span className="product-tag">{product.tag}</span>}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <span className="product-price">{formatPrice(product.price)}</span>
        </div>
        {product.colors.length > 0 && <p className="product-colors">{product.colors.join(" · ")}</p>}
      </Link>
    </article>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="product-grid">
      {items.map((p) => (
        <ProductCard product={p} key={p.id} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/5] w-full rounded-none" />
          <Skeleton className="mt-4 h-3 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/** Categorias com pelo menos um produto, na ordem definida em config. */
export function availableCategories(products: Product[]) {
  const used = new Set(products.map((p) => p.category));
  const known = categories.filter((c) => used.has(c));
  const extra = [...used].filter((c) => c && !(categories as readonly string[]).includes(c));
  return [...known, ...extra];
}

export function Filters({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="filters" aria-label="Filtrar por categoria">
      {["Todas", ...options].map((c) => {
        const current = c === "Todas" ? "" : c;
        return (
          <Button
            key={c}
            size="sm"
            variant={value === current ? "selected" : "ghost"}
            aria-pressed={value === current}
            onClick={() => onChange(current)}
          >
            {c}
          </Button>
        );
      })}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  linkText,
}: {
  eyebrow: string;
  title: string;
  linkText?: string;
}) {
  return (
    <div className="section-heading">
      <div className="min-w-0">
        <span className="eyebrow text-muted-foreground">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {linkText && (
        <Link className="text-link" to="/colecao" search={{ categoria: "" }}>
          {linkText}
          <ArrowUpRight size={15} />
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  title = "Nenhuma peça por aqui",
  description = "Experimente outra categoria ou uma nova busca.",
  onClear,
}: {
  title?: string;
  description?: string;
  onClear?: () => void;
}) {
  return (
    <div className="empty-state">
      <SearchX className="mx-auto text-muted-foreground" size={30} />
      <h2>{title}</h2>
      <p>{description}</p>
      {onClear ? (
        <Button variant="outline" onClick={onClear}>
          Limpar filtros
        </Button>
      ) : (
        <Button asChild>
          <Link to="/colecao" search={{ categoria: "" }}>
            Explorar a coleção
          </Link>
        </Button>
      )}
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <p className="notice notice-error" role="alert">
      {message}
    </p>
  );
}

export function Breadcrumb({ name }: { name: string }) {
  return (
    <nav aria-label="Caminho de navegação" className="breadcrumb">
      <Link to="/">Início</Link>
      <span>/</span>
      <Link to="/colecao" search={{ categoria: "" }}>
        Coleção
      </Link>
      <span>/</span>
      <span aria-current="page">{name}</span>
    </nav>
  );
}
