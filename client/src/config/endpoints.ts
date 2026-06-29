export const API_ENDPOINTS = {
  departments: ["/departments", "/department"],
  faculties: ["/faculties", "/faculty"],
  students: ["/students", "/student"],
  subjects: ["/subjects", "/subject"],
  rooms: ["/rooms", "/room"],
  timeslots: ["/timeslots", "/time-slots", "/timeslot"],
  courseSelections: [
    "/course-selections",
    "/courseSelections",
    "/course-selection",
  ],
  timetables: ["/timetables", "/timetable"],
  generateTimetable: ["/timetables/generate", "/timetable/generate"],
  conflictReports: [
    "/conflict-reports",
    "/conflictReports",
    "/conflicts",
    "/conflict-report",
  ],
} as const;
