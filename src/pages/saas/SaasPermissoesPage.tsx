import { useState } from "react";
import { Building2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const empresas = [
  { id: "e1", nome: "Clínica Beleza Pura" },
  { id: "e2", nome: "Studio Ana Costa" },
  { id: "e3", nome: "Estética Renovar" },
  { id: "e4", nome: "Espaço Zen" },
  { id: "e5", nome: "Clínica Derma+" },
  { id: "e7", nome: "Clínica Vitalidade" },
];

const funcionalidades = [
  { key: "agenda", label: "Agenda" },
  { key: "financeiro", label: "Financeiro" },
  { key: "prontuario", label: "Prontuário" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "teleconsulta", label: "Teleconsulta" },
  { key: "relatorios", label: "Relatórios" },
];

type Perms = Record<string, Record<string, boolean>>;

const initialPerms: Perms = {
  e1: { agenda: true, financeiro: true, prontuario: true, whatsapp: true, teleconsulta: false, relatorios: true },
  e2: { agenda: true, financeiro: true, prontuario: false, whatsapp: true, teleconsulta: false, relatorios: false },
  e3: { agenda: true, financeiro: true, prontuario: true, whatsapp: true, teleconsulta: true, relatorios: true },
  e4: { agenda: true, financeiro: false, prontuario: false, whatsapp: false, teleconsulta: false, relatorios: false },
  e5: { agenda: true, financeiro: true, prontuario: true, whatsapp: true, teleconsulta: false, relatorios: true },
  e7: { agenda: true, financeiro: true, prontuario: true, whatsapp: true, teleconsulta: true, relatorios: true },
};

export default function SaasPermissoesPage() {
  const [perms, setPerms] = useState<Perms>(initialPerms);
  const [selectedEmpresa, setSelectedEmpresa] = useState(empresas[0].id);

  const togglePerm = (func: string) => {
    setPerms((prev) => ({
      ...prev,
      [selectedEmpresa]: {
        ...prev[selectedEmpresa],
        [func]: !prev[selectedEmpresa]?.[func],
      },
    }));
  };

  const handleSave = () => {
    toast({ title: "Permissões salvas! ✅" });
  };

  const empresa = empresas.find((e) => e.id === selectedEmpresa);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Permissões por Empresa</h1>

      {/* Company selector */}
      <div className="flex gap-2 flex-wrap">
        {empresas.map((emp) => (
          <button
            key={emp.id}
            onClick={() => setSelectedEmpresa(emp.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
              selectedEmpresa === emp.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            {emp.nome}
          </button>
        ))}
      </div>

      {/* Permissions grid */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-5">
        <h2 className="text-sm font-semibold text-foreground">
          Funcionalidades — {empresa?.nome}
        </h2>
        <div className="space-y-4">
          {funcionalidades.map((func) => (
            <div key={func.key} className="flex items-center justify-between">
              <Label className="text-sm text-foreground font-medium">{func.label}</Label>
              <Switch
                checked={perms[selectedEmpresa]?.[func.key] ?? false}
                onCheckedChange={() => togglePerm(func.key)}
              />
            </div>
          ))}
        </div>
        <Button className="gap-2 rounded-xl" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Salvar Permissões
        </Button>
      </div>
    </div>
  );
}
