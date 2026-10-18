import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LayoutDashboard, LogOut, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireAuth } from "@/components/auth/guards";
import { displayName, useAuth } from "@/contexts/auth";
import { useCart } from "@/contexts/cart";
import { formatPrice } from "@/data/products";
import { privateHead } from "@/data/seo";

export const Route = createFileRoute("/conta")({
  head: () => privateHead("Minha conta"),
  component: () => (
    <RequireAuth>
      <AccountPage />
    </RequireAuth>
  ),
});

function AccountPage() {
  const { user, profile, isAdmin, updateUserProfile, signOut } = useAuth();
  const { count, subtotal } = useCart();
  const [saving, setSaving] = useState(false);
  const name = displayName(user, profile);
  const usesPassword = user?.providerData.some((p) => p.providerId === "password");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await updateUserProfile({
        name: String(form.get("name")).trim(),
        phone: String(form.get("phone")).trim(),
      });
      toast.success("Dados atualizados.");
    } catch {
      toast.error("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-width pb-20">
      <div className="page-intro">
        <span className="eyebrow">Área do cliente</span>
        <h1>Olá, {name.split(" ")[0]}</h1>
        <p>Gerencie seus dados e acompanhe o seu carrinho.</p>
      </div>

      <div className="account-grid">
        <section className="panel">
          <h2>Seus dados</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <Label htmlFor="account-name">Nome</Label>
              <Input id="account-name" name="name" defaultValue={profile?.name ?? name} required minLength={2} />
            </div>
            <div className="field">
              <Label htmlFor="account-email">E-mail</Label>
              <Input id="account-email" value={user?.email ?? ""} disabled readOnly />
            </div>
            <div className="field">
              <Label htmlFor="account-phone">WhatsApp / telefone (opcional)</Label>
              <Input
                id="account-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(82) 90000-0000"
                defaultValue={profile?.phone ?? ""}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando…" : "Salvar alterações"}
            </Button>
          </form>
          <p className="demo-note mt-4">
            Acesso via {usesPassword ? "e-mail e senha" : "Google"}. Seu nome e telefone são incluídos na mensagem do
            pedido enviada pelo WhatsApp.
          </p>
        </section>

        <section className="panel">
          <h2>Seu carrinho</h2>
          <p className="text-sm mb-5">
            {count
              ? `${count} ${count === 1 ? "peça" : "peças"} · ${formatPrice(subtotal)}`
              : "Nenhuma peça no carrinho ainda."}
          </p>
          {count ? (
            <Button asChild>
              <Link to="/carrinho">
                <ShoppingBag /> Ver carrinho
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/colecao" search={{ categoria: "" }}>
                Explorar a coleção
              </Link>
            </Button>
          )}

          {isAdmin && (
            <>
              <h2 className="mt-10">Administração</h2>
              <Button asChild variant="outline">
                <Link to="/admin">
                  <LayoutDashboard /> Painel da loja
                </Link>
              </Button>
            </>
          )}

          <Button variant="ghost" className="mt-10 block" onClick={() => void signOut()}>
            <span className="inline-flex items-center gap-2">
              <LogOut size={16} /> Sair da conta
            </span>
          </Button>
        </section>
      </div>
    </main>
  );
}
