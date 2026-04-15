import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireEmpresa?: boolean;
}

export function ProtectedRoute({ children, redirectTo = "/login", requireEmpresa = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-xs text-muted-foreground animate-pulse">Carregando painel (v3)...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If empresa is required and user doesn't have one yet → onboarding
  if (requireEmpresa && !profile?.empresa_id) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
