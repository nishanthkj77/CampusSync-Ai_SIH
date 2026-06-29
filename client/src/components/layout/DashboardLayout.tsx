import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="lg:pl-72">
        <Topbar />

        <main className="px-5 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}