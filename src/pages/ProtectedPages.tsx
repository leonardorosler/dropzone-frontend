import { useAuth } from "../auth/AuthContext";

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
  return (
    <PlaceholderPage
      eyebrow="Produto"
      title={`Detalhe do produto #${id}`}
      text="Próxima etapa: buscar o produto na API e montar seleção de cor, tamanho, favorito, carrinho, avaliações e IA."
    />
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
