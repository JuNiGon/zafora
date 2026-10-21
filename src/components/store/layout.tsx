import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Heart,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { brand, whatsappUrl } from "@/data/config";
import { useAuth } from "@/contexts/auth";
import { useCart } from "@/contexts/cart";

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const { isAdmin } = useAuth();
  return (
    <nav className="nav-links" aria-label="Navegação principal">
      <Link to="/" activeOptions={{ exact: true }} onClick={onNavigate}>
        Início
      </Link>
      <Link to="/colecao" search={{ categoria: "" }} onClick={onNavigate}>
        Coleção
      </Link>
      <Link to="/sobre" onClick={onNavigate}>
        Sobre a marca
      </Link>
      <Link to="/contato" onClick={onNavigate}>
        Contato
      </Link>
      {isAdmin && (
        <Link to="/admin" onClick={onNavigate}>
          Painel
        </Link>
      )}
    </nav>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { count } = useCart();

  return (
    <>
      <div className="announcement">
        {brand.announcement} <span aria-hidden="true">↗</span>
      </div>
      <header className="site-header page-width">
        <Button
          className="mobile-menu-toggle"
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X /> : <Menu />}
        </Button>
        <Nav />
        <Link to="/" className="wordmark" aria-label="Záfora — início">
          ZÁFORA
        </Link>
        <div className="header-tools">
          <Button asChild variant="ghost" size="icon" className="header-search">
            <Link to="/busca" search={{ q: "" }} aria-label="Buscar produtos" title="Buscar produtos">
              <Search size={19} />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon">
            {user ? (
              <Link to="/conta" aria-label="Minha conta" title="Minha conta">
                <User size={19} />
              </Link>
            ) : (
              <Link to="/entrar" aria-label="Entrar ou criar conta" title="Entrar">
                <User size={19} />
              </Link>
            )}
          </Button>
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link
              to="/carrinho"
              aria-label={`Carrinho com ${count} ${count === 1 ? "item" : "itens"}`}
              title="Carrinho"
            >
              <ShoppingBag size={19} />
              {count > 0 && (
                <span className="cart-badge" aria-hidden="true">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </header>
      {open && (
        <div id="mobile-navigation" className="mobile-nav sm:hidden">
          <Nav onNavigate={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}

export function Footer() {
  const whatsappLink = whatsappUrl("Olá! Vim pelo site da Záfora e gostaria de mais informações.");
  return (
    <footer className="footer">
      <div className="page-width footer-grid">
        <div className="footer-brand">
          <Link to="/" className="wordmark">
            ZÁFORA
          </Link>
          <p>
            O essencial tem personalidade.
            <br />
            Vista o que faz sentido para você.
          </p>
          <address className="footer-address">
            <a href={brand.mapsUrl} target="_blank" rel="noopener noreferrer">
              {brand.address}
            </a>
          </address>
        </div>
        <div>
          <h3>Explore</h3>
          <div className="footer-links">
            <Link to="/">Início</Link>
            <Link to="/colecao" search={{ categoria: "" }}>
              Coleção
            </Link>
            <Link to="/sobre">Sobre a marca</Link>
            <Link to="/busca" search={{ q: "" }}>
              Buscar uma peça
            </Link>
          </div>
        </div>
        <div>
          <h3>Sua compra</h3>
          <div className="footer-links">
            <Link to="/carrinho">Carrinho</Link>
            <Link to="/conta">Minha conta</Link>
            <Link to="/contato">
              Fale com a Záfora <ArrowUpRight size={12} />
            </Link>
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                WhatsApp {brand.whatsappDisplay}
              </a>
            )}
          </div>
        </div>
        <div>
          <h3>Acompanhe</h3>
          <div className="footer-links">
            {brand.instagramUrl ? (
              <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer">
                Instagram {brand.instagramHandle} ↗
              </a>
            ) : (
              <span className="demo-note">Instagram · em breve</span>
            )}
            {brand.pinterestUrl ? (
              <a href={brand.pinterestUrl} target="_blank" rel="noopener noreferrer">
                Pinterest ↗
              </a>
            ) : (
              <span className="demo-note">Pinterest · em breve</span>
            )}
          </div>
        </div>
      </div>
      <div className="page-width footer-bottom">
        <span>© {new Date().getFullYear()} Záfora. Todos os direitos reservados.</span>
        <span>Frete e pagamento combinados diretamente pelo WhatsApp.</span>
      </div>
    </footer>
  );
}

export function Benefits() {
  return (
    <div className="page-width benefits">
      <div className="benefit">
        <Heart size={22} />
        <div>
          <strong>Um atendimento mais próximo</strong>
          <p>Converse sobre as peças e suas escolhas.</p>
        </div>
      </div>
      <div className="benefit">
        <MessageCircle size={22} />
        <div>
          <strong>Finalize pelo WhatsApp</strong>
          <p>Monte seu carrinho e combine frete e pagamento com a marca.</p>
        </div>
      </div>
      <div className="benefit">
        <Sparkles size={22} />
        <div>
          <strong>Seu estilo, sua expressão</strong>
          <p>Explore novas formas de vestir o essencial.</p>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <main className="page-width empty-state min-h-[55vh]">
      <span className="eyebrow">Záfora · 404</span>
      <h1 className="text-6xl mt-6 mb-5">Um caminho diferente.</h1>
      <p>Esta página não foi encontrada. Sua próxima descoberta está na coleção.</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link to="/">Voltar ao início</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/colecao" search={{ categoria: "" }}>
            Conhecer a coleção
          </Link>
        </Button>
      </div>
    </main>
  );
}

export function PageLoader({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
