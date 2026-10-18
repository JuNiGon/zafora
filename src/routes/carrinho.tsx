import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, ImageOff, MessageCircle, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { PageLoader } from "@/components/store/layout";
import { displayName, useAuth } from "@/contexts/auth";
import { useCart } from "@/contexts/cart";
import { useProducts } from "@/contexts/products";
import { coverImage, formatPrice } from "@/data/products";
import { privateHead } from "@/data/seo";
import { orderTotal, orderWhatsappUrl } from "@/lib/order-message";
import type { CartItem } from "@/types/store";

export const Route = createFileRoute("/carrinho")({
  head: () => privateHead("Carrinho"),
  component: CartPage,
});

type CartLine = CartItem & { available: boolean };

function CartPage() {
  const { items, updateQuantity, removeItem, clear } = useCart();
  const { products, loading: productsLoading } = useProducts();
  const { user, profile, loading: authLoading } = useAuth();
  const [sent, setSent] = useState(false);

  // Usa nome e preço atuais do catálogo; itens removidos ou ocultos ficam indisponíveis.
  const lines = useMemo<CartLine[]>(
    () =>
      items.map((item) => {
        const live = products.find((p) => p.id === item.productId);
        if (productsLoading) return { ...item, available: true };
        return live
          ? {
              ...item,
              name: live.name,
              price: live.price,
              slug: live.slug,
              image: coverImage(live) || item.image,
              available: true,
            }
          : { ...item, available: false };
      }),
    [items, products, productsLoading],
  );

  const available = lines.filter((line) => line.available);
  const total = orderTotal(available);
  const pieces = available.reduce((sum, line) => sum + line.quantity, 0);
  const customerName = displayName(user, profile);
  const checkoutUrl = orderWhatsappUrl(
    available,
    user ? { name: customerName, email: user.email ?? "", phone: profile?.phone ?? "" } : undefined,
  );

  if (authLoading) return <PageLoader />;

  if (!items.length) {
    return (
      <main className="page-width empty-state min-h-[50vh]">
        <ShoppingBag className="mx-auto text-muted-foreground" size={30} />
        <h1 className="text-5xl my-5">Seu carrinho está vazio</h1>
        <p>Explore a coleção e adicione as peças que combinam com você.</p>
        <Button asChild>
          <Link to="/colecao" search={{ categoria: "" }}>
            Explorar a coleção
          </Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="page-width pb-20">
      <div className="page-intro">
        <span className="eyebrow">Sua seleção</span>
        <h1>Carrinho</h1>
        <p>Revise as peças e finalize o pedido pelo WhatsApp da Záfora.</p>
      </div>

      <div className="cart-layout">
        <section aria-label="Itens do carrinho">
          <ul className="cart-list">
            {lines.map((line) => (
              <li key={line.key} className={`cart-item ${line.available ? "" : "is-unavailable"}`}>
                <Link to="/produto/$slug" params={{ slug: line.slug }} className="cart-thumb" tabIndex={-1}>
                  {line.image ? (
                    <img src={line.image} alt="" width={96} height={120} loading="lazy" />
                  ) : (
                    <ImageOff size={18} aria-hidden="true" />
                  )}
                </Link>
                <div className="cart-item-body">
                  <div className="cart-item-head">
                    <Link to="/produto/$slug" params={{ slug: line.slug }} className="cart-item-name">
                      {line.name}
                    </Link>
                    <span className="cart-item-total">{formatPrice(line.price * line.quantity)}</span>
                  </div>
                  <p className="cart-item-meta">
                    {[line.size && `Tamanho ${line.size}`, line.color, `${formatPrice(line.price)} cada`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {!line.available && (
                    <p className="validation">Esta peça não está mais disponível e não será incluída no pedido.</p>
                  )}
                  <div className="cart-item-actions">
                    {line.available && (
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(value) => updateQuantity(line.key, value)}
                        label={`Quantidade de ${line.name}`}
                      />
                    )}
                    <Button variant="ghost" size="sm" onClick={() => removeItem(line.key)}>
                      <Trash2 /> Remover
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link className="text-link mt-8" to="/colecao" search={{ categoria: "" }}>
            Continuar comprando <ArrowUpRight size={14} />
          </Link>
        </section>

        <aside className="cart-summary" aria-label="Resumo do pedido">
          <h2>Resumo</h2>
          <dl>
            <div>
              <dt>
                Subtotal ({pieces} {pieces === 1 ? "peça" : "peças"})
              </dt>
              <dd>{formatPrice(total)}</dd>
            </div>
            <div>
              <dt>Frete</dt>
              <dd>A combinar</dd>
            </div>
            <div className="cart-summary-total">
              <dt>Total aproximado</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          <p className="demo-note">
            O valor final, o frete e a forma de pagamento são combinados diretamente com a loja pelo WhatsApp.
          </p>

          {user ? (
            <p className="cart-customer">
              Pedido em nome de <strong>{customerName}</strong>
            </p>
          ) : null}

          {checkoutUrl && available.length > 0 ? (
            user ? (
              <Button asChild size="lg" className="w-full">
                <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" onClick={() => setSent(true)}>
                  <MessageCircle /> Finalizar compra
                </a>
              </Button>
            ) : (
              <div className="grid gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link to="/entrar" search={{ redirect: "/carrinho" }}>
                    Entrar para finalizar
                  </Link>
                </Button>
                <a
                  className="text-link justify-center"
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSent(true)}
                >
                  Finalizar sem cadastro pelo WhatsApp
                </a>
              </div>
            )
          ) : (
            <Button size="lg" className="w-full" disabled>
              Nenhuma peça disponível
            </Button>
          )}

          {sent && (
            <div className="notice" role="status">
              <p>
                Abrimos o WhatsApp com o resumo do seu pedido. É só enviar a mensagem para continuar o atendimento.
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={clear}>
                Esvaziar carrinho
              </Button>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
