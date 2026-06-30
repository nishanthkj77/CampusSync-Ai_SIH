 import DashboardSummary, {
  dashboardMetrics,
} from "../components/DashboardSummary";

export default function HodDashboard() {
  return (
    <DashboardSummary
      title="Academic Scheduling Dashboard"
      description="Monitor department timetable planning, faculty allocation, and conflict reports."
      metrics={dashboardMetrics.hod}
    />
  );
}