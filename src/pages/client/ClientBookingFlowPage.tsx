import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, DollarSign, Star, Upload, X, MessageCircle, ChevronRight, Check, CreditCard, QrCode, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

// --- Mock Data ---
const mockCategories = [
  { id: "1", nome: "Estética Facial", icon: "✨", count: 4 },
  { id: "2", nome: "Estética Corporal", icon: "💆", count: 2 },
  { id: "3", nome: "Depilação", icon: "🌿", count: 2 },
  { id: "4", nome: "Massagens", icon: "🤲", count: 3 },
  { id: "5", nome: "Cabelo", icon: "💇", count: 4 },
  { id: "6", nome: "Unhas", icon: "💅", count: 3 },
];

const mockServices: Record<string, { id: string; nome: string; preco: number; duracao: number; descricao: string; whatsappOnly?: boolean }[]> = {
  "1": [
    { id: "s1", nome: "Limpeza de Pele", preco: 150, duracao: 60, descricao: "Limpeza profunda com extração de cravos e espinhas" },
    { id: "s2", nome: "Peeling Químico", preco: 280, duracao: 45, descricao: "Renovação celular com ácidos" },
    { id: "s3", nome: "Microagulhamento", preco: 350, duracao: 50, descricao: "Estímulo de colágeno", whatsappOnly: true },
    { id: "s4", nome: "Botox", preco: 800, duracao: 30, descricao: "Toxina botulínica para rugas", whatsappOnly: true },
  ],
  "2": [
    { id: "s5", nome: "Drenagem Linfática", preco: 120, duracao: 60, descricao: "Massagem para reduzir inchaço" },
    { id: "s6", nome: "Criolipólise", preco: 500, duracao: 40, descricao: "Congelamento de gordura localizada" },
  ],
  "3": [
    { id: "s7", nome: "Depilação a Laser", preco: 200, duracao: 30, descricao: "Laser de diodo" },
    { id: "s8", nome: "Depilação com Cera", preco: 80, duracao: 20, descricao: "Cera morna" },
  ],
  "4": [
    { id: "s9", nome: "Massagem Relaxante", preco: 130, duracao: 60, descricao: "Massagem suave para relaxamento" },
    { id: "s10", nome: "Massagem Modeladora", preco: 160, duracao: 50, descricao: "Massagem para modelar o corpo" },
    { id: "s11", nome: "Reflexologia", preco: 100, duracao: 40, descricao: "Massagem nos pés" },
  ],
  "5": [
    { id: "s12", nome: "Corte Feminino", preco: 90, duracao: 45, descricao: "Corte e finalização" },
    { id: "s13", nome: "Coloração", preco: 200, duracao: 90, descricao: "Coloração completa" },
    { id: "s14", nome: "Escova Progressiva", preco: 250, duracao: 120, descricao: "Alisamento progressivo" },
    { id: "s15", nome: "Hidratação", preco: 80, duracao: 40, descricao: "Hidratação profunda" },
  ],
  "6": [
    { id: "s16", nome: "Manicure", preco: 40, duracao: 30, descricao: "Esmaltação simples" },
    { id: "s17", nome: "Pedicure", preco: 50, duracao: 40, descricao: "Cuidados com os pés" },
    { id: "s18", nome: "Unhas em Gel", preco: 120, duracao: 60, descricao: "Alongamento em gel" },
  ],
};

const mockProfessionals = [
  { id: "p1", nome: "Dra. Ana Silva", especialidade: "Dermatologista", rating: 4.9, avatar: "AS", slots: ["08:00", "08:30", "09:00", "10:00", "14:00", "15:00"] },
  { id: "p2", nome: "Dr. Carlos Mendes", especialidade: "Esteticista", rating: 4.7, avatar: "CM", slots: ["09:00", "09:30", "10:30", "11:00", "14:30", "16:00"] },
  { id: "p3", nome: "Dra. Mariana Costa", especialidade: "Fisioterapeuta", rating: 4.8, avatar: "MC", slots: ["08:00", "10:00", "11:00", "14:00", "15:30", "16:30"] },
];

// Company config mock
const companyConfig = {
  requireAdvancePayment: false, // toggle to test payment step
  advancePaymentPercent: 30,
  whatsappNumber: "5511999999999",
};

type Step = "category" | "service" | "date" | "professional" | "attachment" | "finalize";

