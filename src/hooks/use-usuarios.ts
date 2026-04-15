import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";
import { toast } from "@/hooks/use-toast";

export type AppRole = "saas_owner" | "admin" | "profissional" | "recepcionista" | "paciente";

export function useUsuarios() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["usuarios", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      // Get profiles that belong to this empresa
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome, email, telefone, avatar_url, empresa_id, created_at")
        .eq("empresa_id", empresaId)
        .order("nome");
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

export function useUserRoles(userId?: string) {
  return useQuery({
    queryKey: ["user_roles", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, role")
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useAllUserRoles() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["all_user_roles", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      // Get all profiles for this empresa, then fetch their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id")
        .eq("empresa_id", empresaId);
      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) return [];

      const userIds = profiles.map((p) => p.id);
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role")
        .in("user_id", userIds);
      if (rolesError) throw rolesError;

      return roles || [];
    },
    enabled: !!empresaId,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Delete existing role, then insert new one
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all_user_roles"] });
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      toast({ title: "Perfil de acesso atualizado!" });
    },
    onError: (e: Error) => toast({ title: "Erro ao atualizar perfil", description: e.message, variant: "destructive" }),
  });
}
