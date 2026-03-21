import { format, addMinutes, isSameDay, isWithinInterval, parseISO, startOfDay, endOfDay, addDays, getDay } from "date-fns";

/* ══════════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════════ */

export type SlotStatus = "livre" | "ocupado" | "bloqueado" | "encaixe";
export type SlotOrigem = "automatico" | "encaixe" | "bloqueio";
export type WaitlistStatus = "aguardando" | "notificado" | "atendido";

export interface HorarioFuncionamento {
  id: string;
  profissionalId: string;
  diaSemana: number; // 0=dom … 6=sab
  horaInicio: string; // "08:00"
  horaFim: string;    // "18:00"
  intervaloMinutos: number;
}

export interface SlotAgenda {
  id: string;
  profissionalId: string;
  dataHoraInicio: Date;
  dataHoraFim: Date;
  status: SlotStatus;
  origem: SlotOrigem;
  paciente?: string;
  servico?: string;
  observacao?: string;
}

export interface Ausencia {
  id: string;
  profissionalId: string;
  dataInicio: Date;
  dataFim: Date;
  diaTodo: boolean;
  horaInicio?: string;
  horaFim?: string;
  motivo: string;
}

export interface Feriado {
  data: Date;
  nome: string;
}

export interface BloqueioAgenda {
  id: string;
  profissionalId: string;
  dataInicio: Date;
  dataFim: Date;
  motivo: string;
}

export interface WaitlistEntry {
  id: string;
  paciente: string;
  servico: string;
  profissionalId: string;
  dataPreferida: Date;
  status: WaitlistStatus;
}

/* ══════════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════════ */

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/* ══════════════════════════════════════════════════════════════
   RC1 — Slot Generation
   ══════════════════════════════════════════════════════════════ */

export function gerarSlots(
  horarios: HorarioFuncionamento[],
  data: Date,
  duracaoServico: number = 30
): SlotAgenda[] {
  const diaSemana = getDay(data);
  const horariosHoje = horarios.filter((h) => h.diaSemana === diaSemana);
  const slots: SlotAgenda[] = [];

  for (const h of horariosHoje) {
    const inicio = timeToMinutes(h.horaInicio);
    const fim = timeToMinutes(h.horaFim);
    const intervalo = h.intervaloMinutos || duracaoServico;

    for (let t = inicio; t + intervalo <= fim; t += intervalo) {
      const dataInicio = new Date(data);
      dataInicio.setHours(Math.floor(t / 60), t % 60, 0, 0);
      const dataFim = addMinutes(dataInicio, intervalo);

      slots.push({
        id: `${h.profissionalId}-${format(dataInicio, "HHmm")}`,
        profissionalId: h.profissionalId,
        dataHoraInicio: dataInicio,
        dataHoraFim: dataFim,
        status: "livre",
        origem: "automatico",
      });
    }
  }

  return slots;
}

/* ══════════════════════════════════════════════════════════════
   RC2 — Conflict Validation
   ══════════════════════════════════════════════════════════════ */

export function verificarConflito(
  slot: SlotAgenda,
  agendamentos: SlotAgenda[],
  ausencias: Ausencia[],
  bloqueios: BloqueioAgenda[],
  feriados: Feriado[]
): { conflito: boolean; motivo?: string } {
  // Check holidays
  if (feriados.some((f) => isSameDay(f.data, slot.dataHoraInicio))) {
    return { conflito: true, motivo: "Feriado" };
  }

  // Check absences
  for (const a of ausencias) {
    if (a.profissionalId !== slot.profissionalId) continue;
    if (a.diaTodo) {
      if (slot.dataHoraInicio >= startOfDay(a.dataInicio) && slot.dataHoraInicio <= endOfDay(a.dataFim)) {
        return { conflito: true, motivo: `Ausência: ${a.motivo}` };
      }
    } else if (a.horaInicio && a.horaFim && isSameDay(slot.dataHoraInicio, a.dataInicio)) {
      const ausInicio = timeToMinutes(a.horaInicio);
      const ausFim = timeToMinutes(a.horaFim);
      const slotInicio = slot.dataHoraInicio.getHours() * 60 + slot.dataHoraInicio.getMinutes();
      if (slotInicio >= ausInicio && slotInicio < ausFim) {
        return { conflito: true, motivo: `Ausência: ${a.motivo}` };
      }
    }
  }

  // Check blocks
  for (const b of bloqueios) {
    if (b.profissionalId !== slot.profissionalId) continue;
    if (slot.dataHoraInicio >= b.dataInicio && slot.dataHoraInicio < b.dataFim) {
      return { conflito: true, motivo: `Bloqueio: ${b.motivo}` };
    }
  }

  // Check existing appointments
  for (const ag of agendamentos) {
    if (ag.profissionalId !== slot.profissionalId) continue;
    if (ag.status === "livre") continue;
    if (
      slot.dataHoraInicio < ag.dataHoraFim &&
      slot.dataHoraFim > ag.dataHoraInicio
    ) {
      return { conflito: true, motivo: "Horário já ocupado" };
    }
  }

  return { conflito: false };
}