export default function ClientBookingFlowPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("category");

  // Selections
  const [selectedCategory, setSelectedCategory] = useState<typeof mockCategories[0] | null>(null);
  const [selectedService, setSelectedService] = useState<typeof mockServices["1"][0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedProfessional, setSelectedProfessional] = useState<typeof mockProfessionals[0] | null>(null);
  const [selectedTime, setSelectedTime] = useState("");

  // Attachment & notes
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [observacao, setObservacao] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Finalize
  const [finalizeMode, setFinalizeMode] = useState<"login" | "whatsapp" | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date();

  // --- Handlers ---
  const handleSelectCategory = (cat: typeof mockCategories[0]) => {
    setSelectedCategory(cat);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedProfessional(null);
    setSelectedTime("");
    setStep("service");
  };

  const handleSelectService = (svc: typeof mockServices["1"][0]) => {
    if (svc.whatsappOnly) {
      const msg = encodeURIComponent(`Olá! Gostaria de agendar: ${svc.nome}`);
      window.open(`https://wa.me/${companyConfig.whatsappNumber}?text=${msg}`, "_blank");
      return;
    }
    setSelectedService(svc);
    setSelectedDate(undefined);
    setSelectedProfessional(null);
    setSelectedTime("");
    setStep("date");
  };

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedProfessional(null);
    setSelectedTime("");
    if (date) setStep("professional");
  };

  const handleSelectTimeSlot = (prof: typeof mockProfessionals[0], time: string) => {
    setSelectedProfessional(prof);
    setSelectedTime(time);
    setStep("attachment");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAttachmentPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleContinueToFinalize = () => {
    setStep("finalize");
  };

  const handleConfirmViaLogin = () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      toast({ title: "Preencha nome, email e senha", variant: "destructive" });
      return;
    }
    if (companyConfig.requireAdvancePayment && !paymentMethod) {
      toast({ title: "Selecione um meio de pagamento", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Agendamento confirmado! ✅", description: "Você receberá uma confirmação por WhatsApp." });
      navigate("/app/historico");
    }, 1500);
  };

  const handleConfirmViaWhatsApp = () => {
    if (!nome.trim() || !telefone.trim()) {
      toast({ title: "Preencha nome e telefone", variant: "destructive" });
      return;
    }
    const dateStr = selectedDate ? format(selectedDate, "dd/MM/yyyy") : "";
    const msg = encodeURIComponent(
      `Olá! Gostaria de agendar:\n\n` +
      `📋 Serviço: ${selectedService?.nome}\n` +
      `📅 Data: ${dateStr}\n` +
      `🕐 Horário: ${selectedTime}\n` +
      `👨‍⚕️ Profissional: ${selectedProfessional?.nome}\n` +
      `👤 Nome: ${nome}\n` +
      `📱 Telefone: ${telefone}\n` +
      (observacao ? `📝 Obs: ${observacao}\n` : "")
    );
    window.open(`https://wa.me/${companyConfig.whatsappNumber}?text=${msg}`, "_blank");
    toast({ title: "Redirecionando para WhatsApp...", description: "Finalize seu agendamento pela conversa." });
  };

  // --- Edit handlers (click on summary chips) ---
  const handleEditCategory = () => {
    setStep("category");
    setSelectedCategory(null);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedProfessional(null);
    setSelectedTime("");
  };

  const handleEditService = () => {
    setStep("service");
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedProfessional(null);
    setSelectedTime("");
  };

  const handleEditDate = () => {
    setStep("date");
    setSelectedDate(undefined);
    setSelectedProfessional(null);
    setSelectedTime("");
  };

  const handleEditProfessional = () => {
    setStep("professional");
    setSelectedProfessional(null);
    setSelectedTime("");
  };

  // --- Steps order for "go back" ---
  const stepsOrder: Step[] = ["category", "service", "date", "professional", "attachment", "finalize"];
  const currentIdx = stepsOrder.indexOf(step);

  const handleBack = () => {
    if (currentIdx <= 0) {
      navigate("/app");
    } else {
      const prevStep = stepsOrder[currentIdx - 1];
      setStep(prevStep);
    }
  };

  // --- Render ---
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">Agendar Serviço</h1>
      </div>

      {/* Summary Bar */}
      {(selectedCategory || selectedService || selectedDate || selectedProfessional) && (
        <div className="bg-accent/40 border-b border-border px-4 py-2.5 flex flex-wrap gap-2">
          {selectedCategory && (
            <button onClick={handleEditCategory} className="inline-flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1 text-xs font-medium text-foreground hover:border-primary/50 transition-colors">
              <span>{selectedCategory.icon}</span>
              <span>{selectedCategory.nome}</span>
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          {selectedService && (
            <button onClick={handleEditService} className="inline-flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1 text-xs font-medium text-foreground hover:border-primary/50 transition-colors">
              <span>{selectedService.nome}</span>
              <span className="text-primary font-semibold">R$ {selectedService.preco}</span>
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          {selectedDate && (
            <button onClick={handleEditDate} className="inline-flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1 text-xs font-medium text-foreground hover:border-primary/50 transition-colors">
              <span>{format(selectedDate, "dd/MM", { locale: ptBR })}</span>
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          {selectedProfessional && selectedTime && (
            <button onClick={handleEditProfessional} className="inline-flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1 text-xs font-medium text-foreground hover:border-primary/50 transition-colors">
              <span>{selectedProfessional.nome.split(" ")[0]}</span>
              <span className="text-primary">{selectedTime}</span>
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 px-4 pt-4 pb-6">
        {/* STEP 1: Category */}
        {step === "category" && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Escolha a categoria</h2>
            <div className="grid grid-cols-2 gap-3">
              {mockCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all text-left"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{cat.nome}</p>
                    <p className="text-xs text-muted-foreground">{cat.count} serviços</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Service */}
        {step === "service" && selectedCategory && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Escolha o serviço</h2>
            <div className="space-y-3">
              {(mockServices[selectedCategory.id] || []).map((svc) => (
                <div
                  key={svc.id}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <h3 className="font-medium text-foreground text-sm">{svc.nome}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{svc.descricao}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-primary font-semibold">
                      <DollarSign className="h-3.5 w-3.5" /> R$ {svc.preco.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {svc.duracao} min
                    </span>
                  </div>
                  <div className="mt-3">
                    {svc.whatsappOnly ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-9 text-xs gap-1.5 border-success text-success hover:bg-success/10"
                        onClick={() => handleSelectService(svc)}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Chamar no WhatsApp
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full h-9 text-xs"
                        onClick={() => handleSelectService(svc)}
                      >
                        Agendar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Date */}
        {step === "date" && selectedService && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Escolha a data</h2>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelectDate}
              locale={ptBR}
              disabled={(date) => date < today || date > addDays(today, 60)}
              className={cn("p-0 pointer-events-auto rounded-xl border border-border bg-card w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full [&_.rdp-head_row]:flex [&_.rdp-head_row]:justify-around [&_.rdp-row]:flex [&_.rdp-row]:justify-around [&_.rdp-cell]:flex-1 [&_.rdp-cell]:flex [&_.rdp-cell]:justify-center [&_.rdp-day]:w-full [&_.rdp-day]:h-11 [&_.rdp-head_cell]:flex-1 [&_.rdp-head_cell]:text-center [&_.rdp-caption]:px-4 [&_.rdp-caption]:pt-3")}
            />
          </div>
        )}

        {/* STEP 4: Professional + Time */}
        {step === "professional" && selectedDate && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Profissional e horário — {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h2>
            <div className="space-y-4">
              {mockProfessionals.map((prof) => (
                <div key={prof.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-sm">{prof.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{prof.nome}</p>
                      <p className="text-xs text-muted-foreground">{prof.especialidade}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      <span className="text-xs font-medium text-foreground">{prof.rating}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {prof.slots.map((time) => (
                      <button
                        key={`${prof.id}-${time}`}
                        onClick={() => handleSelectTimeSlot(prof, time)}
                        className={cn(
                          "py-2 rounded-lg text-sm font-medium border transition-all",
                          selectedProfessional?.id === prof.id && selectedTime === time
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:border-primary/40"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Attachment */}
        {step === "attachment" && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Anexo e observações (opcional)</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-foreground">Anexar imagem</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {attachmentPreview ? (
                  <div className="mt-2 relative">
                    <img src={attachmentPreview} alt="Anexo" className="w-full h-40 object-cover rounded-xl border border-border" />
                    <button
                      onClick={() => { setAttachmentPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="absolute top-2 right-2 bg-card/90 rounded-full p-1 border border-border"
                    >
                      <X className="h-4 w-4 text-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/30 transition-colors"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-xs">Toque para enviar uma foto</span>
                    <span className="text-[10px]">Ex: foto de uma marca na pele para avaliação</span>
                  </button>
                )}
              </div>
              <div>
                <Label className="text-sm text-foreground">Observações para o profissional</Label>
                <Textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Descreva algo relevante para o atendimento..."
                  className="mt-1 rounded-xl"
                  rows={3}
                />
              </div>
              <Button className="w-full h-12 rounded-xl text-sm font-semibold" onClick={handleContinueToFinalize}>
                Continuar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 6: Finalize - Login or WhatsApp */}
        {step === "finalize" && (
          <div>
            {/* Booking summary */}
            <div className="bg-accent/50 rounded-xl p-4 space-y-2 mb-5">
              <h2 className="text-sm font-semibold text-foreground">Resumo do agendamento</h2>
              <div className="text-sm text-foreground space-y-1">
                <p>📋 {selectedService?.nome} — <span className="text-primary font-semibold">R$ {selectedService?.preco.toFixed(2)}</span></p>
                <p>📅 {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ""}</p>
                <p>🕐 {selectedTime}</p>
                <p>👨‍⚕️ {selectedProfessional?.nome}</p>
                {observacao && <p>📝 {observacao}</p>}
              </div>
            </div>

            {/* Payment section (if company requires) */}
            {companyConfig.requireAdvancePayment && (
              <div className="bg-card rounded-xl border border-border p-4 mb-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">Pagamento antecipado</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Esta clínica requer {companyConfig.advancePaymentPercent}% de antecipação para confirmar o agendamento.
                </p>
                <p className="text-sm font-bold text-primary mb-3">
                  Valor: R$ {((selectedService?.preco || 0) * companyConfig.advancePaymentPercent / 100).toFixed(2)}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "pix", label: "Pix", icon: QrCode },
                    { id: "cartao", label: "Cartão", icon: CreditCard },
                    { id: "mercado_pago", label: "Mercado Pago", icon: Smartphone },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all",
                        paymentMethod === m.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/40"
                      )}
                    >
                      <m.icon className="h-5 w-5" />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Choose finalize mode */}
            {!finalizeMode && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Como deseja confirmar?</h3>
                <button
                  onClick={() => setFinalizeMode("login")}
                  className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/40 transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-foreground">Criar conta / Entrar</p>
                    <p className="text-xs text-muted-foreground">Acompanhe seus agendamentos pelo app</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setFinalizeMode("whatsapp")}
                  className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-success/30 hover:border-success/60 transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-foreground">Enviar via WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Sem cadastro, rápido e direto</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Login / Register form */}
            {finalizeMode === "login" && (
              <div className="space-y-4 mt-4">
                <h3 className="text-sm font-semibold text-foreground">Seus dados</h3>
                <div>
                  <Label className="text-xs">Nome completo *</Label>
                  <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="mt-1 h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Email *</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" type="email" className="mt-1 h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Senha *</Label>
                  <Input value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Crie uma senha" type="password" className="mt-1 h-11 rounded-xl" />
                </div>
                <Button
                  className="w-full h-12 rounded-xl text-sm font-semibold"
                  onClick={handleConfirmViaLogin}
                  disabled={loading}
                >
                  {loading ? "Confirmando..." : "Confirmar Agendamento"}
                </Button>
                <button onClick={() => setFinalizeMode(null)} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
                  ← Voltar às opções
                </button>
              </div>
            )}

            {/* WhatsApp form */}
            {finalizeMode === "whatsapp" && (
              <div className="space-y-4 mt-4">
                <h3 className="text-sm font-semibold text-foreground">Seus dados</h3>
                <div>
                  <Label className="text-xs">Nome *</Label>
                  <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="mt-1 h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Telefone *</Label>
                  <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" className="mt-1 h-11 rounded-xl" />
                </div>
                <Button
                  className="w-full h-12 rounded-xl text-sm font-semibold gap-2 bg-success hover:bg-success/90"
                  onClick={handleConfirmViaWhatsApp}
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar pelo WhatsApp
                </Button>
                <button onClick={() => setFinalizeMode(null)} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
                  ← Voltar às opções
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
