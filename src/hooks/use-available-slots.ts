import { useMemo } from "react";
import {
  gerarSlots,
  aplicarBloqueios,
  type HorarioFuncionamento,
  type SlotAgenda,
  type Ausencia,
  type BloqueioAgenda,
  type Feriado,
} from "@/lib/scheduling-engine";
import { format, getDay } from "date-fns";

// ── Mock data simulating what would come from the DB ──

const mockHorarios: HorarioFuncionamento[] = [
  // Dra. Ana Silva — seg a sex
  ...([1, 2, 3, 4, 5] as number[]).map((dia) => ({
    id: `h-p1-${dia}`,
    profissionalId: "p1",
    diaSemana: dia,
    horaInicio: "08:00",
    horaFim: "17:00",
    intervaloMinutos: 30,
  })),
  // Dr. Carlos Mendes — seg a sex
  ...([1, 2, 3, 4, 5] as number[]).map((dia) => ({
    id: `h-p2-${dia}`,
    profissionalId: "p2",
    diaSemana: dia,
    horaInicio: "09:00",
    horaFim: "17:00",
    intervaloMinutos: 30,
  })),
  // Dra. Mariana Costa — seg, qua, sex
  ...([1, 3, 5] as number[]).map((dia) => ({
    id: `h-p3-${dia}`,
    profissionalId: "p3",
    diaSemana: dia,
    horaInicio: "08:00",
    horaFim: "17:00",
    intervaloMinutos: 30,
  })),
];

const mockAgendamentos: SlotAgenda[] = [
  {
    id: "ag-1",
    profissionalId: "p1",
    dataHoraInicio: (() => { const d = new Date(); d.setHours(9, 0, 0, 0); return d; })(),
    dataHoraFim: (() => { const d = new Date(); d.setHours(9, 30, 0, 0); return d; })(),
    status: "ocupado",
    origem: "automatico",
    paciente: "João Silva",
    servico: "Limpeza de Pele",
  },
  {
    id: "ag-2",
    profissionalId: "p2",
    dataHoraInicio: (() => { const d = new Date(); d.setHours(10, 0, 0, 0); return d; })(),
    dataHoraFim: (() => { const d = new Date(); d.setHours(10, 30, 0, 0); return d; })(),
    status: "ocupado",
    origem: "automatico",
    paciente: "Maria Santos",
    servico: "Peeling Químico",
  },
];

const mockAusencias: Ausencia[] = [
  {
    id: "aus-1",
    profissionalId: "p1",
    dataInicio: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d; })(),
    dataFim: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d; })(),
    diaTodo: true,
    motivo: "Congresso médico",
  },
];

const mockBloqueios: BloqueioAgenda[] = [];

const mockFeriados: Feriado[] = [
  { data: new Date(2026, 0, 1), nome: "Confraternização Universal" },
  { data: new Date(2026, 3, 21), nome: "Tiradentes" },
  { data: new Date(2026, 4, 1), nome: "Dia do Trabalho" },
  { data: new Date(2026, 8, 7), nome: "Independência do Brasil" },
  { data: new Date(2026, 9, 12), nome: "Nossa Senhora Aparecida" },
  { data: new Date(2026, 10, 2), nome: "Finados" },
  { data: new Date(2026, 10, 15), nome: "Proclamação da República" },
  { data: new Date(2026, 11, 25), nome: "Natal" },
];

/**
 * Returns available time strings for a given professional on a given date,
 * using the scheduling engine to filter out conflicts.
 */
export function useAvailableSlots(
  profissionalId: string,
  date: Date | undefined,
  duracaoServico: number = 30
): string[] {
  return useMemo(() => {
    if (!date) return [];

    const horarios = mockHorarios.filter((h) => h.profissionalId === profissionalId);
    if (horarios.length === 0) return [];

    // Generate raw slots for this professional on this date
    const rawSlots = gerarSlots(horarios, date, duracaoServico);

    // Apply all blocks/absences/holidays
    const processedSlots = aplicarBloqueios(
      rawSlots,
      mockAgendamentos,
      mockAusencias,
      mockBloqueios,
      mockFeriados
    );

    // Return only free slots as time strings
    return processedSlots
      .filter((s) => s.status === "livre")
      .map((s) => format(s.dataHoraInicio, "HH:mm"));
  }, [profissionalId, date, duracaoServico]);
}

/**
 * Returns whether a date has any availability for any of the given professionals.
 */
export function useDateAvailability(
  profissionalIds: string[],
  date: Date | undefined,
  duracaoServico: number = 30
): boolean {
  return useMemo(() => {
    if (!date) return false;

    for (const profId of profissionalIds) {
      const horarios = mockHorarios.filter((h) => h.profissionalId === profId);
      if (horarios.length === 0) continue;

      const rawSlots = gerarSlots(horarios, date, duracaoServico);
      const processedSlots = aplicarBloqueios(
        rawSlots,
        mockAgendamentos,
        mockAusencias,
        mockBloqueios,
        mockFeriados
      );

      if (processedSlots.some((s) => s.status === "livre")) return true;
    }
    return false;
  }, [profissionalIds, date, duracaoServico]);
}

/**
 * Check if a specific date is fully blocked (holiday or no working hours).
 */
export function isDateBlocked(date: Date): boolean {
  // Holiday check
  if (mockFeriados.some((f) => 
    f.data.getFullYear() === date.getFullYear() &&
    f.data.getMonth() === date.getMonth() &&
    f.data.getDate() === date.getDate()
  )) {
    return true;
  }

  // Check if any professional works on this weekday
  const dia = getDay(date);
  return !mockHorarios.some((h) => h.diaSemana === dia);
}

/** Get holiday name if date is a holiday */
export function getHolidayName(date: Date): string | undefined {
  const f = mockFeriados.find((f) =>
    f.data.getFullYear() === date.getFullYear() &&
    f.data.getMonth() === date.getMonth() &&
    f.data.getDate() === date.getDate()
  );
  return f?.nome;
}