/* ══════════════════════════════════════════════════════════════
   RC3-5 — Apply blocks, absences, holidays to slots
   ══════════════════════════════════════════════════════════════ */

export function aplicarBloqueios(
  slots: SlotAgenda[],
  agendamentos: SlotAgenda[],
  ausencias: Ausencia[],
  bloqueios: BloqueioAgenda[],
  feriados: Feriado[]
): SlotAgenda[] {
  return slots.map((slot) => {
    // Already occupied from real appointments
    const agendado = agendamentos.find(
      (a) =>
        a.profissionalId === slot.profissionalId &&
        a.status === "ocupado" &&
        slot.dataHoraInicio >= a.dataHoraInicio &&
        slot.dataHoraInicio < a.dataHoraFim
    );
    if (agendado) {
      return { ...slot, status: "ocupado" as SlotStatus, paciente: agendado.paciente, servico: agendado.servico };
    }

    const { conflito } = verificarConflito(slot, [], ausencias, bloqueios, feriados);
    if (conflito) {
      return { ...slot, status: "bloqueado" as SlotStatus };
    }

    return slot;
  });
}

/* ══════════════════════════════════════════════════════════════
   RC6 — Encaixe (Manual Extra Slot)
   ══════════════════════════════════════════════════════════════ */

export function criarEncaixe(
  profissionalId: string,
  dataHoraInicio: Date,
  duracaoMinutos: number,
  paciente: string,
  servico: string
): SlotAgenda {
  return {
    id: `encaixe-${Date.now()}`,
    profissionalId,
    dataHoraInicio,
    dataHoraFim: addMinutes(dataHoraInicio, duracaoMinutos),
    status: "ocupado",
    origem: "encaixe",
    paciente,
    servico,
  };
}

/* ══════════════════════════════════════════════════════════════
   RC7 — Waitlist check on cancellation
   ══════════════════════════════════════════════════════════════ */

export function verificarListaEspera(
  slot: SlotAgenda,
  listaEspera: WaitlistEntry[]
): WaitlistEntry | null {
  return (
    listaEspera.find(
      (e) =>
        e.status === "aguardando" &&
        e.profissionalId === slot.profissionalId &&
        isSameDay(e.dataPreferida, slot.dataHoraInicio)
    ) || null
  );
}

/* ══════════════════════════════════════════════════════════════
   Metrics
   ══════════════════════════════════════════════════════════════ */

export function calcularMetricas(slots: SlotAgenda[]) {
  const total = slots.length;
  const livres = slots.filter((s) => s.status === "livre").length;
  const ocupados = slots.filter((s) => s.status === "ocupado").length;
  const bloqueados = slots.filter((s) => s.status === "bloqueado").length;
  const encaixes = slots.filter((s) => s.origem === "encaixe").length;
  const taxaOcupacao = total > 0 ? Math.round((ocupados / (total - bloqueados)) * 100) : 0;

  return { total, livres, ocupados, bloqueados, encaixes, taxaOcupacao };
}

/* ══════════════════════════════════════════════════════════════
   Generate week slots
   ══════════════════════════════════════════════════════════════ */

export function gerarSlotsSemana(
  horarios: HorarioFuncionamento[],
  dataInicio: Date,
  duracaoServico: number = 30
): SlotAgenda[] {
  const allSlots: SlotAgenda[] = [];
  for (let i = 0; i < 7; i++) {
    const dia = addDays(dataInicio, i);
    allSlots.push(...gerarSlots(horarios, dia, duracaoServico));
  }
  return allSlots;
}
