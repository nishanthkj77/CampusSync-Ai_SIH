 import DashboardSummary, {
  dashboardMetrics,
} from "../components/DashboardSummary";

export default function AdminDashboard() {
  return (
    <DashboardSummary
      title="Academic Scheduling Dashboard"
      description="Manage academic data, timetable generation, and conflict reports across the institution."
      metrics={dashboardMetrics.academicMaster}
    />
  );
}