import RoleDashboardShell from "../components/RoleDashboardShell";

export default function AdminDashboard() {
  return (
    <RoleDashboardShell
      title="Admin Dashboard"
      description="Manage academic master data, timetable generation, and conflict reports."
      scope="Next step will connect this page to admin dashboard and master-data APIs."
    />
  );
}