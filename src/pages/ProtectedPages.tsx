import { useEffect, useMemo, useState, type FormEvent } from "react";
import { criarAvaliacao, listarAvaliacoesProduto } from "../api/avaliacoes";
import { adicionarItemCarrinho } from "../api/carrinho";
import { adicionarFavorito } from "../api/favoritos";
import { sugerirLook } from "../api/ia";
import { buscarProdutoPorId } from "../api/produtos";
import { useAuth } from "../auth/AuthContext";
import type { Avaliacao, Produto, ProdutoVariacao, SugestaoIA } from "../types";

export function FavoritesPage() {
  return <PlaceholderPage eyebrow="Favoritos" title="Seus produtos favoritos" />;
}

export function CartPage() {
  return <PlaceholderPage eyebrow="Carrinho" title="Seu carrinho DropZone" />;
}

export function InteractionsPage() {
  const { usuario } = useAuth();

  return (
    <PlaceholderPage
      eyebrow="Interações"
      title={`Olá, ${usuario?.nome ?? "cliente"}`}
      text="Aqui entram favoritos, avaliações, carrinhos finalizados e respostas do admin."
    />
  );
}

export function AdminPage() {
  return (
    <PlaceholderPage
      eyebrow="Admin"
      title="Painel administrativo"
      text="Base criada para dashboard, produtos, categorias, cores, tamanhos e interações."
    />
  );
}

