import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Palette, Upload, Eye, RotateCcw, Save, Image as ImageIcon, Type, Check,
  Paintbrush, Monitor, Smartphone, Sun, Moon, Sparkles, Layout
} from "lucide-react";
import { useWhiteLabel, defaultConfig, type WhiteLabelConfig } from "@/contexts/WhiteLabelContext";
import { useEmpresa } from "@/contexts/EmpresaContext";
import logo from "@/assets/logo-agendme.png";

/* ───── temas predefinidos ───── */
const temasPredefinidos: { nome: string; config: Partial<WhiteLabelConfig> }[] = [
  { nome: "Agend.me Padrão", config: { corPrimaria: "#0EA5E9", corSecundaria: "#E0F2FE", corTexto: "#1E293B", corFundo: "#F8FAFC" } },
  { nome: "Roxo Elegante", config: { corPrimaria: "#8B5CF6", corSecundaria: "#EDE9FE", corTexto: "#1E1B4B", corFundo: "#FAFAF9" } },
  { nome: "Verde Saúde", config: { corPrimaria: "#10B981", corSecundaria: "#D1FAE5", corTexto: "#064E3B", corFundo: "#F0FDF4" } },
  { nome: "Rosa Suave", config: { corPrimaria: "#EC4899", corSecundaria: "#FCE7F3", corTexto: "#831843", corFundo: "#FFF1F2" } },
  { nome: "Laranja Vibrante", config: { corPrimaria: "#F97316", corSecundaria: "#FFF7ED", corTexto: "#7C2D12", corFundo: "#FFFBEB" } },
  { nome: "Azul Marinho", config: { corPrimaria: "#1E40AF", corSecundaria: "#DBEAFE", corTexto: "#1E3A5F", corFundo: "#F8FAFC" } },
  { nome: "Dourado Premium", config: { corPrimaria: "#D97706", corSecundaria: "#FEF3C7", corTexto: "#451A03", corFundo: "#FFFBEB" } },
  { nome: "Cinza Moderno", config: { corPrimaria: "#475569", corSecundaria: "#F1F5F9", corTexto: "#0F172A", corFundo: "#F8FAFC" } },
];

