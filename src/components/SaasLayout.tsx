import { Outlet } from "react-router-dom";
import { SaasSidebar } from "./SaasSidebar";

export function SaasLayout() {
  return (
    <div className="min-h-screen bg-background">
      <SaasSidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 pt-16 lg:p-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
