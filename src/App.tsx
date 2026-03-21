import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { ClientLayout } from "@/components/ClientLayout";
import { SaasLayout } from "@/components/SaasLayout";
import DashboardPage from "./pages/DashboardPage";
import HorariosPage from "./pages/HorariosPage";
import AgendaPage from "./pages/AgendaPage";
import PacientesPage from "./pages/PacientesPage";
import ServicosPage from "./pages/ServicosPage";
import ProntuarioPage from "./pages/ProntuarioPage";
import UsuariosPermissoesPage from "./pages/UsuariosPermissoesPage";
import NotificacoesPage from "./pages/NotificacoesPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import AusenciasPage from "./pages/AusenciasPage";
import ClientHomePage from "./pages/client/ClientHomePage";
import ClientCategoryPage from "./pages/client/ClientCategoryPage";
import ClientServiceDetailPage from "./pages/client/ClientServiceDetailPage";
import ClientBookingFlowPage from "./pages/client/ClientBookingFlowPage";
import ClientHistoryPage from "./pages/client/ClientHistoryPage";
import ClientProfilePage from "./pages/client/ClientProfilePage";
import ClientLoginPage from "./pages/client/ClientLoginPage";
import SaasLoginPage from "./pages/saas/SaasLoginPage";
import SaasDashboardPage from "./pages/saas/SaasDashboardPage";
import SaasPlanosPage from "./pages/saas/SaasPlanosPage";
import SaasEmpresasPage from "./pages/saas/SaasEmpresasPage";
import SaasEmpresaDetailPage from "./pages/saas/SaasEmpresaDetailPage";
import SaasAssinaturasPage from "./pages/saas/SaasAssinaturasPage";
import SaasPagamentosPage from "./pages/saas/SaasPagamentosPage";
import SaasLogsPage from "./pages/saas/SaasLogsPage";
import SaasPermissoesPage from "./pages/saas/SaasPermissoesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Admin routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/horarios" element={<HorariosPage />} />
            <Route path="/pacientes" element={<PacientesPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/prontuario" element={<ProntuarioPage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
            <Route path="/whatsapp" element={<WhatsAppPage />} />
            <Route path="/ausencias" element={<AusenciasPage />} />
            <Route path="/usuarios" element={<UsuariosPermissoesPage />} />
            <Route path="/notificacoes" element={<NotificacoesPage />} />
          </Route>
          {/* Client app routes — scoped by empresa slug */}
          <Route path="/app/login" element={<ClientLoginPage />} />
          <Route path="/app/:slug" element={<ClientLayout />}>
            <Route index element={<ClientHomePage />} />
            <Route path="categoria/:id" element={<ClientCategoryPage />} />
            <Route path="servico/:id" element={<ClientServiceDetailPage />} />
            <Route path="agendar" element={<ClientBookingFlowPage />} />
            <Route path="historico" element={<ClientHistoryPage />} />
            <Route path="perfil" element={<ClientProfilePage />} />
          </Route>
          {/* SaaS Owner routes */}
          <Route path="/saas/login" element={<SaasLoginPage />} />
          <Route element={<SaasLayout />}>
            <Route path="/saas/dashboard" element={<SaasDashboardPage />} />
            <Route path="/saas/planos" element={<SaasPlanosPage />} />
            <Route path="/saas/empresas" element={<SaasEmpresasPage />} />
            <Route path="/saas/empresa/:id" element={<SaasEmpresaDetailPage />} />
            <Route path="/saas/assinaturas" element={<SaasAssinaturasPage />} />
            <Route path="/saas/pagamentos" element={<SaasPagamentosPage />} />
            <Route path="/saas/logs" element={<SaasLogsPage />} />
            <Route path="/saas/permissoes" element={<SaasPermissoesPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
