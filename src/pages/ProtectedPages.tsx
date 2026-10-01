import { X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { criarAvaliacao, listarAvaliacoesProduto } from "../api/avaliacoes";
import {
  adicionarItemCarrinho,
  atualizarQuantidadeItemCarrinho,
  gerarPedidoWhatsapp,
  listarCarrinho,
  removerItemCarrinho,
} from "../api/carrinho";
import {
  adicionarFavorito,
  listarFavoritos,
  removerFavorito,
} from "../api/favoritos";
import { sugerirLook } from "../api/ia";
import { buscarProdutoPorId } from "../api/produtos";
import { useAuth } from "../auth/AuthContext";
import type {
  Avaliacao,
  Carrinho,
  Favorito,
  PedidoWhatsapp,
  Produto,
  ProdutoVariacao,
  SugestaoIA,
} from "../types";

export function FavoritesPage() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarFavoritos() {
    setCarregando(true);
    setErro("");

    try {
      const lista = await listarFavoritos();
      setFavoritos(lista);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar favoritos.");
      setFavoritos([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarFavoritos();
  }, []);

  async function remover(produtoId: number) {
    setErro("");
    setMensagem("");

    try {
      await removerFavorito(produtoId);
      setFavoritos((lista) =>
        lista.filter((favorito) => favorito.produtoId !== produtoId)
      );
      setMensagem("Produto removido dos favoritos.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao remover favorito.");
    }
  }

  return (
    <main className="section catalog-page favorites-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Favoritos</span>
          <h1>Seus produtos favoritos</h1>
        </div>

        <a className="btn btn-outline" href="/catalogo">
          Ver catálogo
        </a>
      </div>

      {mensagem && <p className="success page-message">{mensagem}</p>}
      {erro && <p className="error page-message">{erro}</p>}

      {carregando ? (
        <p className="status-text">Carregando favoritos...</p>
      ) : favoritos.length === 0 ? (
        <section className="empty-panel inline-empty">
          <span className="eyebrow">Lista vazia</span>
          <h2>Nenhuma peça salva ainda.</h2>
          <p>
            Explore o catálogo e marque os produtos que você quer acompanhar de
            perto.
          </p>
          <a className="btn btn-primary" href="/catalogo">
            Explorar peças
          </a>
        </section>
      ) : (
        <div className="favorite-grid">
          {favoritos.map((favorito) => (
            <article className="favorite-item" key={favorito.id}>
              {favorito.produto ? (
                <>
                  <a className="favorite-image" href={`/produtos/${favorito.produto.id}`}>
                    <img
                      src={
                        favorito.produto.imagens?.[0]?.imagemUrl ??
                        "/home/produto-demo-01.webp"
                      }
                      alt={favorito.produto.nome}
                    />
                  </a>

                  <div className="favorite-copy">
                    <small>{favorito.produto.categoria?.nome ?? "DropZone"}</small>
                    <a href={`/produtos/${favorito.produto.id}`}>
                      <strong>{favorito.produto.nome}</strong>
                    </a>
                    <span>
                      {Number(favorito.produto.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>

                  <div className="favorite-actions">
                    <a className="btn btn-primary" href={`/produtos/${favorito.produto.id}`}>
                      Ver produto
                    </a>
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => remover(favorito.produtoId)}
                    >
                      Remover
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="favorite-copy">
                    <small>Produto #{favorito.produtoId}</small>
                    <strong>Produto favoritado</strong>
                    <span>Os dados completos não vieram da API.</span>
                  </div>
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => remover(favorito.produtoId)}
                  >
                    Remover
                  </button>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export function CartPage() {
  const [carrinho, setCarrinho] = useState<Carrinho | null>(null);
  const [pedido, setPedido] = useState<PedidoWhatsapp | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarCarrinho() {
    setCarregando(true);
    setErro("");

    try {
      const carrinhoAtual = await listarCarrinho();
      setCarrinho(carrinhoAtual);
    } catch (error) {
      const texto = error instanceof Error ? error.message : "";

      if (texto.toLowerCase().includes("carrinho")) {
        setCarrinho(null);
      } else {
        setErro(texto || "Erro ao carregar carrinho.");
      }
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarCarrinho();
  }, []);

  const itens = carrinho?.itens ?? [];
  const total = itens.reduce((soma, item) => {
    const preco = Number(item.produtoVariacao.produto.preco);
    return soma + preco * item.quantidade;
  }, 0);

  async function alterarQuantidade(itemId: number, quantidade: number) {
    if (quantidade <= 0) return;

    setErro("");
    setMensagem("");
    setPedido(null);

    try {
      await atualizarQuantidadeItemCarrinho(itemId, quantidade);
      setCarrinho((atual) =>
        atual
          ? {
              ...atual,
              itens: atual.itens.map((item) =>
                item.id === itemId ? { ...item, quantidade } : item
              ),
            }
          : atual
      );
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao alterar quantidade.");
    }
  }

  async function remover(itemId: number) {
    setErro("");
    setMensagem("");
    setPedido(null);

    try {
      await removerItemCarrinho(itemId);
      setCarrinho((atual) =>
        atual
          ? {
              ...atual,
              itens: atual.itens.filter((item) => item.id !== itemId),
            }
          : atual
      );
      setMensagem("Item removido do carrinho.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao remover item.");
    }
  }

  async function finalizar() {
    setErro("");
    setMensagem("");
    setPedido(null);

    try {
      const resultado = await gerarPedidoWhatsapp();
      setPedido(resultado);
      setMensagem("Pedido pronto para enviar pelo WhatsApp.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao finalizar carrinho.");
    }
  }

  return (
    <main className="section cart-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Carrinho</span>
          <h1>Seu carrinho DropZone</h1>
        </div>

        <a className="btn btn-outline" href="/catalogo">
          Continuar comprando
        </a>
      </div>

      {mensagem && <p className="success page-message">{mensagem}</p>}
      {erro && <p className="error page-message">{erro}</p>}

      {carregando ? (
        <p className="status-text">Carregando carrinho...</p>
      ) : itens.length === 0 ? (
        <section className="empty-panel inline-empty">
          <span className="eyebrow">Carrinho vazio</span>
          <h2>Nenhuma peça adicionada.</h2>
          <p>
            Escolha uma peça, selecione cor e tamanho, e adicione ao carrinho
            para montar o pedido.
          </p>
          <a className="btn btn-primary" href="/catalogo">
            Ver catálogo
          </a>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-list">
            {itens.map((item) => {
              const variacao = item.produtoVariacao;
              const produto = variacao.produto;
              const preco = Number(produto.preco);
              const subtotal = preco * item.quantidade;

              return (
                <article className="cart-item" key={item.id}>
                  <a className="cart-image" href={`/produtos/${produto.id}`}>
                    <img
                      src={produto.imagens?.[0]?.imagemUrl ?? "/home/produto-demo-01.webp"}
                      alt={produto.nome}
                    />
                  </a>

                  <div className="cart-copy">
                    <small>
                      {variacao.cor?.nome ?? "Cor não informada"} / {variacao.tamanho.nome}
                    </small>
                    <a href={`/produtos/${produto.id}`}>
                      <strong>{produto.nome}</strong>
                    </a>
                    <span>
                      {preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>

                  <label className="cart-quantity">
                    Qtd.
                    <input
                      min={1}
                      max={99}
                      type="number"
                      value={item.quantidade}
                      onChange={(event) =>
                        alterarQuantidade(item.id, Number(event.target.value))
                      }
                    />
                  </label>

                  <strong className="cart-subtotal">
                    {subtotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>

                  <button
                    className="cart-remove"
                    type="button"
                    onClick={() => remover(item.id)}
                    aria-label={`Remover ${produto.nome}`}
                  >
                    <X size={18} />
                  </button>
                </article>
              );
            })}
          </section>

          <aside className="cart-summary">
            <span className="eyebrow">Resumo</span>
            <h2>
              {total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </h2>
            <p>
              Ao finalizar, o sistema gera a mensagem do pedido e o link do
              WhatsApp da loja.
            </p>
            <button className="btn btn-primary" type="button" onClick={finalizar}>
              Finalizar pelo WhatsApp
            </button>

            {pedido && (
              <div className="whatsapp-result">
                <a className="btn whatsapp-btn" href={pedido.whatsappUrl} target="_blank">
                  Abrir WhatsApp
                </a>
                <textarea readOnly value={pedido.mensagem} />
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
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
