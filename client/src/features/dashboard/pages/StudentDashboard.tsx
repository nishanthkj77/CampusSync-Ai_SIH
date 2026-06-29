 import DashboardSummary, {
  dashboardMetrics,
} from "../components/DashboardSummary";

export default function StudentDashboard() {
  return (
    <DashboardSummary
      title="Student Dashboard"
      description="View your timetable and course selection information from backend data."
      metrics={dashboardMetrics.student}
    />
  );
}