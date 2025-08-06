import { DashboardContent } from "@/components/dashboardContent";
import { Sidebar } from "@/components/sidebar";
import AgendamentosPage from "@/pages/agendamentos/page";
import AjudaPage from "@/pages/ajuda/page";
import ApiPage from "@/pages/api/page";
import AtendimentosPage from "@/pages/atendimentos/page";
import ConfiguracoesCampanhasPage from "@/pages/campanhas/configuracoes/page";
import InformativosCampanhasPage from "@/pages/campanhas/informativos/page";
import ListasDeContatosPage from "@/pages/campanhas/listas-de-contatos/page";
import CampanhasPage from "@/pages/campanhas/page";
import ChatInternoPage from "@/pages/chat-interno/page";
import ConexoesPage from "@/pages/conexoes/page";
import ConfiguracoesPage from "@/pages/configuracoes/page";
import ContatosPage from "@/pages/contatos/page";
import FilasChatbotPage from "@/pages/filas-chatbot/page";
import FinanceiroPage from "@/pages/financeiro/page";
import InformativosPage from "@/pages/informativos/page";
import IntegracoesPage from "@/pages/integracoes/page";
import KanbanPage from "@/pages/kanban/page";
import ListaDeArquivosPage from "@/pages/lista-de-arquivos/page";
import OpenAIPage from "@/pages/open-ai/page";
import RespostasRapidasPage from "@/pages/respostas-rapidas/page";
import TagsPage from "@/pages/tags/page";
import TarefasPage from "@/pages/tarefas/page";
import UsuariosPage from "@/pages/usuarios/page";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CadastrarContent } from "@/components/cadastrar-content";
import { DashboardContent as EntrarContent } from "@/components/dashboardContent"; // ajuste se tiver outro componente

const queryClient = new QueryClient();

// Criamos esse componente para usar `useLocation()` DENTRO do <Router>
function AppWithRoutes() {
  const location = useLocation();
  const pathname = location.pathname;

  const hideSidebar = pathname === "/cadastrar" || pathname === "/entrar";

  return (
    <div className="flex h-screen bg-gray-50">
      {!hideSidebar && <Sidebar />}
      <Routes>
        <Route
          path="/cadastrar"
          element={
            <main className="flex-1 overflow-auto">
              <CadastrarContent />
            </main>
          }
        />
        <Route
          path="/entrar"
          element={
            <main className="flex-1 overflow-auto">
              <EntrarContent />
            </main>
          }
        />
        <Route
          path="/"
          element={
            <main className="flex-1 overflow-auto">
              <DashboardContent />
            </main>
          }
        />
        <Route path="/atendimentos" element={<AtendimentosPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/respostas-rapidas" element={<RespostasRapidasPage />} />
        <Route path="/tarefas" element={<TarefasPage />} />
        <Route path="/contatos" element={<ContatosPage />} />
        <Route path="/agendamentos" element={<AgendamentosPage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/chat-interno" element={<ChatInternoPage />} />
        <Route path="/ajuda" element={<AjudaPage />} />
        <Route path="/campanhas" element={<CampanhasPage />} />
        <Route path="/campanhas/listas-de-contatos" element={<ListasDeContatosPage />} />
        <Route path="/campanhas/configuracoes" element={<ConfiguracoesCampanhasPage />} />
        <Route path="/campanhas/informativos" element={<InformativosCampanhasPage />} />
        <Route path="/informativos" element={<InformativosPage />} />
        <Route path="/open-ai" element={<OpenAIPage />} />
        <Route path="/integracoes" element={<IntegracoesPage />} />
        <Route path="/conexoes" element={<ConexoesPage />} />
        <Route path="/lista-de-arquivos" element={<ListaDeArquivosPage />} />
        <Route path="/filas-chatbot" element={<FilasChatbotPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/api" element={<ApiPage />} />
        <Route path="/financeiro" element={<FinanceiroPage />} />
        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppWithRoutes />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
