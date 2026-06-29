import { Navigate, Outlet } from "react-router";
import { routes } from "../../config/routes";
import { useAuth } from "../../features/auth/store/auth.store";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={routes.login} replace />;
  }

  return <Outlet />;
}