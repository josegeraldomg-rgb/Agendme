import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { ClientLayout } from "@/components/ClientLayout";
import DashboardPage from "./pages/DashboardPage";
import AgendaPage from "./pages/AgendaPage";
import PacientesPage from "./pages/PacientesPage";
import ServicosPage from "./pages/ServicosPage";
import ProntuarioPage from "./pages/ProntuarioPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import ClientHomePage from "./pages/client/ClientHomePage";
import ClientCategoryPage from "./pages/client/ClientCategoryPage";
import ClientServiceDetailPage from "./pages/client/ClientServiceDetailPage";
import ClientBookingFlowPage from "./pages/client/ClientBookingFlowPage";
import ClientHistoryPage from "./pages/client/ClientHistoryPage";
import ClientProfilePage from "./pages/client/ClientProfilePage";
import ClientLoginPage from "./pages/client/ClientLoginPage";
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
            <Route path="/pacientes" element={<PacientesPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/prontuario" element={<ProntuarioPage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
            <Route path="/whatsapp" element={<WhatsAppPage />} />
          </Route>
          {/* Client app routes */}
          <Route path="/app/login" element={<ClientLoginPage />} />
          <Route element={<ClientLayout />}>
            <Route path="/app" element={<ClientHomePage />} />
            <Route path="/app/categoria/:id" element={<ClientCategoryPage />} />
            <Route path="/app/servico/:id" element={<ClientServiceDetailPage />} />
            <Route path="/app/agendar" element={<ClientBookingDatePage />} />
            <Route path="/app/agendar/confirmacao" element={<ClientBookingConfirmPage />} />
            <Route path="/app/historico" element={<ClientHistoryPage />} />
            <Route path="/app/perfil" element={<ClientProfilePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
