import { apiFetch } from "./api";
import type { Produto } from "../types";

export interface ProdutoFiltros {
  busca?: string;
  categoriaId?: number;
  disponivel?: boolean;
  destaque?: boolean;
}

export function listarProdutos(filtros: ProdutoFiltros = {}) {
  const params = new URLSearchParams();

  if (filtros.busca) params.set("busca", filtros.busca);
  if (filtros.categoriaId) params.set("categoriaId", String(filtros.categoriaId));
  if (filtros.disponivel !== undefined) {
    params.set("disponivel", String(filtros.disponivel));
  }
  if (filtros.destaque !== undefined) {
    params.set("destaque", String(filtros.destaque));
  }

  const query = params.toString();

  return apiFetch<Produto[]>(`/produtos${query ? `?${query}` : ""}`);
}

export function buscarProdutoPorId(id: number) {
  return apiFetch<Produto>(`/produtos/${id}`);
}