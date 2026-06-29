 import DashboardSummary, {
  dashboardMetrics,
} from "../components/DashboardSummary";

export default function AdminDashboard() {
  return (
    <DashboardSummary
      title="Admin Dashboard"
      description="Manage all CampusSync AI academic master data and timetable generation modules."
      metrics={dashboardMetrics.academicMaster}
    />
  );
}