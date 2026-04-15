import { useState } from "react";
import { Building2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSaasEmpresas, useUpdateEmpresaConfig } from "@/hooks/use-saas";

const funcionalidades = [
  { key: "agenda",        label: "Agenda"       },
  { key: "financeiro",    label: "Financeiro"   },
  { key: "prontuario",    label: "Prontuário"   },
  { key: "whatsapp",      label: "WhatsApp"     },
  { key: "teleconsulta",  label: "Teleconsulta" },
  { key: "relatorios",    label: "Relatórios"   },
];

type Perms = Record<string, boolean>;

export default function SaasPermissoesPage() {
  const { data: empresas = [], isLoading } = useSaasEmpresas();
  const updateConfig = useUpdateEmpresaConfig();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localPerms, setLocalPerms] = useState<Perms>({});

  const selectedEmpresa = empresas.find((e) => e.id === selectedId);

  // When changing empresa, load its current funcionalidades from config
  const handleSelectEmpresa = (id: string) => {
    const emp = empresas.find((e) => e.id === id);
    const cfg = (emp?.config as Record<string, unknown>) || {};
    const funcCfg = (cfg.funcionalidades as Perms) || {};
    setSelectedId(id);
    setLocalPerms({
      agenda:       funcCfg.agenda       ?? true,
      financeiro:   funcCfg.financeiro   ?? false,
      prontuario:   funcCfg.prontuario   ?? false,
      whatsapp:     funcCfg.whatsapp     ?? false,
      teleconsulta: funcCfg.teleconsulta ?? false,
      relatorios:   funcCfg.relatorios   ?? false,
    });
  };

  const togglePerm = (key: string) => {
    setLocalPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    if (!selectedId) return;
    const emp = empresas.find((e) => e.id === selectedId);
    const currentConfig = (emp?.config as Record<string, unknown>) || {};
    updateConfig.mutate({
      empresaId: selectedId,
      config: { ...currentConfig, funcionalidades: localPerms },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Permissões por Empresa</h1>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Permissões por Empresa</h1>

      {/* Company selector */}
      <div className="flex gap-2 flex-wrap">
        {empresas.map((emp) => (
          <button
            key={emp.id}
            onClick={() => handleSelectEmpresa(emp.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
              selectedId === emp.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            {emp.nome}
          </button>
        ))}
      </div>

      {selectedEmpresa ? (
        <div className="bg-card rounded-xl border border-border p-5 space-y-5">
          <h2 className="text-sm font-semibold text-foreground">
            Funcionalidades — {selectedEmpresa.nome}
          </h2>
          <p className="text-xs text-muted-foreground">
            Plano: <strong className="capitalize">{selectedEmpresa.plano}</strong> · Status: <strong className="capitalize">{selectedEmpresa.status}</strong>
          </p>
          <div className="space-y-4">
            {funcionalidades.map((func) => (
              <div key={func.key} className="flex items-center justify-between">
                <Label className="text-sm text-foreground font-medium">{func.label}</Label>
                <Switch
                  checked={localPerms[func.key] ?? false}
                  onCheckedChange={() => togglePerm(func.key)}
                />
              </div>
            ))}
          </div>
          <Button className="gap-2 rounded-xl" onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Permissões
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground text-sm">
          Selecione uma empresa acima para gerenciar suas permissões.
        </div>
      )}
    </div>
  );
}
