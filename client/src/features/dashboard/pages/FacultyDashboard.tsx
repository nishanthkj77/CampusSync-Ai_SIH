 import DashboardSummary, {
  dashboardMetrics,
} from "../components/DashboardSummary";

export default function FacultyDashboard() {
  return (
    <DashboardSummary
      title="Faculty Dashboard"
      description="View teaching-related timetable and subject data from backend APIs."
      metrics={dashboardMetrics.faculty}
    />
  );
}