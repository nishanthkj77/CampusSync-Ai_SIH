import RoleDashboardShell from "../components/RoleDashboardShell";

export default function StudentDashboard() {
  return (
    <RoleDashboardShell
      title="Student Dashboard"
      description="View personal timetable and course selection information."
      scope="Next step will connect this page to student timetable and course selection APIs."
    />
  );
}