import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, eachDayOfInterval, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const DIAS_SEMANA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/**
 * Busca receitas reais do banco agrupadas por dia da semana ou por dia do mês.
 */
export function useDashboardFluxoSemanal(periodo: "semana" | "mes" = "semana") {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["dashboard_fluxo", empresaId, periodo],
    queryFn: async () => {
      if (!empresaId) return [];

      const hoje = new Date();
      let inicio: Date;
      let fim: Date;

      if (periodo === "semana") {
        inicio = startOfWeek(hoje, { weekStartsOn: 1 }); // Seg
        fim = endOfWeek(hoje, { weekStartsOn: 1 });
      } else {
        inicio = startOfMonth(hoje);
        fim = endOfMonth(hoje);
      }

      const inicioStr = format(inicio, "yyyy-MM-dd");
      const fimStr = format(fim, "yyyy-MM-dd");

      const { data: receitas } = await supabase
        .from("financeiro_receitas")
        .select("valor, data_pagamento")
        .eq("empresa_id", empresaId)
        .gte("data_pagamento", inicioStr)
        .lte("data_pagamento", fimStr);

      if (periodo === "semana") {
        // Agrupar por dia da semana (Seg-Dom)
        const porDia: Record<string, number> = {};
        // Inicializar todos os dias com 0
        for (let d = 1; d <= 6; d++) porDia[DIAS_SEMANA_CURTO[d]] = 0;
        porDia[DIAS_SEMANA_CURTO[0]] = 0; // Dom

        for (const r of receitas || []) {
          const date = new Date(r.data_pagamento + "T12:00:00");
          const dia = DIAS_SEMANA_CURTO[getDay(date)];
          porDia[dia] = (porDia[dia] || 0) + Number(r.valor || 0);
        }

        // Retornar na ordem Seg-Sáb (sem domingo se preferir, mas incluo)
        return ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => ({
          name: dia,
          receita: porDia[dia] || 0,
        }));
      } else {
        // Agrupar por dia do mês
        const dias = eachDayOfInterval({ start: inicio, end: fim });
        const porDia: Record<string, number> = {};
        for (const d of dias) {
          porDia[format(d, "dd")] = 0;
        }

        for (const r of receitas || []) {
          const dd = r.data_pagamento.slice(8, 10);
          porDia[dd] = (porDia[dd] || 0) + Number(r.valor || 0);
        }

        return Object.entries(porDia).map(([day, receita]) => ({
          name: day,
          receita,
        }));
      }
    },
    enabled: !!empresaId,
  });
}
