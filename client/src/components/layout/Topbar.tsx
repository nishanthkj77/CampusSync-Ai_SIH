import { useNavigate } from "react-router";
import Button from "../ui/Button";
import { routes } from "../../config/routes";
import { useAuth } from "../../features/auth/store/auth.store";

export default function Topbar() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  function handleLogout() {
    logoutUser();
    navigate(routes.login, { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-5 lg:px-8">
        <div>
          <p className="text-sm font-black text-slate-950">
            CampusSync AI Control Panel
          </p>
          <p className="text-xs text-slate-500">
            SIH 2026 • NEP timetable generation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-slate-950">
              {user?.name || "CampusSync User"}
            </p>
            <p className="text-xs font-medium text-orange-600">{user?.role}</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-xs font-black text-white">
            {user?.name?.slice(0, 2).toUpperCase() || "CS"}
          </div>

          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}