const ConfiguracoesPage = () => {
  const { config, updateConfig, resetToDefault, applyTheme } = useWhiteLabel();
  const { empresa } = useEmpresa();
  const [activeTab, setActiveTab] = useState("cores");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const handleColorChange = (field: keyof WhiteLabelConfig, value: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(value) || value.length <= 7) {
      updateConfig({ [field]: value });
    }
  };

  const applyTema = (tema: typeof temasPredefinidos[0]) => {
    updateConfig(tema.config);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            White Label
          </h1>
          <p className="text-muted-foreground text-sm">Personalize a identidade visual de {empresa?.nome || "sua empresa"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetToDefault} className="gap-1">
            <RotateCcw className="h-4 w-4" /> Restaurar Padrão
          </Button>
          <Button className="gap-2"><Save className="h-4 w-4" /> Salvar Alterações</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Config */}
        <div className="xl:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="cores" className="gap-1 text-xs"><Paintbrush className="h-3.5 w-3.5" /> Cores</TabsTrigger>
              <TabsTrigger value="logos" className="gap-1 text-xs"><ImageIcon className="h-3.5 w-3.5" /> Logos</TabsTrigger>
              <TabsTrigger value="temas" className="gap-1 text-xs"><Sparkles className="h-3.5 w-3.5" /> Temas</TabsTrigger>
              <TabsTrigger value="textos" className="gap-1 text-xs"><Type className="h-3.5 w-3.5" /> Textos</TabsTrigger>
            </TabsList>

            {/* CORES */}
            <TabsContent value="cores" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  { key: "corPrimaria" as const, label: "Cor Primária", desc: "Botões, links e destaques" },
                  { key: "corSecundaria" as const, label: "Cor Secundária", desc: "Backgrounds de destaque e badges" },
                  { key: "corTexto" as const, label: "Cor do Texto", desc: "Títulos e texto principal" },
                  { key: "corFundo" as const, label: "Cor de Fundo", desc: "Background geral do sistema" },
                ]).map(c => (
                  <Card key={c.key}>
                    <CardContent className="p-4">
                      <Label className="text-sm font-medium">{c.label}</Label>
                      <p className="text-[11px] text-muted-foreground mb-3">{c.desc}</p>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <input
                            type="color"
                            value={config[c.key]}
                            onChange={e => handleColorChange(c.key, e.target.value)}
                            className="h-10 w-14 rounded-lg border border-border cursor-pointer"
                          />
                        </div>
                        <Input
                          value={config[c.key]}
                          onChange={e => handleColorChange(c.key, e.target.value)}
                          placeholder="#000000"
                          className="w-28 font-mono text-sm"
                          maxLength={7}
                        />
                        <div className="h-10 flex-1 rounded-lg border border-border" style={{ backgroundColor: config[c.key] }} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* LOGOS */}
            <TabsContent value="logos" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  { key: "logoUrl" as const, label: "Logotipo Principal", desc: "Exibido na sidebar e cabeçalhos. PNG, JPG ou SVG. Máx 2MB.", icon: ImageIcon },
                  { key: "faviconUrl" as const, label: "Favicon", desc: "Ícone exibido na aba do navegador. PNG, ICO. Máx 512KB.", icon: Layout },
                  { key: "imagemTopoUrl" as const, label: "Imagem de Topo", desc: "Banner exibido no app do cliente. PNG, JPG. Máx 5MB.", icon: Monitor },
                ]).map(item => (
                  <Card key={item.key}>
                    <CardContent className="p-4">
                      <Label className="text-sm font-medium flex items-center gap-2"><item.icon className="h-4 w-4 text-primary" /> {item.label}</Label>
                      <p className="text-[11px] text-muted-foreground mb-3">{item.desc}</p>
                      <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors">
                        {config[item.key] ? (
                          <img src={config[item.key]} alt={item.label} className="h-16 object-contain" />
                        ) : (
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        )}
                        <p className="text-xs text-muted-foreground">Clique para enviar</p>
                      </div>
                      <Input
                        value={config[item.key]}
                        onChange={e => updateConfig({ [item.key]: e.target.value })}
                        placeholder="Ou cole uma URL..."
                        className="mt-2 text-xs"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* TEMAS */}
            <TabsContent value="temas" className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {temasPredefinidos.map(tema => {
                  const isActive = config.corPrimaria === tema.config.corPrimaria;
                  return (
                    <Card
                      key={tema.nome}
                      className={`cursor-pointer transition-all hover:shadow-md ${isActive ? "ring-2 ring-primary" : "border-border"}`}
                      onClick={() => applyTema(tema)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: tema.config.corPrimaria }} />
                          <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: tema.config.corSecundaria }} />
                          <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: tema.config.corTexto }} />
                          {isActive && <Check className="h-3 w-3 text-primary ml-auto" />}
                        </div>
                        <p className="text-xs font-medium text-foreground">{tema.nome}</p>
                        {/* Mini preview */}
                        <div className="mt-2 rounded-lg overflow-hidden border border-border h-12" style={{ backgroundColor: tema.config.corFundo }}>
                          <div className="h-3" style={{ backgroundColor: tema.config.corPrimaria }} />
                          <div className="px-2 py-1 flex gap-1">
                            <div className="h-1.5 w-6 rounded" style={{ backgroundColor: tema.config.corTexto, opacity: 0.6 }} />
                            <div className="h-1.5 w-4 rounded" style={{ backgroundColor: tema.config.corSecundaria }} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* TEXTOS */}
            <TabsContent value="textos" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label>Nome de Exibição</Label>
                    <p className="text-[11px] text-muted-foreground mb-2">Aparecerá no cabeçalho, login e relatórios</p>
                    <Input
                      value={config.nomeExibicao}
                      onChange={e => updateConfig({ nomeExibicao: e.target.value })}
                      placeholder="Nome da empresa"
                      maxLength={150}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Live Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /> Preview ao Vivo</h3>
            <div className="flex gap-1">
              <Button variant={previewMode === "desktop" ? "default" : "outline"} size="sm" onClick={() => setPreviewMode("desktop")} className="h-7 w-7 p-0">
                <Monitor className="h-3.5 w-3.5" />
              </Button>
              <Button variant={previewMode === "mobile" ? "default" : "outline"} size="sm" onClick={() => setPreviewMode("mobile")} className="h-7 w-7 p-0">
                <Smartphone className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div
                className={`mx-auto transition-all ${previewMode === "mobile" ? "max-w-[280px]" : "w-full"}`}
                style={{ backgroundColor: config.corFundo }}
              >
                {/* Simulated sidebar header */}
                <div className="flex items-center gap-2 px-3 py-2.5" style={{ backgroundColor: config.corTexto }}>
                  {config.logoUrl ? (
                    <img src={config.logoUrl} alt="Logo" className="h-6 object-contain" />
                  ) : (
                    <img src={logo} alt="Logo" className="h-5 object-contain opacity-80" />
                  )}
                  <span className="text-xs font-semibold text-white truncate">{config.nomeExibicao}</span>
                </div>

                {/* Top bar */}
                <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: config.corSecundaria }}>
                  <span className="text-[10px] font-medium" style={{ color: config.corTexto }}>Dashboard</span>
                  <div className="flex gap-1">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: config.corPrimaria, opacity: 0.2 }} />
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: config.corPrimaria, opacity: 0.3 }} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Agendamentos", "Pacientes", "Receita", "Ocupação"].map((label, idx) => (
                      <div key={idx} className="rounded-lg p-2 border" style={{ borderColor: config.corSecundaria, backgroundColor: "rgba(255,255,255,0.7)" }}>
                        <p className="text-[8px]" style={{ color: config.corTexto, opacity: 0.5 }}>{label}</p>
                        <p className="text-sm font-bold" style={{ color: config.corTexto }}>{[42, 128, "R$5.2k", "87%"][idx]}</p>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <button className="w-full rounded-lg py-1.5 text-[10px] font-medium text-white" style={{ backgroundColor: config.corPrimaria }}>
                    Novo Agendamento
                  </button>

                  {/* List items */}
                  {["Maria Silva — 14:00", "Carlos Souza — 15:30"].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: config.corSecundaria }}>
                      <div className="h-5 w-5 rounded-full" style={{ backgroundColor: config.corPrimaria, opacity: 0.2 }} />
                      <span className="text-[9px]" style={{ color: config.corTexto }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color summary */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs">Paleta Atual</CardTitle></CardHeader>
            <CardContent className="flex gap-2">
              {[
                { label: "Primária", color: config.corPrimaria },
                { label: "Secundária", color: config.corSecundaria },
                { label: "Texto", color: config.corTexto },
                { label: "Fundo", color: config.corFundo },
              ].map(c => (
                <div key={c.label} className="flex-1 text-center">
                  <div className="h-8 w-full rounded-lg border border-border mb-1" style={{ backgroundColor: c.color }} />
                  <p className="text-[9px] text-muted-foreground">{c.label}</p>
                  <p className="text-[8px] font-mono text-muted-foreground">{c.color}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesPage;
