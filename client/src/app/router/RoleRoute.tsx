import { Navigate, Outlet } from "react-router";
import { routes } from "../../config/routes";
import type { Role } from "../../constants/roles";
import { useAuth } from "../../features/auth/store/auth.store";

interface RoleRouteProps {
  allowedRoles: Role[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={routes.login} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={routes.unauthorized} replace />;
  }

  return <Outlet />;
}