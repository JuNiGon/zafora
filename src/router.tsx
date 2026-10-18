import { createRouter, Link, type ErrorComponentProps } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultError({ error }: ErrorComponentProps) {
  return (
    <main className="empty-state">
      <h1 className="text-4xl">Não foi possível abrir esta página.</h1>
      <p>
        {error instanceof Error
          ? "Tente novamente ou explore nossa coleção."
          : "Volte ao início para continuar."}
      </p>
      <Link to="/" className="text-link">
        Voltar ao início
      </Link>
    </main>
  );
}

export const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultPreload: "intent",
  defaultErrorComponent: DefaultError,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
