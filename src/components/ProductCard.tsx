import type { Produto } from "../types";

interface ProductCardProps {
  produto: Produto;
  modoHome?: boolean;
}

export function ProductCard({ produto, modoHome = false }: ProductCardProps) {
  const imagem =
    produto.imagens?.[0]?.imagemUrl ?? "/home/produto-demo-01.webp";
  const preco = Number(produto.preco).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <article className={modoHome ? "product-card product-card-home" : "product-card"}>
      <div className="product-media">
        <a href={`/produtos/${produto.id}`}>
          <img src={imagem} alt={produto.nome} loading="lazy" />
        </a>

        {(produto.destaque || modoHome) && <span className="badge">Novo</span>}

        <button className="favorite-btn" type="button" aria-label={`Favoritar ${produto.nome}`}>
          ♡
        </button>
      </div>

      <a className="product-info" href={`/produtos/${produto.id}`}>
        <small className="product-category">{produto.categoria?.nome ?? "DropZone"}</small>
        <strong>{produto.nome}</strong>

        {!modoHome && <p className="product-description">{produto.descricao}</p>}

        {!modoHome && (
          <div className="color-dots" aria-label="Cores disponíveis">
            {produto.variacoes?.slice(0, 4).map((variacao) => (
              <span
                key={variacao.id}
                title={variacao.cor?.nome ?? "Cor"}
                style={{ background: variacao.cor?.hex ?? "#202020" }}
              />
            ))}
          </div>
        )}

        <div className="product-footer">
          <strong>{preco}</strong>
          <span>{Number(produto.mediaAvaliacoes ?? 0).toFixed(1)} ★</span>
        </div>
      </a>
    </article>
  );
}
