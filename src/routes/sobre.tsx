import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import hero from "@/assets/editorial-hero.jpg";
import storeBags from "@/assets/loja-bolsas.jpg";
import { brand } from "@/data/config";
import { pageHead } from "@/data/seo";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/store/catalog";
import { useProducts } from "@/contexts/products";
import { selectProducts } from "@/data/products";

export const Route = createFileRoute("/sobre")({
  head: () =>
    pageHead(
      "Sobre a marca",
      "O universo Záfora: uma proposta de moda que encontra beleza na simplicidade, nas texturas e na expressão pessoal.",
    ),
  component: About,
});

const values = [
  ["Estilo", "Linhas contemporâneas e combinações que acolhem diferentes formas de expressão."],
  ["Qualidade", "Um olhar atento à textura, ao caimento e aos detalhes de cada peça."],
  ["Personalidade", "Peças que não definem quem você é. Deixam você se revelar."],
] as const;

function About() {
  const { products } = useProducts();
  const picks = selectProducts(products).slice(0, 4);

  return (
    <main>
      <section className="hero">
        <img
          src={hero}
          alt="O universo editorial da Záfora, com formas leves e cores naturais"
          width={1920}
          height={1024}
        />
        <div className="hero-content page-width">
          <span className="eyebrow">O universo Záfora</span>
          <h1>
            ZÁFORA
            <br />
            <em>Vestir é expressar.</em>
          </h1>
          <p className="hero-description">Mais do que vestir, expressar identidade.</p>
        </div>
      </section>

      <section className="page-width section max-w-3xl text-center">
        <span className="eyebrow">Nossa proposta</span>
        <h2 className="text-5xl my-6">O essencial tem personalidade.</h2>
        <p className="text-sm leading-loose">{brand.story}</p>
      </section>

      <section className="editorial-band">
        <img
          className="store-photo store-photo--bags"
          src={storeBags}
          alt="Bolsas de festa e acessórios expostos na loja Záfora"
          loading="lazy"
          width={1086}
          height={1448}
        />
        <div className="editorial-copy">
          <span className="eyebrow">História e propósito</span>
          <h2>
            Um espaço para
            <br />a nossa história.
          </h2>
          <p>{brand.history}</p>
        </div>
      </section>

      <section className="page-width section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-14">
          {values.map(([title, text]) => (
            <div key={title}>
              <h2 className="text-4xl mb-4">{title}</h2>
              <p className="text-sm leading-loose text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
        {picks.length > 0 && <ProductGrid items={picks} />}
      </section>

      <section className="collection-cta">
        <span className="eyebrow">Conheça de perto</span>
        <h2>Encontre o que faz sentido para você.</h2>
        <Button asChild variant="editorial" size="lg">
          <Link to="/colecao" search={{ categoria: "" }}>
            Conheça a coleção <ArrowUpRight />
          </Link>
        </Button>
      </section>
    </main>
  );
}
