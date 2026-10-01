import { useEffect, useMemo, useState } from "react";
import { listarProdutos } from "../api/produtos";
import { ProductCard } from "../components/ProductCard";
import type { Produto } from "../types";

const categorias = [
  { nome: "Camisetas", busca: "camiseta", imagem: "/home/categoria-camisetas.webp" },
  { nome: "Moletons", busca: "moletom", imagem: "/home/categoria-moletons.webp" },
  { nome: "Calças", busca: "calça", imagem: "/home/categoria-calcas.webp" },
  { nome: "Jaquetas", busca: "jaqueta", imagem: "/home/categoria-jaquetas.webp" },
];

export function HomePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarProdutos({ disponivel: true })
      .then(setProdutos)
      .catch(() => setProdutos([]))
      .finally(() => setCarregando(false));
  }, []);

  const destaques = useMemo(() => {
    const destacados = produtos.filter((produto) => produto.destaque);

    return destacados.length > 0 ? destacados.slice(0, 8) : produtos.slice(0, 8);
  }, [produtos]);

  return (
    <main>
      <section className="hero" id="inicio">
        <div className="hero-slider" aria-hidden="true">
          <img src="/home/hero-01.webp" alt="" />
          <img src="/home/hero-02.webp" alt="" />
          <img src="/home/hero-03.webp" alt="" />
        </div>

        <div className="hero-content">
          <span className="eyebrow">DropZone / Streetwear</span>
          <h1>Rua, ideias, atitude.</h1>
          <p>
            Uma fachada digital minimalista para explorar peças, montar looks e
            transformar o carrinho em pedido pelo WhatsApp.
          </p>
          <a className="btn btn-primary" href="/catalogo">
            Ver catálogo
          </a>
        </div>

        <strong className="hero-graffiti">DROPZONE</strong>
      </section>

      <section className="categories-strip" aria-label="Categorias">
        {categorias.map((categoria) => (
          <a
            className="category-card"
            href={`/catalogo?busca=${encodeURIComponent(categoria.busca)}`}
            key={categoria.nome}
          >
            <img src={categoria.imagem} alt="" loading="lazy" />
            <span>{categoria.nome}</span>
          </a>
        ))}
      </section>

      <section className="ai-section" id="ia">
        <div className="ai-copy">
          <span className="eyebrow">Sugestão IA</span>
          <h2>Combine peças pelo clima da rua.</h2>
          <p>
            O app vai usar a rota de IA do backend para sugerir combinações a
            partir de uma peça escolhida.
          </p>
        </div>

        <div className="ai-visual">
          <img src="/home/ia-look-visual.webp" alt="Referência visual de look DropZone" />
        </div>

        <div className="ai-detail">
          <strong>Gerado por IA</strong>
          <p>Esse bloco já deixa claro no frontend que a sugestão vem da integração com IA.</p>
        </div>
      </section>

      <section className="section graphite-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Selecionados</span>
            <h2>Mais desejados</h2>
          </div>
        </div>

        {carregando ? (
          <p className="status-text">Carregando destaques...</p>
        ) : destaques.length === 0 ? (
          <p className="status-text">Nenhum produto disponível ainda.</p>
        ) : (
          <div className="product-grid four">
            {destaques.map((produto) => (
              <ProductCard key={produto.id} produto={produto} modoHome />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
