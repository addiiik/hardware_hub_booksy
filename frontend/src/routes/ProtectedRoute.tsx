import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type ProtectedRouteProps = {
  adminOnly?: boolean;
};

export default function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/hardware" replace />;
  }

  return <Outlet />;
}