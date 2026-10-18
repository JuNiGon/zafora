export function pageHead(title: string, description: string) {
  const fullTitle = `${title} | Záfora`;
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}

/** Páginas privadas (conta, carrinho, painel) não devem ser indexadas. */
export function privateHead(title: string) {
  return { meta: [{ title: `${title} | Záfora` }, { name: "robots", content: "noindex" }] };
}
