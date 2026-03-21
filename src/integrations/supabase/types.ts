export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          created_at: string | null
          data_aula: string
          horario_fim: string
          horario_inicio: string
          id: string
          observacoes: string | null
          status: string | null
          turma_id: string
        }
        Insert: {
          created_at?: string | null
          data_aula: string
          horario_fim: string
          horario_inicio: string
          id?: string
          observacoes?: string | null
          status?: string | null
          turma_id: string
        }
        Update: {
          created_at?: string | null
          data_aula?: string
          horario_fim?: string
          horario_inicio?: string
          id?: string
          observacoes?: string | null
          status?: string | null
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacao_indicadores: {
        Row: {
          avaliacao_id: string | null
          id: string
          indicador_id: string | null
          observacoes: string | null
          valor: number
        }
        Insert: {
          avaliacao_id?: string | null
          id?: string
          indicador_id?: string | null
          observacoes?: string | null
          valor: number
        }
        Update: {
          avaliacao_id?: string | null
          id?: string
          indicador_id?: string | null
          observacoes?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "avaliacao_indicadores_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_indicadores_indicador_id_fkey"
            columns: ["indicador_id"]
            isOneToOne: false
            referencedRelation: "indicadores"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          altura: number | null
          avaliado_por: string | null
          cliente_id: string
          created_at: string | null
          data_avaliacao: string
          fotos: string[] | null
          id: string
          imc: number | null
          observacoes: string | null
          peso: number | null
        }
        Insert: {
          altura?: number | null
          avaliado_por?: string | null
          cliente_id: string
          created_at?: string | null
          data_avaliacao?: string
          fotos?: string[] | null
          id?: string
          imc?: number | null
          observacoes?: string | null
          peso?: number | null
        }
        Update: {
          altura?: number | null
          avaliado_por?: string | null
          cliente_id?: string
          created_at?: string | null
          data_avaliacao?: string
          fotos?: string[] | null
          id?: string
          imc?: number | null
          observacoes?: string | null
          peso?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_avaliado_por_fkey"
            columns: ["avaliado_por"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_exercicios: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      cliente_programas: {
        Row: {
          atribuido_por: string | null
          cliente_id: string | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          id: string
          observacoes: string | null
          programa_id: string | null
          progresso_percentual: number | null
          status: string | null
        }
        Insert: {
          atribuido_por?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: string
          observacoes?: string | null
          programa_id?: string | null
          progresso_percentual?: number | null
          status?: string | null
        }
        Update: {
          atribuido_por?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: string
          observacoes?: string | null
          programa_id?: string | null
          progresso_percentual?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cliente_programas_atribuido_por_fkey"
            columns: ["atribuido_por"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_programas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_programas_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas_exercicios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_nascimento: string | null
          email: string
          endereco: string | null
          id: string
          nome: string
          observacoes_medicas: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          id?: string
          nome: string
          observacoes_medicas?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          id?: string
          nome?: string
          observacoes_medicas?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      execucoes_exercicios: {
        Row: {
          cliente_programa_id: string | null
          created_at: string | null
          data_execucao: string | null
          exercicio_id: string | null
          feedback_cliente: string | null
          id: string
          nivel_dificuldade: number | null
          observacoes_professor: string | null
          repeticoes_realizadas: number | null
          series_realizadas: number | null
          tempo_execucao_minutos: number | null
        }
        Insert: {
          cliente_programa_id?: string | null
          created_at?: string | null
          data_execucao?: string | null
          exercicio_id?: string | null
          feedback_cliente?: string | null
          id?: string
          nivel_dificuldade?: number | null
          observacoes_professor?: string | null
          repeticoes_realizadas?: number | null
          series_realizadas?: number | null
          tempo_execucao_minutos?: number | null
        }
        Update: {
          cliente_programa_id?: string | null
          created_at?: string | null
          data_execucao?: string | null
          exercicio_id?: string | null
          feedback_cliente?: string | null
          id?: string
          nivel_dificuldade?: number | null
          observacoes_professor?: string | null
          repeticoes_realizadas?: number | null
          series_realizadas?: number | null
          tempo_execucao_minutos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "execucoes_exercicios_cliente_programa_id_fkey"
            columns: ["cliente_programa_id"]
            isOneToOne: false
            referencedRelation: "cliente_programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_exercicios_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios"
            referencedColumns: ["id"]
          },
        ]
      }
      exercicios: {
        Row: {
          ativo: boolean | null
          beneficios: string[] | null
          categoria_id: string | null
          contraindicacoes: string[] | null
          created_at: string | null
          descricao: string | null
          duracao_minutos: number | null
          equipamentos: string[] | null
          id: string
          imagem_url: string | null
          instrucoes: string | null
          nivel: string
          nome: string
          video_url: string | null
        }
        Insert: {
          ativo?: boolean | null
          beneficios?: string[] | null
          categoria_id?: string | null
          contraindicacoes?: string[] | null
          created_at?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          equipamentos?: string[] | null
          id?: string
          imagem_url?: string | null
          instrucoes?: string | null
          nivel: string
          nome: string
          video_url?: string | null
        }
        Update: {
          ativo?: boolean | null
          beneficios?: string[] | null
          categoria_id?: string | null
          contraindicacoes?: string[] | null
          created_at?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          equipamentos?: string[] | null
          id?: string
          imagem_url?: string | null
          instrucoes?: string | null
          nivel?: string
          nome?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercicios_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_exercicios"
            referencedColumns: ["id"]
          },
        ]
      }
      faturas: {
        Row: {
          cliente_id: string
          created_at: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao: string | null
          id: string
          matricula_id: string
          numero_fatura: string
          status: Database["public"]["Enums"]["status_pagamento"] | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao?: string | null
          id?: string
          matricula_id: string
          numero_fatura: string
          status?: Database["public"]["Enums"]["status_pagamento"] | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string | null
          id?: string
          matricula_id?: string
          numero_fatura?: string
          status?: Database["public"]["Enums"]["status_pagamento"] | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "matriculas"
            referencedColumns: ["id"]
          },
        ]
      }
      indicadores: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          tipo: string
          unidade: string | null
          valor_max: number | null
          valor_min: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          tipo: string
          unidade?: string | null
          valor_max?: number | null
          valor_min?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: string
          unidade?: string | null
          valor_max?: number | null
          valor_min?: number | null
        }
        Relationships: []
      }
      lista_espera: {
        Row: {
          ativa: boolean | null
          cliente_id: string
          created_at: string | null
          data_inclusao: string
          id: string
          posicao: number
          turma_id: string
        }
        Insert: {
          ativa?: boolean | null
          cliente_id: string
          created_at?: string | null
          data_inclusao?: string
          id?: string
          posicao: number
          turma_id: string
        }
        Update: {
          ativa?: boolean | null
          cliente_id?: string
          created_at?: string | null
          data_inclusao?: string
          id?: string
          posicao?: number
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lista_espera_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_espera_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas: {
        Row: {
          ativa: boolean | null
          cliente_id: string
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          data_matricula: string
          dia_vencimento: number | null
          id: string
          tipo_plano: Database["public"]["Enums"]["plano_tipo"]
          turma_id: string
          updated_at: string | null
          valor_mensal: number | null
        }
        Insert: {
          ativa?: boolean | null
          cliente_id: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          data_matricula?: string
          dia_vencimento?: number | null
          id?: string
          tipo_plano: Database["public"]["Enums"]["plano_tipo"]
          turma_id: string
          updated_at?: string | null
          valor_mensal?: number | null
        }
        Update: {
          ativa?: boolean | null
          cliente_id?: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          data_matricula?: string
          dia_vencimento?: number | null
          id?: string
          tipo_plano?: Database["public"]["Enums"]["plano_tipo"]
          turma_id?: string
          updated_at?: string | null
          valor_mensal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          cliente_id: string | null
          conteudo: string | null
          created_at: string | null
          data_envio: string | null
          id: string
          lida: boolean | null
          tipo: string
          titulo: string
          whatsapp_enviado: boolean | null
        }
        Insert: {
          cliente_id?: string | null
          conteudo?: string | null
          created_at?: string | null
          data_envio?: string | null
          id?: string
          lida?: boolean | null
          tipo: string
          titulo: string
          whatsapp_enviado?: boolean | null
        }
        Update: {
          cliente_id?: string | null
          conteudo?: string | null
          created_at?: string | null
          data_envio?: string | null
          id?: string
          lida?: boolean | null
          tipo?: string
          titulo?: string
          whatsapp_enviado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas: {
        Row: {
          agendamento_id: string
          cliente_id: string
          id: string
          observacoes: string | null
          registrado_em: string | null
          registrado_por: string | null
          status: Database["public"]["Enums"]["status_presenca"]
        }
        Insert: {
          agendamento_id: string
          cliente_id: string
          id?: string
          observacoes?: string | null
          registrado_em?: string | null
          registrado_por?: string | null
          status?: Database["public"]["Enums"]["status_presenca"]
        }
        Update: {
          agendamento_id?: string
          cliente_id?: string
          id?: string
          observacoes?: string | null
          registrado_em?: string | null
          registrado_por?: string | null
          status?: Database["public"]["Enums"]["status_presenca"]
        }
        Relationships: [
          {
            foreignKeyName: "presencas_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      professores: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          especialidades: string[] | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          especialidades?: string[] | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          especialidades?: string[] | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      programa_exercicios: {
        Row: {
          exercicio_id: string | null
          id: string
          observacoes: string | null
          ordem: number
          programa_id: string | null
          repeticoes: number | null
          series: number | null
          tempo_descanso_segundos: number | null
        }
        Insert: {
          exercicio_id?: string | null
          id?: string
          observacoes?: string | null
          ordem: number
          programa_id?: string | null
          repeticoes?: number | null
          series?: number | null
          tempo_descanso_segundos?: number | null
        }
        Update: {
          exercicio_id?: string | null
          id?: string
          observacoes?: string | null
          ordem?: number
          programa_id?: string | null
          repeticoes?: number | null
          series?: number | null
          tempo_descanso_segundos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "programa_exercicios_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programa_exercicios_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas_exercicios"
            referencedColumns: ["id"]
          },
        ]
      }
      programas_exercicios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          criado_por: string | null
          descricao: string | null
          duracao_total_minutos: number | null
          id: string
          nivel: string
          nome: string
          objetivos: string[] | null
          publico: boolean | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          criado_por?: string | null
          descricao?: string | null
          duracao_total_minutos?: number | null
          id?: string
          nivel: string
          nome: string
          objetivos?: string[] | null
          publico?: boolean | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          criado_por?: string | null
          descricao?: string | null
          duracao_total_minutos?: number | null
          id?: string
          nivel?: string
          nome?: string
          objetivos?: string[] | null
          publico?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "programas_exercicios_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          duracao_minutos: number
          id: string
          nome: string
          preco_base: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          duracao_minutos?: number
          id?: string
          nome: string
          preco_base?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          duracao_minutos?: number
          id?: string
          nome?: string
          preco_base?: number | null
        }
        Relationships: []
      }
      turmas: {
        Row: {
          ativa: boolean | null
          capacidade_maxima: number
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          dias_semana: Database["public"]["Enums"]["turma_frequencia"][]
          horario_fim: string
          horario_inicio: string
          id: string
          nome: string
          preco_avulso: number | null
          preco_mensal: number | null
          preco_semanal: number | null
          professor_id: string
          servico_id: string
          tipo: Database["public"]["Enums"]["turma_tipo"]
          updated_at: string | null
        }
        Insert: {
          ativa?: boolean | null
          capacidade_maxima?: number
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          dias_semana: Database["public"]["Enums"]["turma_frequencia"][]
          horario_fim: string
          horario_inicio: string
          id?: string
          nome: string
          preco_avulso?: number | null
          preco_mensal?: number | null
          preco_semanal?: number | null
          professor_id: string
          servico_id: string
          tipo?: Database["public"]["Enums"]["turma_tipo"]
          updated_at?: string | null
        }
        Update: {
          ativa?: boolean | null
          capacidade_maxima?: number
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          dias_semana?: Database["public"]["Enums"]["turma_frequencia"][]
          horario_fim?: string
          horario_inicio?: string
          id?: string
          nome?: string
          preco_avulso?: number | null
          preco_mensal?: number | null
          preco_semanal?: number | null
          professor_id?: string
          servico_id?: string
          tipo?: Database["public"]["Enums"]["turma_tipo"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turmas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      plano_tipo: "semanal" | "mensal" | "pacote_sessoes"
      status_pagamento: "pendente" | "pago" | "vencido"
      status_presenca: "presente" | "ausente" | "justificado"
      turma_frequencia:
        | "segunda"
        | "terca"
        | "quarta"
        | "quinta"
        | "sexta"
        | "sabado"
        | "domingo"
      turma_tipo: "continua" | "temporaria"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      plano_tipo: ["semanal", "mensal", "pacote_sessoes"],
      status_pagamento: ["pendente", "pago", "vencido"],
      status_presenca: ["presente", "ausente", "justificado"],
      turma_frequencia: [
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
        "domingo",
      ],
      turma_tipo: ["continua", "temporaria"],
    },
  },
} as const
