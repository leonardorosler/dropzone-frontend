import { useEffect, useMemo, useState, type FormEvent } from "react";
import { buscarUsuarioLogado, login } from "./api/auth";
import { listarProdutos } from "./api/produtos";
import { Header } from "./components/Header";
import { ProductCard } from "./components/ProductCard";
import type { Produto, Usuario } from "./types";

const categorias = [
  { nome: "Camisetas", busca: "camiseta", imagem: "/home/categoria-camisetas.webp" },
  { nome: "Moletons", busca: "moletom", imagem: "/home/categoria-moletons.webp" },
  { nome: "Calças", busca: "calça", imagem: "/home/categoria-calcas.webp" },
  { nome: "Jaquetas", busca: "jaqueta", imagem: "/home/categoria-jaquetas.webp" },
];

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [email, setEmail] = useState("cliente@dropzone.com");
  const [senha, setSenha] = useState("123456");
  const [erro, setErro] = useState("");
  const [erroProdutos, setErroProdutos] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function carregarProdutos(termo = busca) {
    setErroProdutos("");

    try {
      const lista = await listarProdutos({
        ...(termo.trim() ? { busca: termo.trim() } : {}),
        disponivel: true,
      });

      setProdutos(lista);
    } catch (error) {
      setErroProdutos(
        error instanceof Error ? error.message : "Erro ao carregar produtos."
      );
      setProdutos([]);
    }
  }

  async function carregarUsuario() {
    const token = localStorage.getItem("dropzone_token");

    if (!token) return;

    try {
      const user = await buscarUsuarioLogado();
      setUsuario(user);
    } catch {
      localStorage.removeItem("dropzone_token");
      localStorage.removeItem("dropzone_usuario_id");
    }
  }

  useEffect(() => {
    Promise.all([carregarProdutos(), carregarUsuario()]).finally(() => {
      setCarregando(false);
    });
  }, []);

  const destaques = useMemo(() => {
    const destacados = produtos.filter((produto) => produto.destaque);

    return destacados.length > 0 ? destacados.slice(0, 8) : produtos.slice(0, 8);
  }, [produtos]);

  async function handleBuscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await carregarProdutos();
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  }

  async function buscarPorCategoria(termo: string) {
    setBusca(termo);
    await carregarProdutos(termo);
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    try {
      const resposta = await login(email, senha);
      localStorage.setItem("dropzone_token", resposta.token);
      localStorage.setItem("dropzone_usuario_id", String(resposta.usuario.id));
      setUsuario(resposta.usuario);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao fazer login.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("dropzone_token");
    localStorage.removeItem("dropzone_usuario_id");
    setUsuario(null);
  }

  return (
    <div>
      <Header
        usuario={usuario}
        busca={busca}
        onBuscaChange={setBusca}
        onBuscar={handleBuscar}
        onLoginClick={() => {
          document.getElementById("login")?.scrollIntoView({ behavior: "smooth" });
        }}
        onLogout={handleLogout}
      />

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
              Uma fachada digital minimalista para explorar peças, montar looks
              e transformar o carrinho em pedido pelo WhatsApp.
            </p>
            <a className="btn btn-primary" href="#catalogo">
              Ver catálogo
            </a>
          </div>

          <strong className="hero-graffiti">DROPZONE</strong>
        </section>

        <section className="categories-strip" id="categorias" aria-label="Categorias">
          {categorias.map((categoria) => (
            <button
              className="category-card"
              key={categoria.nome}
              type="button"
              onClick={() => buscarPorCategoria(categoria.busca)}
            >
              <img src={categoria.imagem} alt="" loading="lazy" />
              <span>{categoria.nome}</span>
            </button>
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

        <section className="section graphite-section" id="destaques">
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

        <section className="section catalog-page" id="catalogo">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Catálogo</span>
              <h2>Peças em movimento</h2>
            </div>

            <form className="search-form" onSubmit={handleBuscar}>
              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por camiseta, moletom..."
              />
              <button className="btn btn-primary" type="submit">
                Buscar
              </button>
            </form>
          </div>

          {carregando ? (
            <p className="status-text">Carregando produtos...</p>
          ) : erroProdutos ? (
            <p className="status-text error">{erroProdutos}</p>
          ) : produtos.length === 0 ? (
            <p className="status-text">Nenhuma peça encontrada.</p>
          ) : (
            <div className="product-grid four">
              {produtos.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>
          )}
        </section>

        <section className="section login-section" id="login">
          <div>
            <span className="eyebrow">Conta</span>
            <h2>Entrar na área do cliente</h2>
            <p>
              Use o login de teste do seed para validar autenticação e rotas
              protegidas. Depois essa área vira conta, favoritos, carrinho e
              interações.
            </p>
          </div>

          <form className="login-card" onSubmit={handleLogin}>
            <label>
              E-mail
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
              />
            </label>

            <label>
              Senha
              <input
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                type="password"
              />
            </label>

            {erro && <p className="error">{erro}</p>}

            <button className="button" type="submit">
              Entrar
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
