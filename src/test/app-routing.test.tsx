import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

describe("Rotas da aplicação", () => {
  it("encontra uma página para cada rota pública e privada", () => {
    const router = createRouter({ routeTree });
    const paths = [
      "/",
      "/colecao",
      "/sobre",
      "/contato",
      "/busca",
      "/produto/vestido-aurora",
      "/carrinho",
      "/entrar",
      "/conta",
      "/admin",
      "/admin/produtos/novo",
      "/admin/produtos/abc123",
    ];
    for (const path of paths) {
      expect(router.matchRoutes(path).at(-1)?.routeId, path).not.toBe(rootRouteId);
    }
  });
});
