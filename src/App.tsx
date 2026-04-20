import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { ClientLayout } from "@/components/ClientLayout";
import { SaasLayout } from "@/components/SaasLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import HorariosPage from "./pages/HorariosPage";
import AgendaPage from "./pages/AgendaPage";
import PacientesPage from "./pages/PacientesPage";
import ServicosPage from "./pages/ServicosPage";
import ProntuarioPage from "./pages/ProntuarioPage";
import UsuariosPermissoesPage from "./pages/UsuariosPermissoesPage";
import NotificacoesPage from "./pages/NotificacoesPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import TeleconsultaPage from "./pages/TeleconsultaPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import BackupAuditoriaPage from "./pages/BackupAuditoriaPage";
import SaasCachePage from "./pages/saas/SaasCachePage";
import FinanceiroPage from "./pages/FinanceiroPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import AusenciasPage from "./pages/AusenciasPage";
import WebhooksPage from "./pages/WebhooksPage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
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
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            {/* Onboarding - autenticado mas sem empresa */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            {/* Admin routes - protected + empresa obrigatória */}
            <Route element={<ProtectedRoute requireEmpresa redirectTo="/login"><AppLayout /></ProtectedRoute>}>
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
              <Route path="/configuracoes" element={<ConfiguracoesPage />} />
              <Route path="/teleconsulta" element={<TeleconsultaPage />} />
              <Route path="/relatorios" element={<RelatoriosPage />} />
              <Route path="/webhooks" element={<WebhooksPage />} />
            </Route>
            {/* Client app routes */}
            <Route path="/app/:slug" element={<ClientLayout />}>
              <Route index element={<ClientHomePage />} />
              <Route path="login" element={<ClientLoginPage />} />
              <Route path="categoria/:id" element={<ClientCategoryPage />} />
              <Route path="servico/:id" element={<ClientServiceDetailPage />} />
              <Route path="agendar" element={<ClientBookingFlowPage />} />
              <Route path="historico" element={<ClientHistoryPage />} />
              <Route path="perfil" element={<ClientProfilePage />} />
            </Route>
            {/* SaaS Owner routes */}
            <Route path="/saas/login" element={<SaasLoginPage />} />
            <Route element={<ProtectedRoute redirectTo="/saas/login"><SaasLayout /></ProtectedRoute>}>
              <Route path="/saas/dashboard" element={<SaasDashboardPage />} />
              <Route path="/saas/planos" element={<SaasPlanosPage />} />
              <Route path="/saas/empresas" element={<SaasEmpresasPage />} />
              <Route path="/saas/empresa/:id" element={<SaasEmpresaDetailPage />} />
              <Route path="/saas/assinaturas" element={<SaasAssinaturasPage />} />
              <Route path="/saas/pagamentos" element={<SaasPagamentosPage />} />
              <Route path="/saas/logs" element={<SaasLogsPage />} />
              <Route path="/saas/permissoes" element={<SaasPermissoesPage />} />
              <Route path="/saas/backup" element={<BackupAuditoriaPage />} />
              <Route path="/saas/cache" element={<SaasCachePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
