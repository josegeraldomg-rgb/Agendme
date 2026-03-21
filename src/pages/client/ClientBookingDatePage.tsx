import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const mockTimeSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"];

export default function ClientBookingDatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const servicoId = searchParams.get("servico") || "";
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      navigate(`/app/agendar/confirmacao?servico=${servicoId}&data=${dateStr}&hora=${selectedTime}`);
    }
  };

  const today = new Date();

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">Escolha data e horário</h1>
      </div>

      <div className="px-4 pt-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ptBR}
          disabled={(date) => date < today || date > addDays(today, 60)}
          className={cn("p-3 pointer-events-auto rounded-xl border border-border bg-card mx-auto")}
        />

        {selectedDate && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Horários disponíveis — {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {mockTimeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "py-2.5 rounded-lg text-sm font-medium border transition-all",
                    selectedTime === time
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/30"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          className="w-full mt-6 mb-6 h-12 rounded-xl text-sm font-semibold"
          disabled={!selectedDate || !selectedTime}
          onClick={handleContinue}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
