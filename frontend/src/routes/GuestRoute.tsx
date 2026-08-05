import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) return <Navigate to="/hardware" replace />;

  return <Outlet />;
}