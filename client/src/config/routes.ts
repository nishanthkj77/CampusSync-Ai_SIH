export const routes = {
  root: "/",
  login: "/login",
  register: "/register",

  dashboard: "/dashboard",

  studentDashboard: "/student/dashboard",
  facultyDashboard: "/faculty/dashboard",
  hodDashboard: "/hod/dashboard",
  adminDashboard: "/admin/dashboard",

  departments: "/departments",
  faculties: "/faculties",
  students: "/students",
  subjects: "/subjects",
  rooms: "/rooms",
  timeslots: "/timeslots",
  courseSelections: "/course-selections",
  timetables: "/timetables",
  generateTimetable: "/timetables/generate",
  conflictReports: "/conflict-reports",

  unauthorized: "/unauthorized",
} as const;