export function ProductDetailPage({ id }: { id: string }) {
  const produtoId = Number(id);
  const { estaLogado } = useAuth();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [variacaoSelecionada, setVariacaoSelecionada] =
    useState<ProdutoVariacao | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [sugestao, setSugestao] = useState<SugestaoIA | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoIa, setCarregandoIa] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    Promise.all([
      buscarProdutoPorId(produtoId),
      listarAvaliacoesProduto(produtoId).catch(() => []),
    ])
      .then(([produtoEncontrado, listaAvaliacoes]) => {
        if (!ativo) return;

        setProduto(produtoEncontrado);
        setAvaliacoes(listaAvaliacoes);

        const primeiraDisponivel =
          produtoEncontrado.variacoes?.find((variacao) => variacao.disponivel) ??
          produtoEncontrado.variacoes?.[0] ??
          null;

        setVariacaoSelecionada(primeiraDisponivel);
      })
      .catch((error) => {
        if (!ativo) return;
        setErro(error instanceof Error ? error.message : "Erro ao carregar produto.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [produtoId]);

  const imagemPrincipal =
    produto?.imagens?.[0]?.imagemUrl ?? "/home/produto-demo-01.webp";

  const preco = Number(produto?.preco ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const mediaAvaliacoes = useMemo(() => {
    if (produto?.mediaAvaliacoes !== undefined) return Number(produto.mediaAvaliacoes);
    if (avaliacoes.length === 0) return 0;

    return (
      avaliacoes.reduce((total, avaliacao) => total + avaliacao.nota, 0) /
      avaliacoes.length
    );
  }, [produto?.mediaAvaliacoes, avaliacoes]);

  function exigirLogin() {
    if (estaLogado) return false;

    window.location.href = "/login";
    return true;
  }

  async function favoritar() {
    if (!produto || exigirLogin()) return;

    setMensagem("");
    setErro("");

    try {
      await adicionarFavorito(produto.id);
      setMensagem("Produto adicionado aos favoritos.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao favoritar.");
    }
  }

  async function adicionarAoCarrinho() {
    if (exigirLogin()) return;

    if (!variacaoSelecionada) {
      setErro("Selecione uma variação disponível.");
      return;
    }

    setMensagem("");
    setErro("");

    try {
      await adicionarItemCarrinho(variacaoSelecionada.id, quantidade);
      setMensagem("Produto adicionado ao carrinho.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao adicionar ao carrinho.");
    }
  }

  async function enviarAvaliacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (exigirLogin()) return;

    setMensagem("");
    setErro("");

    try {
      const novaAvaliacao = await criarAvaliacao(produtoId, {
        nota,
        comentario: comentario.trim() || undefined,
      });

      setAvaliacoes((lista) => [novaAvaliacao, ...lista]);
      setComentario("");
      setMensagem("Avaliação enviada.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao avaliar produto.");
    }
  }

  async function gerarSugestaoIa() {
    if (exigirLogin()) return;

    setCarregandoIa(true);
    setMensagem("");
    setErro("");

    try {
      const resultado = await sugerirLook(produtoId);
      setSugestao(resultado);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao gerar sugestão de IA.");
    } finally {
      setCarregandoIa(false);
    }
  }

  if (carregando) {
    return (
      <main className="page-shell">
        <section className="empty-panel">Carregando produto...</section>
      </main>
    );
  }

  if (erro && !produto) {
    return (
      <main className="page-shell">
        <section className="empty-panel">
          <span className="eyebrow">Produto</span>
          <h1>Não foi possível carregar.</h1>
          <p>{erro}</p>
          <a className="btn btn-primary" href="/catalogo">
            Voltar ao catálogo
          </a>
        </section>
      </main>
    );
  }

  if (!produto) {
    return null;
  }

  return (
    <main className="product-page">
      <section className="product-detail">
        <div className="detail-gallery">
          <div className="detail-image">
            <img src={imagemPrincipal} alt={produto.nome} />
            {produto.destaque && <span className="badge">Destaque</span>}
          </div>

          {produto.imagens && produto.imagens.length > 1 && (
            <div className="thumb-row">
              {produto.imagens.slice(0, 4).map((imagem) => (
                <img key={imagem.id} src={imagem.imagemUrl} alt="" />
              ))}
            </div>
          )}
        </div>

        <div className="detail-copy">
          <span className="eyebrow">{produto.categoria?.nome ?? "DropZone"}</span>
          <h1>{produto.nome}</h1>
          <strong className="detail-price">{preco}</strong>
          <p>{produto.descricao}</p>

          <div className="rating-line">
            <span>{mediaAvaliacoes.toFixed(1)} ★</span>
            <small>{avaliacoes.length} avaliações</small>
          </div>

          <div className="variation-box">
            <span className="field-label">Variação</span>
            {produto.variacoes && produto.variacoes.length > 0 ? (
              <div className="variation-grid">
                {produto.variacoes.map((variacao) => (
                  <button
                    key={variacao.id}
                    className={
                      variacaoSelecionada?.id === variacao.id
                        ? "variation-option selected"
                        : "variation-option"
                    }
                    type="button"
                    disabled={!variacao.disponivel}
                    onClick={() => setVariacaoSelecionada(variacao)}
                  >
                    <span>{variacao.tamanho?.nome ?? "Tamanho"}</span>
                    <small>{variacao.cor?.nome ?? "Sem cor"}</small>
                  </button>
                ))}
              </div>
            ) : (
              <p className="status-text">Esse produto ainda não tem variações cadastradas.</p>
            )}
          </div>

          <div className="detail-actions">
            <label>
              Qtd.
              <input
                min={1}
                max={99}
                type="number"
                value={quantidade}
                onChange={(event) => setQuantidade(Number(event.target.value))}
              />
            </label>

            <button className="btn btn-primary" type="button" onClick={adicionarAoCarrinho}>
              Adicionar ao carrinho
            </button>

            <button className="btn btn-outline" type="button" onClick={favoritar}>
              Favoritar
            </button>
          </div>

          <button className="ia-button" type="button" onClick={gerarSugestaoIa}>
            {carregandoIa ? "Gerando sugestão..." : "Gerar look com IA"}
          </button>

          {mensagem && <p className="success">{mensagem}</p>}
          {erro && <p className="error">{erro}</p>}
        </div>
      </section>

      {sugestao && (
        <section className="detail-section ia-result">
          <span className="eyebrow">{sugestao.fonte ?? "Gerado por IA"}</span>
          <h2>Sugestão de combinação</h2>
          {sugestao.explicacao && <p>{sugestao.explicacao}</p>}

          {sugestao.sugestoes && sugestao.sugestoes.length > 0 && (
            <div className="suggestion-list">
              {sugestao.sugestoes.map((item) => (
                <a key={item.produtoId} href={`/produtos/${item.produtoId}`}>
                  <strong>{item.nome}</strong>
                  <span>{item.motivo}</span>
                </a>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="detail-section reviews-section">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">Avaliações</span>
            <h2>Opinião de quem usa</h2>
          </div>
        </div>

        <form className="review-form" onSubmit={enviarAvaliacao}>
          <select
            value={nota}
            onChange={(event) => setNota(Number(event.target.value))}
            aria-label="Nota"
          >
            <option value={5}>5 estrelas</option>
            <option value={4}>4 estrelas</option>
            <option value={3}>3 estrelas</option>
            <option value={2}>2 estrelas</option>
            <option value={1}>1 estrela</option>
          </select>
          <textarea
            value={comentario}
            onChange={(event) => setComentario(event.target.value)}
            placeholder="Escreva sua avaliação..."
          />
          <button className="btn btn-primary" type="submit">
            Enviar
          </button>
        </form>

        <div className="review-list">
          {avaliacoes.length === 0 ? (
            <p className="status-text">Ainda não há avaliações para esse produto.</p>
          ) : (
            avaliacoes.map((avaliacao) => (
              <article key={avaliacao.id}>
                <strong>{avaliacao.nota} ★</strong>
                <small>{avaliacao.usuario?.nome ?? "Cliente DropZone"}</small>
                {avaliacao.comentario && <p>{avaliacao.comentario}</p>}
                {avaliacao.respostaAdmin && (
                  <div className="admin-reply">
                    <b>Resposta da loja</b>
                    <span>{avaliacao.respostaAdmin}</span>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function PlaceholderPage({
  eyebrow,
  title,
  text = "Estrutura de rota criada. Agora podemos conectar essa tela na API.",
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <main className="page-shell">
      <section className="empty-panel">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </section>
    </main>
  );
}
