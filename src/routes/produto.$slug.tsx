import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, ImageOff, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, ProductGrid, SectionHeading } from "@/components/store/catalog";
import { NotFoundPage } from "@/components/store/layout";
import { useProduct } from "@/contexts/products";
import { useCart } from "@/contexts/cart";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { formatPrice, selectionError, type Product } from "@/data/products";
import { fetchProductImages } from "@/services/products";

export const Route = createFileRoute("/produto/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { product, loading, products } = useProduct(slug);

  useEffect(() => {
    if (product) document.title = `${product.name} | Záfora`;
  }, [product]);

  if (loading) return <ProductSkeleton />;
  if (!product) return <NotFoundPage />;

  const related = products
    .filter((p) => p.id !== product.id)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 4);

  return <ProductView key={product.id} product={product} related={related} />;
}

function ProductView({ product, related }: { product: Product; related: Product[] }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [image, setImage] = useState(0);
  const [color, setColor] = useState(product.colors.length === 1 ? (product.colors[0] ?? "") : "");
  const [size, setSize] = useState(product.sizes.length === 1 ? (product.sizes[0] ?? "") : "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  // Começa com a miniatura (já carregada) e troca pela galeria completa assim que chegar.
  const [gallery, setGallery] = useState(product.images);
  useEffect(() => {
    let active = true;
    fetchProductImages(product.id)
      .then((urls) => {
        if (active && urls.length) setGallery(urls.map((url) => ({ url, path: "" })));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [product.id]);
  const current = gallery[image] ?? gallery[0];

  function add(goToCart: boolean) {
    const validation = selectionError(product, color, size);
    setError(validation);
    if (validation) return;
    addItem({ product, size, color, quantity });
    if (goToCart) {
      navigate({ to: "/carrinho" });
      return;
    }
    toast.success(`${product.name} adicionado ao carrinho`, {
      description: [size && `Tamanho ${size}`, color, `${quantity} un.`].filter(Boolean).join(" · "),
      action: { label: "Ver carrinho", onClick: () => navigate({ to: "/carrinho" }) },
    });
  }

  return (
    <main className="page-width">
      <Breadcrumb name={product.name} />
      <div className="product-detail">
        <div>
          {current ? (
            <img
              key={current.url}
              className="gallery-main"
              src={current.url}
              alt={`${product.name} — imagem ${image + 1} de ${gallery.length}`}
              width={768}
              height={960}
            />
          ) : (
            <div className="gallery-main product-photo-empty">
              <ImageOff size={28} aria-hidden="true" />
            </div>
          )}
          {gallery.length > 1 && (
            <div className="gallery-thumbs">
              {gallery.map((img, i) => (
                <Button
                  key={i}
                  className="gallery-thumb"
                  variant="outline"
                  aria-label={`Ver imagem ${i + 1}`}
                  aria-pressed={image === i}
                  onClick={() => setImage(i)}
                >
                  <img src={img.url} alt="" width={72} height={88} />
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-copy">
          <span className="eyebrow text-muted-foreground">
            {product.category} {product.tag && `· ${product.tag}`}
          </span>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <p className="demo-note">Valor base · frete e pagamento combinados pelo WhatsApp.</p>
          <p className="detail-description">{product.description}</p>

          {product.colors.length > 0 && (
            <fieldset className="option-group">
              <legend>Cor{color && ` — ${color}`}</legend>
              <div className="option-row">
                {product.colors.map((c) => (
                  <Button
                    key={c}
                    variant={color === c ? "selected" : "outline"}
                    aria-pressed={color === c}
                    onClick={() => {
                      setColor(c);
                      setError("");
                    }}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </fieldset>
          )}

          {product.sizes.length > 0 && (
            <fieldset className="option-group">
              <legend>Tamanho{size && ` — ${size}`}</legend>
              <div className="option-row">
                {product.sizes.map((s) => (
                  <Button
                    className="min-w-11 min-h-11"
                    key={s}
                    variant={size === s ? "selected" : "outline"}
                    aria-pressed={size === s}
                    onClick={() => {
                      setSize(s);
                      setError("");
                    }}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="option-group">
            <legend>Quantidade</legend>
            <QuantityStepper value={quantity} onChange={setQuantity} />
          </fieldset>

          {error && (
            <p className="validation" role="alert">
              {error}
            </p>
          )}
          <div className="grid gap-3">
            <Button size="lg" className="w-full whitespace-normal" onClick={() => add(false)}>
              <ShoppingBag />
              Adicionar ao carrinho
            </Button>
            <Button size="lg" variant="outline" className="w-full whitespace-normal" onClick={() => add(true)}>
              Comprar agora <ArrowUpRight />
            </Button>
          </div>
          <p className="demo-note mt-3">
            Ao finalizar, você será direcionado ao WhatsApp da Záfora com o resumo do pedido.
          </p>

          {(product.composition || product.care) && (
            <div className="details-list">
              {product.composition && (
                <details>
                  <summary>Tecido e composição</summary>
                  <p>{product.composition}</p>
                </details>
              )}
              {product.care && (
                <details>
                  <summary>Cuidados com a peça</summary>
                  <p>{product.care}</p>
                </details>
              )}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <SectionHeading eyebrow="Outros encontros" title="Você também pode gostar" linkText="Ver a coleção" />
          <ProductGrid items={related} />
        </section>
      )}
    </main>
  );
}

function ProductSkeleton() {
  return (
    <main className="page-width" aria-busy="true">
      <div className="breadcrumb">
        <Link to="/colecao" search={{ categoria: "" }}>
          Coleção
        </Link>
      </div>
      <div className="product-detail">
        <Skeleton className="aspect-[4/5] w-full rounded-none" />
        <div className="detail-copy grid content-start gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </main>
  );
}
