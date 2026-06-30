 import DashboardSummary, {
  dashboardMetrics,
} from "../components/DashboardSummary";

export default function FacultyDashboard() {
  return (
    <DashboardSummary
      title="Faculty Management"
      description="View teaching schedules, subjects, and timetable allocation details."
      metrics={dashboardMetrics.faculty}
    />
  );
}