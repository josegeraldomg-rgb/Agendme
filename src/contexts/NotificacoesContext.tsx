import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type NotificacaoTipo = "sistema" | "agenda" | "financeiro" | "whatsapp" | "administrativo";
export type NotificacaoPrioridade = "baixa" | "media" | "alta";
export type NotificacaoStatus = "nao_lida" | "lida";

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: NotificacaoTipo;
  prioridade: NotificacaoPrioridade;
  status: NotificacaoStatus;
  criadoEm: string;
}

interface NotificacoesContextType {
  notificacoes: Notificacao[];
  unreadCount: number;
  marcarLida: (id: string) => void;
  marcarTodasLidas: () => void;
  adicionarNotificacao: (n: Omit<Notificacao, "id" | "status" | "criadoEm">) => void;
  remover: (id: string) => void;
}

const NotificacoesContext = createContext<NotificacoesContextType | null>(null);

const now = () => new Date().toLocaleString("pt-BR");

const seedNotificacoes: Notificacao[] = [
  { id: "n1", titulo: "Novo agendamento", mensagem: "Maria Silva agendou Consulta Dermatológica para 22/03 às 14:00.", tipo: "agenda", prioridade: "media", status: "nao_lida", criadoEm: "21/03/2026 15:32" },
  { id: "n2", titulo: "Pagamento recebido", mensagem: "Pagamento de R$ 150,00 via PIX confirmado — Carlos Souza.", tipo: "financeiro", prioridade: "baixa", status: "nao_lida", criadoEm: "21/03/2026 14:50" },
  { id: "n3", titulo: "Cancelamento de horário", mensagem: "Ana Oliveira cancelou o agendamento de 23/03 às 10:00.", tipo: "agenda", prioridade: "alta", status: "nao_lida", criadoEm: "21/03/2026 14:15" },
  { id: "n4", titulo: "Falha no envio WhatsApp", mensagem: "Mensagem de lembrete para Pedro Santos falhou após 3 tentativas.", tipo: "whatsapp", prioridade: "alta", status: "nao_lida", criadoEm: "21/03/2026 13:40" },
  { id: "n5", titulo: "Comissão calculada", mensagem: "Comissões do período 15-21/03 foram calculadas para 3 profissionais.", tipo: "financeiro", prioridade: "baixa", status: "lida", criadoEm: "21/03/2026 12:00" },
  { id: "n6", titulo: "Novo paciente cadastrado", mensagem: "Beatriz Lima foi cadastrada no sistema pela recepção.", tipo: "sistema", prioridade: "baixa", status: "lida", criadoEm: "21/03/2026 11:30" },
  { id: "n7", titulo: "Backup realizado", mensagem: "Backup automático do sistema concluído com sucesso.", tipo: "sistema", prioridade: "baixa", status: "lida", criadoEm: "21/03/2026 03:00" },
  { id: "n8", titulo: "Aviso da administração", mensagem: "Reunião de equipe amanhã às 08:00. Presença obrigatória.", tipo: "administrativo", prioridade: "media", status: "nao_lida", criadoEm: "20/03/2026 18:00" },
];

export function NotificacoesProvider({ children }: { children: ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(seedNotificacoes);

  const unreadCount = notificacoes.filter(n => n.status === "nao_lida").length;

  const marcarLida = useCallback((id: string) => {
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, status: "lida" as const } : n));
  }, []);

  const marcarTodasLidas = useCallback(() => {
    setNotificacoes(prev => prev.map(n => ({ ...n, status: "lida" as const })));
  }, []);

  const adicionarNotificacao = useCallback((n: Omit<Notificacao, "id" | "status" | "criadoEm">) => {
    const nova: Notificacao = { ...n, id: Date.now().toString(), status: "nao_lida", criadoEm: now() };
    setNotificacoes(prev => [nova, ...prev]);
  }, []);

  const remover = useCallback((id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificacoesContext.Provider value={{ notificacoes, unreadCount, marcarLida, marcarTodasLidas, adicionarNotificacao, remover }}>
      {children}
    </NotificacoesContext.Provider>
  );
}

export const useNotificacoes = () => {
  const ctx = useContext(NotificacoesContext);
  if (!ctx) throw new Error("useNotificacoes must be used within NotificacoesProvider");
  return ctx;
};
