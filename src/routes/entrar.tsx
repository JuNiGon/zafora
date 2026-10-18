import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoader } from "@/components/store/layout";
import { GoogleIcon } from "@/components/auth/google-icon";
import { authErrorMessage, useAuth } from "@/contexts/auth";
import { privateHead } from "@/data/seo";

/** Aceita apenas caminhos internos para evitar redirecionamentos externos. */
const safeRedirect = (value: unknown) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : undefined;

export const Route = createFileRoute("/entrar")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: safeRedirect(search["redirect"]),
  }),
  head: () => privateHead("Entrar"),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const router = useRouter();
  const { user, loading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [tab, setTab] = useState<"entrar" | "cadastro">("entrar");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const destination = redirect ?? "/conta";

  // Já autenticado (ou login concluído): segue para o destino.
  useEffect(() => {
    if (!loading && user) router.history.replace(destination);
  }, [loading, user, destination, router]);

  if (loading || user) return <PageLoader />;

  async function run(action: () => Promise<void>, success?: string) {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      await action();
      if (success) toast.success(success);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(() => signIn(String(form.get("email")), String(form.get("password"))), "Bem-vinda(o) de volta!");
  }

  function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const password = String(form.get("password"));
    const problem =
      name.length < 2
        ? "Informe o seu nome."
        : password.length < 6
          ? "A senha precisa ter pelo menos 6 caracteres."
          : password !== String(form.get("confirm"))
            ? "As senhas não coincidem."
            : "";
    if (problem) {
      setError(problem);
      return;
    }
    void run(() => signUp(name, String(form.get("email")), password), "Conta criada com sucesso!");
  }

  async function handleReset(email: string) {
    if (!email) {
      setError("Digite seu e-mail no campo acima para receber o link de redefinição.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await resetPassword(email);
      setInfo("Se houver uma conta com este e-mail, você receberá um link para criar uma nova senha.");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page-width auth-page">
      <div className="auth-card">
        <span className="eyebrow text-muted-foreground">Área do cliente</span>
        <h1>{tab === "entrar" ? "Que bom te ver" : "Crie sua conta"}</h1>
        <p className="demo-note mb-6">
          Entre para salvar seu carrinho e enviar seus pedidos identificados para a Záfora.
        </p>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={busy}
          onClick={() => void run(signInWithGoogle)}
        >
          <GoogleIcon /> Continuar com Google
        </Button>

        <div className="auth-divider">
          <span>ou com e-mail</span>
        </div>

        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as "entrar" | "cadastro");
            setError("");
            setInfo("");
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entrar">Entrar</TabsTrigger>
            <TabsTrigger value="cadastro">Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="entrar">
            <form className="auth-form" onSubmit={handleLogin} noValidate={false}>
              <div className="field">
                <Label htmlFor="login-email">E-mail</Label>
                <Input id="login-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="field">
                <Label htmlFor="login-password">Senha</Label>
                <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Entrando…" : "Entrar"}
              </Button>
              <button
                type="button"
                className="auth-link"
                disabled={busy}
                onClick={(e) => {
                  const form = e.currentTarget.form;
                  const email = form ? String(new FormData(form).get("email") ?? "") : "";
                  void handleReset(email.trim());
                }}
              >
                Esqueci minha senha
              </button>
            </form>
          </TabsContent>

          <TabsContent value="cadastro">
            <form className="auth-form" onSubmit={handleSignUp}>
              <div className="field">
                <Label htmlFor="signup-name">Nome</Label>
                <Input id="signup-name" name="name" autoComplete="name" required minLength={2} />
              </div>
              <div className="field">
                <Label htmlFor="signup-email">E-mail</Label>
                <Input id="signup-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="field">
                <Label htmlFor="signup-password">Senha</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              <div className="field">
                <Label htmlFor="signup-confirm">Confirme a senha</Label>
                <Input
                  id="signup-confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Criando conta…" : "Criar conta"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {error && (
          <p className="validation mt-4" role="alert">
            {error}
          </p>
        )}
        {info && (
          <p className="notice mt-4" role="status">
            {info}
          </p>
        )}

        <p className="demo-note mt-6 text-center">
          <Link to="/colecao" search={{ categoria: "" }} className="underline underline-offset-4">
            Voltar para a coleção
          </Link>
        </p>
      </div>
    </main>
  );
}
