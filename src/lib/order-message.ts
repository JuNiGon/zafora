import { brand, whatsappUrl } from "@/data/config";
import { formatPrice } from "@/data/products";
import type { CartItem } from "@/types/store";

type Customer = { name?: string; email?: string; phone?: string };

type OrderLine = Pick<CartItem, "name" | "size" | "color" | "quantity" | "price">;

export const orderTotal = (items: OrderLine[]) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

/**
 * Monta o texto do pedido enviado ao WhatsApp da loja.
 * O asterisco (*) deixa o trecho em negrito no WhatsApp.
 */
export function buildOrderMessage(items: OrderLine[], customer?: Customer) {
  const lines: string[] = ["Olá, Záfora! Gostaria de finalizar o seguinte pedido:", ""];

  if (customer?.name || customer?.email) {
    if (customer.name) lines.push(`*Cliente:* ${customer.name}`);
    if (customer.email) lines.push(`*E-mail:* ${customer.email}`);
    if (customer.phone) lines.push(`*Telefone:* ${customer.phone}`);
    lines.push("");
  }

  lines.push("*Itens do pedido:*");
  items.forEach((item, index) => {
    const details = [item.size && `Tamanho: ${item.size}`, item.color && `Cor: ${item.color}`]
      .filter(Boolean)
      .join(" | ");
    lines.push(`${index + 1}. ${item.name}`);
    if (details) lines.push(`   ${details}`);
    lines.push(
      `   Qtd: ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}`,
    );
  });

  const pieces = items.reduce((total, item) => total + item.quantity, 0);
  lines.push(
    "",
    `*Total aproximado:* ${formatPrice(orderTotal(items))} (${pieces} ${pieces === 1 ? "peça" : "peças"}, sem frete)`,
    "",
    "Poderia me informar o valor do frete para o meu endereço e a chave de pagamento para concluirmos a compra? Obrigado(a)!",
  );

  return lines.join("\n");
}

/** Link `https://wa.me/<número>?text=<mensagem codificada>` para o WhatsApp da loja. */
export function orderWhatsappUrl(items: OrderLine[], customer?: Customer) {
  return whatsappUrl(buildOrderMessage(items, customer), brand.whatsappNumber);
}
