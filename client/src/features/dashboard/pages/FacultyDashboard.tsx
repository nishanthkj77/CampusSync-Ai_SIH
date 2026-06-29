import RoleDashboardShell from "../components/RoleDashboardShell";

export default function FacultyDashboard() {
  return (
    <RoleDashboardShell
      title="Faculty Dashboard"
      description="View teaching schedule, assigned subjects, and timetable allocations."
      scope="Next step will connect this page to faculty timetable and subject assignment APIs."
    />
  );
}