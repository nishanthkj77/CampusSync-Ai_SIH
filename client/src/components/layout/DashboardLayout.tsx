 import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="lg:pl-64">
        <Topbar />

        <main className="min-h-[calc(100vh-4rem)] px-5 py-7 lg:px-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}