import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/store/layout";
import { useAuth } from "@/contexts/auth";

function LoginRequired() {
  const location = useLocation();
  return (
    <main className="page-width empty-state min-h-[50vh]">
      <Lock className="mx-auto text-muted-foreground" size={28} />
      <h1 className="text-5xl my-5">Entre na sua conta</h1>
      <p>Esta área é exclusiva para clientes cadastrados.</p>
      <Button asChild>
        <Link to="/entrar" search={{ redirect: location.href }}>
          Entrar ou criar conta
        </Link>
      </Button>
    </main>
  );
}

/** Renderiza o conteúdo apenas para usuários autenticados. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <LoginRequired />;
  return <>{children}</>;
}

/** Renderiza o conteúdo apenas para administradores (documento `admins/{uid}`). */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <PageLoader label="Verificando acesso…" />;
  if (!user) return <LoginRequired />;
  if (!isAdmin) {
    return (
      <main className="page-width empty-state min-h-[50vh]">
        <Lock className="mx-auto text-muted-foreground" size={28} />
        <h1 className="text-5xl my-5">Acesso restrito</h1>
        <p>Esta área é exclusiva da administração da loja.</p>
        <p className="demo-note">
          Se você é o responsável pela loja, cadastre este identificador na coleção <code>admins</code> do
          Firestore e recarregue a página:
          <br />
          <code className="uid-code">{user.uid}</code>
        </p>
        <Button asChild variant="outline">
          <Link to="/">Voltar à loja</Link>
        </Button>
      </main>
    );
  }
  return <>{children}</>;
}
