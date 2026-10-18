import { createRootRoute, HeadContent, Link, Outlet, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Header, Footer, NotFoundPage } from "@/components/store/layout";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Não foi possível carregar esta página
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tente novamente ou volte ao início para continuar explorando.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Tentar novamente
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: "Záfora — Moda com essência" },
      { name: "description", content: "O universo Záfora: moda contemporânea e personalidade." },
      { property: "og:title", content: "Záfora — Moda com essência" },
      { property: "og:description", content: "O universo Záfora: moda contemporânea e personalidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Header />
      <Outlet />
      <Footer />
      <Toaster position="bottom-right" richColors={false} closeButton />
    </>
  );
}
