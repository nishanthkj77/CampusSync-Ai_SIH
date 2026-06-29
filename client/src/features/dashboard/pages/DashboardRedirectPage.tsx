import { Navigate } from "react-router";
import { routes } from "../../../config/routes";
import { ROLES } from "../../../constants/roles";
import { useAuth } from "../../auth/store/auth.store";

export default function DashboardRedirectPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={routes.login} replace />;
  }

  switch (user.role) {
    case ROLES.STUDENT:
      return <Navigate to={routes.studentDashboard} replace />;
    case ROLES.FACULTY:
      return <Navigate to={routes.facultyDashboard} replace />;
    case ROLES.HOD:
      return <Navigate to={routes.hodDashboard} replace />;
    case ROLES.ADMIN:
      return <Navigate to={routes.adminDashboard} replace />;
    default:
      return <Navigate to={routes.unauthorized} replace />;
  }
}