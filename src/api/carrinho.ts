import { apiFetch } from "./api";
import type { Carrinho } from "../types";

export function adicionarItemCarrinho(produtoVariacaoId: number, quantidade: number) {
  return apiFetch<Carrinho>("/carrinho/itens", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ produtoVariacaoId, quantidade }),
  });
}
