import { Heart, Search, ShoppingBag } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";

export function Header() {
  const { usuario, logout } = useAuth();
  const [busca, setBusca] = useState("");

  function buscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const termo = busca.trim();
    window.location.href = `/catalogo${termo ? `?busca=${encodeURIComponent(termo)}` : ""}`;
  }

  return (
    <>
      <div className="topbar">
        <span>DropZone</span>
        <span>Streetwear brasileiro / catálogo real / pedido via WhatsApp</span>
        <span>IA para combinar looks</span>
      </div>

      <header className="site-header">
        <a className="brand brand-image" href="/" aria-label="DropZone">
          <img src="/home/logo-dropzone.png" alt="DropZone" />
        </a>

        <nav className="nav">
          <a href="/catalogo">Catálogo</a>
          <a href="/catalogo?destaque=true">Destaques</a>
          <a href="/favoritos">Favoritos</a>
          <a href="/carrinho">Carrinho</a>
          {usuario?.role === "ADMIN" && <a href="/admin">Admin</a>}
        </nav>

        <form className="search-shell" onSubmit={buscar}>
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="Buscar produtos"
            placeholder="Buscar camiseta, moletom..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </form>

        <div className="header-actions">
          <a className="icon-link" href="/favoritos" aria-label="Favoritos">
            <Heart size={19} />
          </a>
          <a className="icon-link" href="/carrinho" aria-label="Carrinho">
            <ShoppingBag size={19} />
          </a>

          {usuario ? (
            <>
              <a className="user-pill" href="/interacoes">
                {usuario.nome}
              </a>
              <button className="ghost-button" type="button" onClick={logout}>
                Sair
              </button>
            </>
          ) : (
            <a className="ghost-button" href="/login">
              Entrar
            </a>
          )}
        </div>
      </header>
    </>
  );
}
