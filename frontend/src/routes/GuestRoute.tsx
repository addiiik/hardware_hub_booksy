import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import LoadingOverlay from "@/components/loading-overlay";

export default function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingOverlay />;

  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}