import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { session, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};
