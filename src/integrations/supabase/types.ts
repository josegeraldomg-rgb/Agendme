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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agendamentos_clinica: {
        Row: {
          atendido_em: string | null
          cancelado_em: string | null
          cancelamento_motivo: string | null
          confirmado_em: string | null
          created_at: string
          data: string
          empresa_id: string
          hora_fim: string
          hora_inicio: string
          id: string
          observacoes: string | null
          observacoes_internas: string | null
          origem: string | null
          paciente_id: string
          profissional_id: string
          recorrencia_id: string | null
          servico_id: string
          status: Database["public"]["Enums"]["status_agendamento"]
          updated_at: string
          valor: number | null
        }
        Insert: {
          atendido_em?: string | null
          cancelado_em?: string | null
          cancelamento_motivo?: string | null
          confirmado_em?: string | null
          created_at?: string
          data: string
          empresa_id: string
          hora_fim: string
          hora_inicio: string
          id?: string
          observacoes?: string | null
          observacoes_internas?: string | null
          origem?: string | null
          paciente_id: string
          profissional_id: string
          recorrencia_id?: string | null
          servico_id: string
          status?: Database["public"]["Enums"]["status_agendamento"]
          updated_at?: string
          valor?: number | null
        }
        Update: {
          atendido_em?: string | null
          cancelado_em?: string | null
          cancelamento_motivo?: string | null
          confirmado_em?: string | null
          created_at?: string
          data?: string
          empresa_id?: string
          hora_fim?: string
          hora_inicio?: string
          id?: string
          observacoes?: string | null
          observacoes_internas?: string | null
          origem?: string | null
          paciente_id?: string
          profissional_id?: string
          recorrencia_id?: string | null
          servico_id?: string
          status?: Database["public"]["Enums"]["status_agendamento"]
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_clinica_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_clinica_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_clinica_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_clinica_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      agente_acoes_log: {
        Row: {
          acao: string
          conversa_id: string | null
          created_at: string
          duracao_ms: number | null
          empresa_id: string
          erro: string | null
          id: string
          mensagem_id: string | null
          parametros: Json | null
          resultado: Json | null
          sucesso: boolean
        }
        Insert: {
          acao: string
          conversa_id?: string | null
          created_at?: string
          duracao_ms?: number | null
          empresa_id: string
          erro?: string | null
          id?: string
          mensagem_id?: string | null
          parametros?: Json | null
          resultado?: Json | null
          sucesso?: boolean
        }
        Update: {
          acao?: string
          conversa_id?: string | null
          created_at?: string
          duracao_ms?: number | null
          empresa_id?: string
          erro?: string | null
          id?: string
          mensagem_id?: string | null
          parametros?: Json | null
          resultado?: Json | null
          sucesso?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "agente_acoes_log_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "agente_conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agente_acoes_log_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agente_acoes_log_mensagem_id_fkey"
            columns: ["mensagem_id"]
            isOneToOne: false
            referencedRelation: "agente_mensagens"
            referencedColumns: ["id"]
          },
        ]
      }
      agente_config: {
        Row: {
          acoes_permitidas: Json | null
          ativo: boolean | null
          created_at: string
          empresa_id: string
          id: string
          limites: Json | null
          mensagens_hoje: number | null
          modelo_ia: string | null
          numeros_autorizados: string[] | null
          system_prompt: string | null
          tokens_usados_mes: number | null
          ultimo_reset_diario: string | null
          ultimo_reset_mensal: string | null
          updated_at: string
        }
        Insert: {
          acoes_permitidas?: Json | null
          ativo?: boolean | null
          created_at?: string
          empresa_id: string
          id?: string
          limites?: Json | null
          mensagens_hoje?: number | null
          modelo_ia?: string | null
          numeros_autorizados?: string[] | null
          system_prompt?: string | null
          tokens_usados_mes?: number | null
          ultimo_reset_diario?: string | null
          ultimo_reset_mensal?: string | null
          updated_at?: string
        }
        Update: {
          acoes_permitidas?: Json | null
          ativo?: boolean | null
          created_at?: string
          empresa_id?: string
          id?: string
          limites?: Json | null
          mensagens_hoje?: number | null
          modelo_ia?: string | null
          numeros_autorizados?: string[] | null
          system_prompt?: string | null
          tokens_usados_mes?: number | null
          ultimo_reset_diario?: string | null
          ultimo_reset_mensal?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agente_config_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      agente_conversas: {
        Row: {
          empresa_id: string
          encerrada_em: string | null
          id: string
          last_message_at: string
          profile_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["agente_conversa_status"]
          total_mensagens: number | null
          total_tokens: number | null
          user_name: string | null
          user_phone: string
        }
        Insert: {
          empresa_id: string
          encerrada_em?: string | null
          id?: string
          last_message_at?: string
          profile_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["agente_conversa_status"]
          total_mensagens?: number | null
          total_tokens?: number | null
          user_name?: string | null
          user_phone: string
        }
        Update: {
          empresa_id?: string
          encerrada_em?: string | null
          id?: string
          last_message_at?: string
          profile_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["agente_conversa_status"]
          total_mensagens?: number | null
          total_tokens?: number | null
          user_name?: string | null
          user_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "agente_conversas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agente_conversas_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agente_mensagens: {
        Row: {
          content: string | null
          conversa_id: string
          created_at: string
          id: string
          latencia_ms: number | null
          modelo: string | null
          role: string
          tokens_input: number | null
          tokens_output: number | null
          tool_args: Json | null
          tool_call_id: string | null
          tool_name: string | null
          tool_result: Json | null
        }
        Insert: {
          content?: string | null
          conversa_id: string
          created_at?: string
          id?: string
          latencia_ms?: number | null
          modelo?: string | null
          role: string
          tokens_input?: number | null
          tokens_output?: number | null
          tool_args?: Json | null
          tool_call_id?: string | null
          tool_name?: string | null
          tool_result?: Json | null
        }
        Update: {
          content?: string | null
          conversa_id?: string
          created_at?: string
          id?: string
          latencia_ms?: number | null
          modelo?: string | null
          role?: string
          tokens_input?: number | null
          tokens_output?: number | null
          tool_args?: Json | null
          tool_call_id?: string | null
          tool_name?: string | null
          tool_result?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agente_mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "agente_conversas"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          acao: string
          created_at: string
          dados_antes: Json | null
          dados_depois: Json | null
          empresa_id: string | null
          id: string
          ip: string | null
          origem: string | null
          registro_id: string | null
          tabela: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          empresa_id?: string | null
          id?: string
          ip?: string | null
          origem?: string | null
          registro_id?: string | null
          tabela?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          empresa_id?: string | null
          id?: string
          ip?: string | null
          origem?: string | null
          registro_id?: string | null
          tabela?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      ausencias: {
        Row: {
          created_at: string
          data_fim: string
          data_inicio: string
          dia_todo: boolean | null
          empresa_id: string
          hora_fim: string | null
          hora_inicio: string | null
          id: string
          motivo: string | null
          profissional_id: string
          tipo: string | null
        }
        Insert: {
          created_at?: string
          data_fim: string
          data_inicio: string
          dia_todo?: boolean | null
          empresa_id: string
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          motivo?: string | null
          profissional_id: string
          tipo?: string | null
        }
        Update: {
          created_at?: string
          data_fim?: string
          data_inicio?: string
          dia_todo?: boolean | null
          empresa_id?: string
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          motivo?: string | null
          profissional_id?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ausencias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausencias_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_servicos: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string
          descricao: string | null
          empresa_id: string
          icone: string | null
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          empresa_id: string
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          empresa_id?: string
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_servicos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          ativo: boolean | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string
          empresa_id: string | null
          endereco: string | null
          foto_url: string | null
          id: string
          nome: string
          observacoes_medicas: string | null
          origem: string | null
          sexo: string | null
          telefone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email: string
          empresa_id?: string | null
          endereco?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          observacoes_medicas?: string | null
          origem?: string | null
          sexo?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string
          empresa_id?: string | null
          endereco?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          observacoes_medicas?: string | null
          origem?: string | null
          sexo?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      comissoes_config: {
        Row: {
          ativo: boolean | null
          created_at: string
          empresa_id: string
          id: string
          perc_empresa: number
          perc_profissional: number
          profissional_id: string | null
          servico_id: string | null
          tipo: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          empresa_id: string
          id?: string
          perc_empresa?: number
          perc_profissional?: number
          profissional_id?: string | null
          servico_id?: string | null
          tipo: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          empresa_id?: string
          id?: string
          perc_empresa?: number
          perc_profissional?: number
          profissional_id?: string | null
          servico_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_config_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_config_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_config_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          chave: string
          created_at: string
          descricao: string | null
          empresa_id: string
          id: string
          updated_at: string
          valor: Json
        }
        Insert: {
          chave: string
          created_at?: string
          descricao?: string | null
          empresa_id: string
          id?: string
          updated_at?: string
          valor: Json
        }
        Update: {
          chave?: string
          created_at?: string
          descricao?: string | null
          empresa_id?: string
          id?: string
          updated_at?: string
          valor?: Json
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string | null
          config: Json | null
          created_at: string
          dominio_customizado: string | null
          email: string | null
          id: string
          limites: Json | null
          logo_url: string | null
          nome: string
          plano: Database["public"]["Enums"]["empresa_plano"]
          slug: string
          status: Database["public"]["Enums"]["empresa_status"]
          subdominio: string | null
          telefone: string | null
          updated_at: string
          white_label: Json | null
        }
        Insert: {
          cnpj?: string | null
          config?: Json | null
          created_at?: string
          dominio_customizado?: string | null
          email?: string | null
          id?: string
          limites?: Json | null
          logo_url?: string | null
          nome: string
          plano?: Database["public"]["Enums"]["empresa_plano"]
          slug: string
          status?: Database["public"]["Enums"]["empresa_status"]
          subdominio?: string | null
          telefone?: string | null
          updated_at?: string
          white_label?: Json | null
        }
        Update: {
          cnpj?: string | null
          config?: Json | null
          created_at?: string
          dominio_customizado?: string | null
          email?: string | null
          id?: string
          limites?: Json | null
          logo_url?: string | null
          nome?: string
          plano?: Database["public"]["Enums"]["empresa_plano"]
          slug?: string
          status?: Database["public"]["Enums"]["empresa_status"]
          subdominio?: string | null
          telefone?: string | null
          updated_at?: string
          white_label?: Json | null
        }
        Relationships: []
      }
      feriados: {
        Row: {
          created_at: string
          data: string
          empresa_id: string
          id: string
          nome: string
          recorrente: boolean | null
        }
        Insert: {
          created_at?: string
          data: string
          empresa_id: string
          id?: string
          nome: string
          recorrente?: boolean | null
        }
        Update: {
          created_at?: string
          data?: string
          empresa_id?: string
          id?: string
          nome?: string
          recorrente?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "feriados_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_receitas: {
        Row: {
          agendamento_id: string | null
          categoria: string | null
          comissao_empresa_perc: number | null
          comissao_empresa_valor: number | null
          comissao_profissional_perc: number | null
          comissao_profissional_valor: number | null
          created_at: string
          data_competencia: string
          data_pagamento: string
          desconto: number | null
          descricao: string | null
          empresa_id: string
          id: string
          meio_pagamento: Database["public"]["Enums"]["meio_pagamento"]
          observacoes: string | null
          paciente_id: string | null
          parcela_atual: number | null
          parcelas: number | null
          profissional_id: string | null
          servico_id: string | null
          updated_at: string
          valor: number
          valor_final: number | null
        }
        Insert: {
          agendamento_id?: string | null
          categoria?: string | null
          comissao_empresa_perc?: number | null
          comissao_empresa_valor?: number | null
          comissao_profissional_perc?: number | null
          comissao_profissional_valor?: number | null
          created_at?: string
          data_competencia?: string
          data_pagamento?: string
          desconto?: number | null
          descricao?: string | null
          empresa_id: string
          id?: string
          meio_pagamento?: Database["public"]["Enums"]["meio_pagamento"]
          observacoes?: string | null
          paciente_id?: string | null
          parcela_atual?: number | null
          parcelas?: number | null
          profissional_id?: string | null
          servico_id?: string | null
          updated_at?: string
          valor: number
          valor_final?: number | null
        }
        Update: {
          agendamento_id?: string | null
          categoria?: string | null
          comissao_empresa_perc?: number | null
          comissao_empresa_valor?: number | null
          comissao_profissional_perc?: number | null
          comissao_profissional_valor?: number | null
          created_at?: string
          data_competencia?: string
          data_pagamento?: string
          desconto?: number | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          meio_pagamento?: Database["public"]["Enums"]["meio_pagamento"]
          observacoes?: string | null
          paciente_id?: string | null
          parcela_atual?: number | null
          parcelas?: number | null
          profissional_id?: string | null
          servico_id?: string | null
          updated_at?: string
          valor?: number
          valor_final?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_receitas_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos_clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_receitas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_receitas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_receitas_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_receitas_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios_funcionamento: {
        Row: {
          ativo: boolean | null
          created_at: string
          dia_semana: number
          empresa_id: string
          hora_fim: string
          hora_inicio: string
          id: string
          intervalo_minutos: number | null
          profissional_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          dia_semana: number
          empresa_id: string
          hora_fim: string
          hora_inicio: string
          id?: string
          intervalo_minutos?: number | null
          profissional_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          dia_semana?: number
          empresa_id?: string
          hora_fim?: string
          hora_inicio?: string
          id?: string
          intervalo_minutos?: number | null
          profissional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "horarios_funcionamento_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horarios_funcionamento_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      lista_espera_clinica: {
        Row: {
          created_at: string
          data_preferida: string | null
          empresa_id: string
          id: string
          notificado_em: string | null
          observacoes: string | null
          paciente_id: string
          periodo_preferido: string | null
          profissional_id: string | null
          servico_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          data_preferida?: string | null
          empresa_id: string
          id?: string
          notificado_em?: string | null
          observacoes?: string | null
          paciente_id: string
          periodo_preferido?: string | null
          profissional_id?: string | null
          servico_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          data_preferida?: string | null
          empresa_id?: string
          id?: string
          notificado_em?: string | null
          observacoes?: string | null
          paciente_id?: string
          periodo_preferido?: string | null
          profissional_id?: string | null
          servico_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lista_espera_clinica_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_espera_clinica_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_espera_clinica_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_espera_clinica_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          acao_url: string | null
          categoria: string | null
          cliente_id: string | null
          conteudo: string | null
          created_at: string
          data_envio: string | null
          empresa_id: string | null
          id: string
          lida: boolean | null
          tipo: string
          titulo: string
          user_id: string | null
          whatsapp_enviado: boolean | null
        }
        Insert: {
          acao_url?: string | null
          categoria?: string | null
          cliente_id?: string | null
          conteudo?: string | null
          created_at?: string
          data_envio?: string | null
          empresa_id?: string | null
          id?: string
          lida?: boolean | null
          tipo: string
          titulo: string
          user_id?: string | null
          whatsapp_enviado?: boolean | null
        }
        Update: {
          acao_url?: string | null
          categoria?: string | null
          cliente_id?: string | null
          conteudo?: string | null
          created_at?: string
          data_envio?: string | null
          empresa_id?: string | null
          id?: string
          lida?: boolean | null
          tipo?: string
          titulo?: string
          user_id?: string | null
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
          {
            foreignKeyName: "notificacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          empresa_id: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          empresa_id?: string | null
          id: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          empresa_id?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profissionais_clinica: {
        Row: {
          ativo: boolean | null
          avatar_url: string | null
          bio: string | null
          comissao_percentual: number | null
          cor_agenda: string | null
          created_at: string
          email: string | null
          empresa_id: string
          especialidades: string[] | null
          id: string
          nome: string
          registro_profissional: string | null
          telefone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          comissao_percentual?: number | null
          cor_agenda?: string | null
          created_at?: string
          email?: string | null
          empresa_id: string
          especialidades?: string[] | null
          id?: string
          nome: string
          registro_profissional?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          comissao_percentual?: number | null
          cor_agenda?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string
          especialidades?: string[] | null
          id?: string
          nome?: string
          registro_profissional?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_clinica_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profissional_servicos: {
        Row: {
          ativo: boolean | null
          created_at: string
          duracao_customizada: number | null
          id: string
          preco_customizado: number | null
          profissional_id: string
          servico_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          duracao_customizada?: number | null
          id?: string
          preco_customizado?: number | null
          profissional_id: string
          servico_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          duracao_customizada?: number | null
          id?: string
          preco_customizado?: number | null
          profissional_id?: string
          servico_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profissional_servicos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profissional_servicos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      prontuarios: {
        Row: {
          agendamento_id: string | null
          anamnese: string | null
          anexos: Json | null
          conduta: string | null
          created_at: string
          data_atendimento: string
          diagnostico: string | null
          empresa_id: string
          exame_fisico: string | null
          id: string
          observacoes: string | null
          paciente_id: string
          profissional_id: string | null
          queixa_principal: string | null
          updated_at: string
        }
        Insert: {
          agendamento_id?: string | null
          anamnese?: string | null
          anexos?: Json | null
          conduta?: string | null
          created_at?: string
          data_atendimento?: string
          diagnostico?: string | null
          empresa_id: string
          exame_fisico?: string | null
          id?: string
          observacoes?: string | null
          paciente_id: string
          profissional_id?: string | null
          queixa_principal?: string | null
          updated_at?: string
        }
        Update: {
          agendamento_id?: string | null
          anamnese?: string | null
          anexos?: Json | null
          conduta?: string | null
          created_at?: string
          data_atendimento?: string
          diagnostico?: string | null
          empresa_id?: string
          exame_fisico?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string
          profissional_id?: string | null
          queixa_principal?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prontuarios_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos_clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      repasses: {
        Row: {
          comprovante_url: string | null
          created_at: string
          data_pagamento: string | null
          empresa_id: string
          id: string
          meio_pagamento: Database["public"]["Enums"]["meio_pagamento"] | null
          observacoes: string | null
          periodo_fim: string
          periodo_inicio: string
          profissional_id: string
          receitas_ids: string[] | null
          status: Database["public"]["Enums"]["status_repasse"]
          updated_at: string
          valor: number
        }
        Insert: {
          comprovante_url?: string | null
          created_at?: string
          data_pagamento?: string | null
          empresa_id: string
          id?: string
          meio_pagamento?: Database["public"]["Enums"]["meio_pagamento"] | null
          observacoes?: string | null
          periodo_fim: string
          periodo_inicio: string
          profissional_id: string
          receitas_ids?: string[] | null
          status?: Database["public"]["Enums"]["status_repasse"]
          updated_at?: string
          valor: number
        }
        Update: {
          comprovante_url?: string | null
          created_at?: string
          data_pagamento?: string | null
          empresa_id?: string
          id?: string
          meio_pagamento?: Database["public"]["Enums"]["meio_pagamento"] | null
          observacoes?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          profissional_id?: string
          receitas_ids?: string[] | null
          status?: Database["public"]["Enums"]["status_repasse"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "repasses_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repasses_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean | null
          categoria_id: string | null
          created_at: string
          descricao: string | null
          duracao_minutos: number
          empresa_id: string | null
          id: string
          imagem_url: string | null
          nome: string
          permite_agendamento_online: boolean | null
          preco_base: number | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          duracao_minutos?: number
          empresa_id?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          permite_agendamento_online?: boolean | null
          preco_base?: number | null
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          duracao_minutos?: number
          empresa_id?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          permite_agendamento_online?: boolean | null
          preco_base?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "servicos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_servicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servicos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      teleconsulta_arquivos: {
        Row: {
          created_at: string
          id: string
          nome: string
          remetente: string
          tamanho_bytes: number | null
          teleconsulta_id: string
          tipo: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          remetente: string
          tamanho_bytes?: number | null
          teleconsulta_id: string
          tipo: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          remetente?: string
          tamanho_bytes?: number | null
          teleconsulta_id?: string
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "teleconsulta_arquivos_teleconsulta_id_fkey"
            columns: ["teleconsulta_id"]
            isOneToOne: false
            referencedRelation: "teleconsultas"
            referencedColumns: ["id"]
          },
        ]
      }
      teleconsulta_chat: {
        Row: {
          created_at: string
          id: string
          mensagem: string
          remetente: string
          teleconsulta_id: string
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          mensagem: string
          remetente: string
          teleconsulta_id: string
          tipo: string
        }
        Update: {
          created_at?: string
          id?: string
          mensagem?: string
          remetente?: string
          teleconsulta_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "teleconsulta_chat_teleconsulta_id_fkey"
            columns: ["teleconsulta_id"]
            isOneToOne: false
            referencedRelation: "teleconsultas"
            referencedColumns: ["id"]
          },
        ]
      }
      teleconsultas: {
        Row: {
          agendamento_id: string | null
          created_at: string
          data: string
          duracao_minutos: number | null
          empresa_id: string
          encerrada_em: string | null
          gravacao_url: string | null
          hora: string
          id: string
          iniciada_em: string | null
          link_sala: string
          link_sala_paciente: string | null
          paciente_id: string
          profissional_id: string
          provedor: string | null
          sala_id_externo: string | null
          status: Database["public"]["Enums"]["status_teleconsulta"]
          updated_at: string
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string
          data: string
          duracao_minutos?: number | null
          empresa_id: string
          encerrada_em?: string | null
          gravacao_url?: string | null
          hora: string
          id?: string
          iniciada_em?: string | null
          link_sala: string
          link_sala_paciente?: string | null
          paciente_id: string
          profissional_id: string
          provedor?: string | null
          sala_id_externo?: string | null
          status?: Database["public"]["Enums"]["status_teleconsulta"]
          updated_at?: string
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string
          data?: string
          duracao_minutos?: number | null
          empresa_id?: string
          encerrada_em?: string | null
          gravacao_url?: string | null
          hora?: string
          id?: string
          iniciada_em?: string | null
          link_sala?: string
          link_sala_paciente?: string | null
          paciente_id?: string
          profissional_id?: string
          provedor?: string | null
          sala_id_externo?: string | null
          status?: Database["public"]["Enums"]["status_teleconsulta"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teleconsultas_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos_clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teleconsultas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teleconsultas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teleconsultas_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          duracao_ms: number | null
          erro: string | null
          evento: string
          id: string
          payload: Json | null
          response_body: string | null
          status_code: number | null
          sucesso: boolean
          tentativa: number | null
          webhook_id: string
        }
        Insert: {
          created_at?: string
          duracao_ms?: number | null
          erro?: string | null
          evento: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          status_code?: number | null
          sucesso?: boolean
          tentativa?: number | null
          webhook_id: string
        }
        Update: {
          created_at?: string
          duracao_ms?: number | null
          erro?: string | null
          evento?: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          status_code?: number | null
          sucesso?: boolean
          tentativa?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          ativo: boolean | null
          created_at: string
          empresa_id: string
          eventos: string[] | null
          falhas_consecutivas: number | null
          headers: Json | null
          id: string
          nome: string
          secret: string | null
          ultimo_disparo: string | null
          ultimo_status: number | null
          updated_at: string
          url: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          empresa_id: string
          eventos?: string[] | null
          falhas_consecutivas?: number | null
          headers?: Json | null
          id?: string
          nome: string
          secret?: string | null
          ultimo_disparo?: string | null
          ultimo_status?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          empresa_id?: string
          eventos?: string[] | null
          falhas_consecutivas?: number | null
          headers?: Json | null
          id?: string
          nome?: string
          secret?: string | null
          ultimo_disparo?: string | null
          ultimo_status?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_config: {
        Row: {
          conectado: boolean | null
          created_at: string
          empresa_id: string
          id: string
          numero: string | null
          provedor: string | null
          regras_envio: Json | null
          token_api: string | null
          ultimo_status_check: string | null
          updated_at: string
          url_api: string | null
        }
        Insert: {
          conectado?: boolean | null
          created_at?: string
          empresa_id: string
          id?: string
          numero?: string | null
          provedor?: string | null
          regras_envio?: Json | null
          token_api?: string | null
          ultimo_status_check?: string | null
          updated_at?: string
          url_api?: string | null
        }
        Update: {
          conectado?: boolean | null
          created_at?: string
          empresa_id?: string
          id?: string
          numero?: string | null
          provedor?: string | null
          regras_envio?: Json | null
          token_api?: string | null
          ultimo_status_check?: string | null
          updated_at?: string
          url_api?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_config_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_mensagens: {
        Row: {
          agendamento_id: string | null
          created_at: string
          direcao: string
          empresa_id: string
          entregue_em: string | null
          enviado_em: string | null
          erro_detalhe: string | null
          id: string
          lido_em: string | null
          max_tentativas: number | null
          message_id_externo: string | null
          paciente_id: string | null
          resposta_api: Json | null
          status: Database["public"]["Enums"]["whatsapp_msg_status"]
          telefone: string
          template_id: string | null
          tentativas: number | null
          texto: string
          tipo: Database["public"]["Enums"]["whatsapp_template_tipo"]
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string
          direcao?: string
          empresa_id: string
          entregue_em?: string | null
          enviado_em?: string | null
          erro_detalhe?: string | null
          id?: string
          lido_em?: string | null
          max_tentativas?: number | null
          message_id_externo?: string | null
          paciente_id?: string | null
          resposta_api?: Json | null
          status?: Database["public"]["Enums"]["whatsapp_msg_status"]
          telefone: string
          template_id?: string | null
          tentativas?: number | null
          texto: string
          tipo: Database["public"]["Enums"]["whatsapp_template_tipo"]
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string
          direcao?: string
          empresa_id?: string
          entregue_em?: string | null
          enviado_em?: string | null
          erro_detalhe?: string | null
          id?: string
          lido_em?: string | null
          max_tentativas?: number | null
          message_id_externo?: string | null
          paciente_id?: string | null
          resposta_api?: Json | null
          status?: Database["public"]["Enums"]["whatsapp_msg_status"]
          telefone?: string
          template_id?: string | null
          tentativas?: number | null
          texto?: string
          tipo?: Database["public"]["Enums"]["whatsapp_template_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_mensagens_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos_clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_mensagens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_mensagens_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_mensagens_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          antecedencia_minutos: number | null
          ativo: boolean | null
          created_at: string
          empresa_id: string
          id: string
          mensagem: string
          nome: string
          tipo: Database["public"]["Enums"]["whatsapp_template_tipo"]
          updated_at: string
        }
        Insert: {
          antecedencia_minutos?: number | null
          ativo?: boolean | null
          created_at?: string
          empresa_id: string
          id?: string
          mensagem: string
          nome: string
          tipo: Database["public"]["Enums"]["whatsapp_template_tipo"]
          updated_at?: string
        }
        Update: {
          antecedencia_minutos?: number | null
          ativo?: boolean | null
          created_at?: string
          empresa_id?: string
          id?: string
          mensagem?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["whatsapp_template_tipo"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_agendamento_conflito: {
        Args: {
          p_data: string
          p_empresa_id: string
          p_exclude_id?: string
          p_hora_fim: string
          p_hora_inicio: string
          p_profissional_id: string
        }
        Returns: boolean
      }
      get_user_empresa_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      user_belongs_to_empresa: {
        Args: { p_empresa_id: string }
        Returns: boolean
      }
    }
    Enums: {
      agente_conversa_status: "ativa" | "encerrada" | "timeout"
      app_role:
        | "saas_owner"
        | "admin"
        | "profissional"
        | "recepcionista"
        | "paciente"
      empresa_plano: "basico" | "profissional" | "premium" | "enterprise"
      empresa_status: "ativa" | "suspensa" | "cancelada" | "trial"
      meio_pagamento:
        | "dinheiro"
        | "pix"
        | "cartao_credito"
        | "cartao_debito"
        | "transferencia"
        | "boleto"
        | "convenio"
        | "cortesia"
      status_agendamento:
        | "agendado"
        | "confirmado"
        | "em_atendimento"
        | "atendido"
        | "cancelado_paciente"
        | "cancelado_clinica"
        | "faltou"
        | "remarcado"
      status_repasse: "pendente" | "pago" | "cancelado"
      status_teleconsulta: "criada" | "ativa" | "encerrada" | "cancelada"
      whatsapp_msg_status:
        | "pendente"
        | "enviando"
        | "enviado"
        | "entregue"
        | "lido"
        | "erro"
      whatsapp_template_tipo:
        | "lembrete1"
        | "lembrete2"
        | "confirmacao"
        | "cancelamento"
        | "aniversario"
        | "lista_espera"
        | "personalizado"
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
      agente_conversa_status: ["ativa", "encerrada", "timeout"],
      app_role: [
        "saas_owner",
        "admin",
        "profissional",
        "recepcionista",
        "paciente",
      ],
      empresa_plano: ["basico", "profissional", "premium", "enterprise"],
      empresa_status: ["ativa", "suspensa", "cancelada", "trial"],
      meio_pagamento: [
        "dinheiro",
        "pix",
        "cartao_credito",
        "cartao_debito",
        "transferencia",
        "boleto",
        "convenio",
        "cortesia",
      ],
      status_agendamento: [
        "agendado",
        "confirmado",
        "em_atendimento",
        "atendido",
        "cancelado_paciente",
        "cancelado_clinica",
        "faltou",
        "remarcado",
      ],
      status_repasse: ["pendente", "pago", "cancelado"],
      status_teleconsulta: ["criada", "ativa", "encerrada", "cancelada"],
      whatsapp_msg_status: [
        "pendente",
        "enviando",
        "enviado",
        "entregue",
        "lido",
        "erro",
      ],
      whatsapp_template_tipo: [
        "lembrete1",
        "lembrete2",
        "confirmacao",
        "cancelamento",
        "aniversario",
        "lista_espera",
        "personalizado",
      ],
    },
  },
} as const
