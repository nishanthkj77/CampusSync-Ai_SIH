 import { Navigate, Route, Routes } from "react-router";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { routes } from "../../config/routes";
import { ROLES } from "../../constants/roles";

import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";

import StudentDashboard from "../../features/dashboard/pages/StudentDashboard";
import FacultyDashboard from "../../features/dashboard/pages/FacultyDashboard";
import HodDashboard from "../../features/dashboard/pages/HodDashboard";
import AdminDashboard from "../../features/dashboard/pages/AdminDashboard";
import DashboardRedirectPage from "../../features/dashboard/pages/DashboardRedirectPage";

import DepartmentsPage from "../../features/departments/pages/DepartmentsPage";
import FacultiesPage from "../../features/faculties/pages/FacultiesPage";
import StudentsPage from "../../features/students/pages/StudentsPage";
import SubjectsPage from "../../features/subjects/pages/SubjectsPage";
import RoomsPage from "../../features/rooms/pages/RoomsPage";
import TimeSlotsPage from "../../features/timeslots/pages/TimeSlotsPage";
import CourseSelectionsPage from "../../features/course-selections/pages/CourseSelectionsPage";
import TimetablesPage from "../../features/timetables/pages/TimetablesPage";
import GenerateTimetablePage from "../../features/timetables/pages/GenerateTimetablePage";
import ConflictReportsPage from "../../features/conflict-reports/pages/ConflictReportsPage";

import UnauthorizedPage from "../../pages/UnauthorizedPage";
import NotFoundPage from "../../pages/NotFoundPage";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path={routes.root}
        element={<Navigate to={routes.login} replace />}
      />

      <Route path={routes.login} element={<LoginPage />} />
      <Route path={routes.register} element={<RegisterPage />} />
      <Route path={routes.unauthorized} element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={routes.dashboard} element={<DashboardRedirectPage />} />

          <Route element={<RoleRoute allowedRoles={[ROLES.STUDENT]} />}>
            <Route
              path={routes.studentDashboard}
              element={<StudentDashboard />}
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.FACULTY]} />}>
            <Route
              path={routes.facultyDashboard}
              element={<FacultyDashboard />}
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.HOD]} />}>
            <Route path={routes.hodDashboard} element={<HodDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path={routes.adminDashboard} element={<AdminDashboard />} />
          </Route>

          <Route
            element={<RoleRoute allowedRoles={[ROLES.HOD, ROLES.ADMIN]} />}
          >
            <Route path={routes.departments} element={<DepartmentsPage />} />
            <Route path={routes.faculties} element={<FacultiesPage />} />
            <Route path={routes.students} element={<StudentsPage />} />
            <Route path={routes.subjects} element={<SubjectsPage />} />
            <Route path={routes.rooms} element={<RoomsPage />} />
            <Route path={routes.timeslots} element={<TimeSlotsPage />} />

            <Route
              path={routes.generateTimetable}
              element={<GenerateTimetablePage />}
            />

            <Route
              path={routes.conflictReports}
              element={<ConflictReportsPage />}
            />
          </Route>

          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.STUDENT,
                  ROLES.FACULTY,
                  ROLES.HOD,
                  ROLES.ADMIN,
                ]}
              />
            }
          >
            <Route path={routes.timetables} element={<TimetablesPage />} />

            <Route
              path={routes.courseSelections}
              element={<CourseSelectionsPage />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}