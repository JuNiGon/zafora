import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Instagram, MapPin, MessageCircle } from "lucide-react";
import storeInterior from "@/assets/loja-interior.jpg";
import { brand, whatsappUrl } from "@/data/config";
import { pageHead } from "@/data/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contato")({
  head: () =>
    pageHead(
      "Vamos conversar?",
      "Fale com a Záfora sobre as peças da coleção. Pedidos, frete e pagamento são combinados pelo WhatsApp.",
    ),
  component: Contact,
});

function Contact() {
  const url = whatsappUrl("Olá! Conheci a Záfora pelo site e gostaria de mais informações sobre a coleção.");

  return (
    <main className="page-width">
      <div className="page-intro">
        <span className="eyebrow">Um contato mais próximo</span>
        <h1>Vamos conversar?</h1>
        <p>
          Sobre uma peça, uma dúvida ou uma nova possibilidade.
          <br />
          Será um prazer conhecer o que você procura.
        </p>
      </div>
      <div className="contact-layout">
        <img
          className="contact-photo store-photo"
          src={storeInterior}
          alt="Interior da loja Záfora, com araras de vestidos coloridos e vitrine de acessórios"
          width={1086}
          height={1448}
        />
        <div className="contact-copy">
          <h2>
            Sua escolha começa
            <br />
            com uma conversa.
          </h2>
          <p>
            Monte seu carrinho no site e finalize pelo WhatsApp: por lá combinamos o frete, a forma de pagamento e
            tiramos qualquer dúvida sobre as peças.
          </p>
          {url && (
            <Button asChild size="lg">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <MessageCircle />
                Conversar pelo WhatsApp <ArrowUpRight />
              </a>
            </Button>
          )}
          <div className="contact-info">
            <div>
              <h3>Atendimento</h3>
              <p>{brand.serviceHours || "Respondemos pelo WhatsApp o mais breve possível."}</p>
              {url && (
                <a className="text-link mt-3" href={url} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={16} /> WhatsApp {brand.whatsappDisplay} <ArrowUpRight size={14} />
                </a>
              )}
            </div>
            <div>
              <h3>Endereço</h3>
              <a className="text-link" href={brand.mapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin size={16} /> {brand.address} <ArrowUpRight size={14} />
              </a>
            </div>
            {(brand.instagramUrl || brand.pinterestUrl) && (
              <div>
                <h3>Acompanhe a Záfora</h3>
                {brand.instagramUrl && (
                  <a className="text-link" href={brand.instagramUrl} target="_blank" rel="noopener noreferrer">
                    <Instagram size={16} /> {brand.instagramHandle} <ArrowUpRight size={14} />
                  </a>
                )}
                {brand.pinterestUrl && (
                  <a className="text-link mt-3" href={brand.pinterestUrl} target="_blank" rel="noopener noreferrer">
                    Pinterest <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            )}
            {brand.email && (
              <div>
                <h3>E-mail</h3>
                <a className="text-link" href={`mailto:${brand.email}`}>
                  {brand.email}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
