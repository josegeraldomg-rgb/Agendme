import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { EmpresaProvider } from "@/contexts/EmpresaContext";

export function AppLayout() {
  return (
    <EmpresaProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <main className="lg:ml-64 min-h-screen">
          <div className="p-4 pt-16 lg:p-8 lg:pt-8">
            <Outlet />
          </div>
        </main>
      </div>
    </EmpresaProvider>
  );
}
