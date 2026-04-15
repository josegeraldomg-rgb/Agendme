import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  useOnboarding,
  slugify,
  type EmpresaFormData,
  type AparenciaFormData,
  type ProfissionalFormData,
} from "@/hooks/use-onboarding";
import logo from "@/assets/logo-agendme.png";

// ────────────────────────────────────────────────────────────
// Constantes
// ────────────────────────────────────────────────────────────
const SEGMENTOS = [
  { value: "estetica", label: "Estética" },
  { value: "beleza", label: "Beleza" },
  { value: "saude", label: "Saúde" },
  { value: "odontologia", label: "Odontologia" },
  { value: "fisioterapia", label: "Fisioterapia" },
  { value: "psicologia", label: "Psicologia" },
  { value: "nutrição", label: "Nutrição" },
  { value: "outro", label: "Outro" },
];

const CORES = [
  "#7c3aed",
  "#6d28d9",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#db2777",
];

const ESPECIALIDADES = [
  "Esteticista",
  "Dermatologista",
  "Fisioterapeuta",
  "Nutricionista",
  "Psicólogo(a)",
  "Dentista",
  "Terapeuta",
  "Massagista",
  "Maquiador(a)",
  "Cabeleireiro(a)",
  "Manicure",
  "Outro",
];

// ────────────────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { completarOnboarding, loading: saving } = useOnboarding();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Step 1
  const [empresa, setEmpresa] = useState<EmpresaFormData>({
    nome: "",
    slug: "",
    email: "",
    telefone: "",
    segmento: "",
  });
  const [slugManual, setSlugManual] = useState(false);

  // Step 2
  const [aparencia, setAparencia] = useState<AparenciaFormData>({
    corPrimaria: "#7c3aed",
    nomeExibicao: "",
  });

  // Step 3
  const [profissional, setProfissional] = useState<ProfissionalFormData>({
    nome: "",
    email: "",
    especialidade: "",
    comissaoPercentual: 50,
  });

  // Guards
  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate("/login");
      else if (profile?.empresa_id) navigate("/dashboard");
    }
  }, [authLoading, user, profile, navigate]);

  // Auto-slug from nome
  useEffect(() => {
    if (!slugManual && empresa.nome) {
      setEmpresa((prev) => ({ ...prev, slug: slugify(empresa.nome) }));
    }
  }, [empresa.nome, slugManual]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // ── Validações por step ──
  const canAdvanceStep1 =
    empresa.nome.trim().length >= 2 &&
    empresa.slug.trim().length >= 2 &&
    empresa.segmento !== "";

  const canAdvanceStep2 = aparencia.corPrimaria !== "";

  const canFinish =
    profissional.nome.trim().length >= 2 &&
    profissional.especialidade !== "" &&
    profissional.comissaoPercentual >= 0 &&
    profissional.comissaoPercentual <= 100;

  const handleFinish = () => {
    completarOnboarding(empresa, aparencia, profissional);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0f0a1e]">
      {/* Animated mesh gradient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.45) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(37,99,235,0.3) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(219,39,119,0.2) 0%, transparent 70%)",
        }}
      />

      {/* Subtle grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-lg px-4 py-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-900/40 mb-3">
            <img src={logo} alt="AgendMe" className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AgendMe</h1>
          <p className="text-sm text-purple-300/80 mt-1">Configure sua clínica em minutos</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
                style={{
                  width: 32,
                  height: 32,
                  background:
                    s < step
                      ? "linear-gradient(135deg, #7c3aed, #2563eb)"
                      : s === step
                      ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                      : "rgba(255,255,255,0.08)",
                  color: s <= step ? "white" : "rgba(255,255,255,0.3)",
                  boxShadow: s === step ? "0 0 16px rgba(124,58,237,0.6)" : "none",
                  border: s === step ? "2px solid rgba(168,85,247,0.6)" : "2px solid transparent",
                }}
              >
                {s < step ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 3 && (
                <div
                  className="h-px w-10 transition-all duration-500"
                  style={{
                    background:
                      s < step
                        ? "linear-gradient(90deg, #7c3aed, #2563eb)"
                        : "rgba(255,255,255,0.1)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* ── Step 1: Dados da clínica ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Sobre sua clínica</h2>
                <p className="text-sm text-white/50 mt-1">Vamos começar com as informações básicas</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white/70 text-sm mb-1.5 block">Nome da clínica *</Label>
                  <Input
                    id="onboarding-nome"
                    value={empresa.nome}
                    onChange={(e) => setEmpresa((p) => ({ ...p, nome: e.target.value }))}
                    placeholder="Ex: Clínica Bella Vista"
                    className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <Label className="text-white/70 text-sm mb-1.5 block">Endereço da sua página *</Label>
                  <div className="flex items-center rounded-xl overflow-hidden border border-white/10 bg-white/5 focus-within:border-purple-500">
                    <span className="pl-3 pr-1 text-sm text-white/30 whitespace-nowrap select-none">agendme.app/</span>
                    <input
                      id="onboarding-slug"
                      value={empresa.slug}
                      onChange={(e) => {
                        setSlugManual(true);
                        setEmpresa((p) => ({ ...p, slug: slugify(e.target.value) }));
                      }}
                      placeholder="minha-clinica"
                      className="flex-1 bg-transparent h-11 text-white text-sm outline-none pr-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white/70 text-sm mb-1.5 block">Telefone</Label>
                    <Input
                      id="onboarding-telefone"
                      value={empresa.telefone}
                      onChange={(e) => setEmpresa((p) => ({ ...p, telefone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70 text-sm mb-1.5 block">E-mail</Label>
                    <Input
                      id="onboarding-email"
                      type="email"
                      value={empresa.email}
                      onChange={(e) => setEmpresa((p) => ({ ...p, email: e.target.value }))}
                      placeholder="contato@clinica.com"
                      className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white/70 text-sm mb-2 block">Segmento *</Label>
                  <div className="flex flex-wrap gap-2">
                    {SEGMENTOS.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setEmpresa((p) => ({ ...p, segmento: s.value }))}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                        style={{
                          background:
                            empresa.segmento === s.value
                              ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                              : "rgba(255,255,255,0.06)",
                          border:
                            empresa.segmento === s.value
                              ? "1px solid rgba(168,85,247,0.5)"
                              : "1px solid rgba(255,255,255,0.08)",
                          color: empresa.segmento === s.value ? "white" : "rgba(255,255,255,0.5)",
                          boxShadow:
                            empresa.segmento === s.value
                              ? "0 0 12px rgba(124,58,237,0.4)"
                              : "none",
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                id="onboarding-next-1"
                onClick={() => setStep(2)}
                disabled={!canAdvanceStep1}
                className="w-full h-12 rounded-xl font-semibold text-sm mt-2"
                style={{
                  background: canAdvanceStep1
                    ? "linear-gradient(135deg, #7c3aed, #2563eb)"
                    : "rgba(255,255,255,0.08)",
                  color: canAdvanceStep1 ? "white" : "rgba(255,255,255,0.3)",
                  border: "none",
                  boxShadow: canAdvanceStep1 ? "0 4px 20px rgba(124,58,237,0.4)" : "none",
                }}
              >
                Continuar →
              </Button>
            </div>
          )}

          {/* ── Step 2: Aparência ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Aparência da clínica</h2>
                <p className="text-sm text-white/50 mt-1">Como seus clientes verão sua clínica online</p>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-white/70 text-sm mb-2 block">Nome de exibição (opcional)</Label>
                  <Input
                    id="onboarding-nome-exibicao"
                    value={aparencia.nomeExibicao}
                    onChange={(e) => setAparencia((p) => ({ ...p, nomeExibicao: e.target.value }))}
                    placeholder={empresa.nome}
                    className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-purple-500"
                  />
                  <p className="text-xs text-white/30 mt-1">Deixe em branco para usar o nome da clínica</p>
                </div>

                <div>
                  <Label className="text-white/70 text-sm mb-3 block">Cor principal da marca *</Label>
                  <div className="flex flex-wrap gap-3">
                    {CORES.map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        onClick={() => setAparencia((p) => ({ ...p, corPrimaria: cor }))}
                        className="relative h-10 w-10 rounded-xl transition-all duration-200"
                        style={{
                          background: cor,
                          boxShadow:
                            aparencia.corPrimaria === cor
                              ? `0 0 0 3px rgba(255,255,255,0.9), 0 0 16px ${cor}88`
                              : "0 2px 8px rgba(0,0,0,0.3)",
                          transform: aparencia.corPrimaria === cor ? "scale(1.15)" : "scale(1)",
                        }}
                      >
                        {aparencia.corPrimaria === cor && (
                          <svg className="absolute inset-0 m-auto" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8l3.5 3.5L13 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview card */}
                <div
                  className="rounded-2xl p-5 mt-2"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-medium">Prévia</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                      style={{ background: aparencia.corPrimaria, boxShadow: `0 4px 12px ${aparencia.corPrimaria}66` }}
                    >
                      {(aparencia.nomeExibicao || empresa.nome).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {aparencia.nomeExibicao || empresa.nome || "Minha Clínica"}
                      </p>
                      <p className="text-white/40 text-xs">agendme.app/{empresa.slug || "minha-clinica"}</p>
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 rounded-full" style={{ background: `${aparencia.corPrimaria}33` }}>
                    <div className="h-full w-3/5 rounded-full" style={{ background: aparencia.corPrimaria }} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  id="onboarding-back-2"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-12 rounded-xl border-white/10 text-white/70 bg-white/5 hover:bg-white/10 hover:text-white"
                >
                  ← Voltar
                </Button>
                <Button
                  id="onboarding-next-2"
                  onClick={() => setStep(3)}
                  disabled={!canAdvanceStep2}
                  className="flex-[2] h-12 rounded-xl font-semibold text-sm"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                  }}
                >
                  Continuar →
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Primeiro profissional ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Seu perfil profissional</h2>
                <p className="text-sm text-white/50 mt-1">Você será o primeiro profissional da clínica</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white/70 text-sm mb-1.5 block">Seu nome completo *</Label>
                  <Input
                    id="onboarding-prof-nome"
                    value={profissional.nome}
                    onChange={(e) => setProfissional((p) => ({ ...p, nome: e.target.value }))}
                    placeholder="Ex: Dra. Ana Paula"
                    className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-purple-500"
                  />
                </div>

                <div>
                  <Label className="text-white/70 text-sm mb-1.5 block">E-mail profissional</Label>
                  <Input
                    id="onboarding-prof-email"
                    type="email"
                    value={profissional.email}
                    onChange={(e) => setProfissional((p) => ({ ...p, email: e.target.value }))}
                    placeholder="profissional@clinica.com"
                    className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-purple-500"
                  />
                </div>

                <div>
                  <Label className="text-white/70 text-sm mb-2 block">Especialidade *</Label>
                  <div className="flex flex-wrap gap-2">
                    {ESPECIALIDADES.map((esp) => (
                      <button
                        key={esp}
                        type="button"
                        onClick={() => setProfissional((p) => ({ ...p, especialidade: esp }))}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                        style={{
                          background:
                            profissional.especialidade === esp
                              ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                              : "rgba(255,255,255,0.06)",
                          border:
                            profissional.especialidade === esp
                              ? "1px solid rgba(168,85,247,0.5)"
                              : "1px solid rgba(255,255,255,0.08)",
                          color:
                            profissional.especialidade === esp
                              ? "white"
                              : "rgba(255,255,255,0.5)",
                          boxShadow:
                            profissional.especialidade === esp
                              ? "0 0 12px rgba(124,58,237,0.4)"
                              : "none",
                        }}
                      >
                        {esp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-white/70 text-sm mb-1.5 block">
                    Comissão do profissional: <span className="text-purple-400 font-bold">{profissional.comissaoPercentual}%</span>
                  </Label>
                  <input
                    id="onboarding-comissao"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={profissional.comissaoPercentual}
                    onChange={(e) =>
                      setProfissional((p) => ({ ...p, comissaoPercentual: Number(e.target.value) }))
                    }
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-white/30 mt-1">
                    <span>0% (empresa)</span>
                    <span>50% / 50%</span>
                    <span>100% (prof.)</span>
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl p-4 text-xs text-white/50"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                ✨ Você pode adicionar mais profissionais e ajustar configurações depois no painel.
              </div>

              <div className="flex gap-3">
                <Button
                  id="onboarding-back-3"
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={saving}
                  className="flex-1 h-12 rounded-xl border-white/10 text-white/70 bg-white/5 hover:bg-white/10 hover:text-white"
                >
                  ← Voltar
                </Button>
                <Button
                  id="onboarding-finish"
                  onClick={handleFinish}
                  disabled={!canFinish || saving}
                  className="flex-[2] h-12 rounded-xl font-semibold text-sm"
                  style={{
                    background: canFinish && !saving
                      ? "linear-gradient(135deg, #7c3aed, #2563eb)"
                      : "rgba(255,255,255,0.08)",
                    border: "none",
                    color: canFinish && !saving ? "white" : "rgba(255,255,255,0.3)",
                    boxShadow: canFinish && !saving ? "0 4px 20px rgba(124,58,237,0.4)" : "none",
                  }}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Criando...
                    </span>
                  ) : (
                    "Criar minha clínica 🚀"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          AgendMe — Plataforma SaaS para clínicas · Trial de 14 dias gratuito
        </p>
      </div>
    </div>
  );
}
