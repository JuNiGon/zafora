import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import hero from "@/assets/editorial-hero.jpg";
import editorial from "@/assets/brand-editorial.jpg";
import { Button } from "@/components/ui/button";
import {
  availableCategories,
  ErrorNotice,
  ProductGrid,
  ProductGridSkeleton,
  SectionHeading,
} from "@/components/store/catalog";
import { Benefits } from "@/components/store/layout";
import { useProducts } from "@/contexts/products";
import { coverImage, selectProducts } from "@/data/products";
import { pageHead } from "@/data/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Moda com essência",
      "Conheça a Záfora: moda contemporânea, texturas naturais e personalidade. Monte seu carrinho e finalize pelo WhatsApp.",
    ),
  component: Index,
});

function Index() {
  const { products, loading, error } = useProducts();
  const featured = selectProducts(products).slice(0, 4);
  const newest = selectProducts(products, "", "", "newest")
    .sort((a, b) => Number(b.tag === "Novidade") - Number(a.tag === "Novidade"))
    .slice(0, 4);
  const categoryCards = availableCategories(products)
    .map((category) => ({ category, product: products.find((p) => p.category === category && coverImage(p)) }))
    .slice(0, 5);

  return (
    <main>
      <section className="hero">
        <img
          src={hero}
          alt="Editorial Záfora: alfaiataria em linho e vestido vinho sob a luz natural"
          width={1920}
          height={1024}
          fetchPriority="high"
        />
        <div className="hero-content page-width reveal">
          <span className="eyebrow">Coleção Essência · um novo olhar</span>
          <h1>
            ZÁFORA
            <br />
            <em>Naturalmente você.</em>
          </h1>
          <p className="hero-description">
            Texturas que acolhem. Formas que libertam.
            <br />
            Peças para expressar a sua essência.
          </p>
          <Button asChild size="lg">
            <Link to="/colecao" search={{ categoria: "" }}>
              Conheça a coleção <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <div className="hero-bottom page-width">
          <span>O essencial, sob uma nova perspectiva.</span>
          <span>Explore a sua essência ↓</span>
        </div>
      </section>

      {error && (
        <div className="page-width pt-10">
          <ErrorNotice message={error} />
        </div>
      )}

      {categoryCards.length > 0 && (
        <section className="page-width section">
          <SectionHeading eyebrow="Um universo de possibilidades" title="Encontre o seu essencial" />
          <div className="category-grid">
            {categoryCards.map(({ category, product }) => (
              <Link key={category} to="/colecao" search={{ categoria: category }} className="category-item">
                <div className="category-image">
                  {product && (
                    <img
                      src={coverImage(product)}
                      alt={`Explorar ${category.toLowerCase()}`}
                      loading="lazy"
                      width={768}
                      height={960}
                    />
                  )}
                </div>
                <div className="category-title">
                  <span>{category}</span>
                  <ArrowUpRight size={15} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={`page-width section ${categoryCards.length ? "pt-0" : ""}`}>
        <SectionHeading eyebrow="Escolhas que inspiram" title="Destaques da coleção" linkText="Ver toda a coleção" />
        {loading ? (
          <ProductGridSkeleton />
        ) : featured.length ? (
          <ProductGrid items={featured} />
        ) : (
          <p className="demo-note">Novas peças chegam em breve. Volte para conferir!</p>
        )}
      </section>

      <section className="editorial-band">
        <img src={editorial} alt="Modelo com conjunto de linho em cenário natural" width={1536} height={1024} loading="lazy" />
        <div className="editorial-copy">
          <span className="eyebrow text-muted-foreground">A essência Záfora</span>
          <h2>
            Menos excesso.
            <br />
            Mais de você.
          </h2>
          <p>
            Acreditamos na beleza de um vestir que faz sentido. Em texturas, movimentos e detalhes que revelam
            personalidade — sem precisar dizer muito.
          </p>
          <Link className="text-link" to="/sobre">
            Conheça o universo da marca <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      {newest.length > 0 && (
        <section className="page-width section">
          <SectionHeading eyebrow="Novos encontros" title="Acabaram de chegar" linkText="Explorar novidades" />
          <ProductGrid items={newest} />
        </section>
      )}

      <section className="collection-cta">
        <span className="eyebrow">Sua próxima descoberta</span>
        <h2>Vista a sua própria essência.</h2>
        <Button asChild size="lg" variant="editorial">
          <Link to="/colecao" search={{ categoria: "" }}>
            Explore a coleção <ArrowRight />
          </Link>
        </Button>
      </section>
      <Benefits />
    </main>
  );
}
