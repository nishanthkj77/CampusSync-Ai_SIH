 import DashboardSummary, {
  dashboardMetrics,
} from "../components/DashboardSummary";

export default function StudentDashboard() {
  return (
    <DashboardSummary
      title="Academic Scheduling Dashboard"
      description="View timetable and course selection information assigned to your academic profile."
      metrics={dashboardMetrics.student}
    />
  );
}