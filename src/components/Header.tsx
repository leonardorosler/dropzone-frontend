import type { FormEvent } from "react";
import type { Usuario } from "../types";

interface HeaderProps {
  usuario: Usuario | null;
  busca: string;
  onBuscaChange: (valor: string) => void;
  onBuscar: (event: FormEvent<HTMLFormElement>) => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

export function Header({
  usuario,
  busca,
  onBuscaChange,
  onBuscar,
  onLoginClick,
  onLogout,
}: HeaderProps) {
  return (
    <>
      <div className="topbar">
        <span>DropZone</span>
        <span>Streetwear brasileiro / catálogo real / pedido via WhatsApp</span>
        <span>IA para combinar looks</span>
      </div>

      <header className="site-header">
        <a className="brand brand-image" href="#inicio" aria-label="DropZone">
          <img src="/home/logo-dropzone.png" alt="DropZone" />
        </a>

        <nav className="nav">
          <a href="#catalogo">Catálogo</a>
          <a href="#categorias">Categorias</a>
          <a href="#destaques">Destaques</a>
          <a href="#ia">Looks IA</a>
        </nav>

        <form className="search-shell" onSubmit={onBuscar}>
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Buscar produtos"
            placeholder="Buscar camiseta, moletom..."
            value={busca}
            onChange={(event) => onBuscaChange(event.target.value)}
          />
        </form>

        <div className="header-actions">
          <a className="icon-link" href="#favoritos" aria-label="Favoritos">
            ♡
          </a>
          <a className="icon-link" href="#carrinho" aria-label="Carrinho">
            ▢
          </a>

          {usuario ? (
            <>
              <span className="user-pill">{usuario.nome}</span>
              <button className="ghost-button" type="button" onClick={onLogout}>
                Sair
              </button>
            </>
          ) : (
            <button className="ghost-button" type="button" onClick={onLoginClick}>
              Entrar
            </button>
          )}
        </div>
      </header>
    </>
  );
}
