import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AuthRoute() {
  const { isAuthenticated, loading } = useAuth();
if (loading) {
  return null;
}

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}