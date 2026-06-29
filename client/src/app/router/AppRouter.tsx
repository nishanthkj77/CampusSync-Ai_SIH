 import { Navigate, Route, Routes } from "react-router";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { routes } from "../../config/routes";
import { ROLES } from "../../constants/roles";
import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import AdminDashboard from "../../features/dashboard/pages/AdminDashboard";
import DashboardRedirectPage from "../../features/dashboard/pages/DashboardRedirectPage";
import FacultyDashboard from "../../features/dashboard/pages/FacultyDashboard";
import HodDashboard from "../../features/dashboard/pages/HodDashboard";
import StudentDashboard from "../../features/dashboard/pages/StudentDashboard";
import NotFoundPage from "../../pages/NotFoundPage";
import RequiredModulePage from "../../pages/RequiredModulePage";
import UnauthorizedPage from "../../pages/UnauthorizedPage";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

export default function AppRouter() {
  return (
    <Routes>
      <Route path={routes.root} element={<Navigate to={routes.login} replace />} />
      <Route path={routes.login} element={<LoginPage />} />
      <Route path={routes.register} element={<RegisterPage />} />
      <Route path={routes.unauthorized} element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={routes.dashboard} element={<DashboardRedirectPage />} />

          <Route element={<RoleRoute allowedRoles={[ROLES.STUDENT]} />}>
            <Route path={routes.studentDashboard} element={<StudentDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.FACULTY]} />}>
            <Route path={routes.facultyDashboard} element={<FacultyDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.HOD]} />}>
            <Route path={routes.hodDashboard} element={<HodDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path={routes.adminDashboard} element={<AdminDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.HOD, ROLES.ADMIN]} />}>
            <Route
              path={routes.departments}
              element={
                <RequiredModulePage
                  title="Department Management"
                  description="Manage academic departments used for timetable generation."
                />
              }
            />
            <Route
              path={routes.faculties}
              element={
                <RequiredModulePage
                  title="Faculty Management"
                  description="Manage faculty records, department mapping, and timetable allocation data."
                />
              }
            />
            <Route
              path={routes.students}
              element={
                <RequiredModulePage
                  title="Student Management"
                  description="Manage student records required for course selections and timetable views."
                />
              }
            />
            <Route
              path={routes.subjects}
              element={
                <RequiredModulePage
                  title="Subject Management"
                  description="Manage subjects used for course mappings and timetable generation."
                />
              }
            />
            <Route
              path={routes.rooms}
              element={
                <RequiredModulePage
                  title="Room Management"
                  description="Manage classrooms and labs used for room allocation."
                />
              }
            />
            <Route
              path={routes.timeslots}
              element={
                <RequiredModulePage
                  title="TimeSlot Management"
                  description="Manage available time slots for timetable generation."
                />
              }
            />
            <Route
              path={routes.generateTimetable}
              element={
                <RequiredModulePage
                  title="Generate Timetable"
                  description="Generate optimized timetables using backend timetable generation APIs."
                />
              }
            />
            <Route
              path={routes.conflictReports}
              element={
                <RequiredModulePage
                  title="Conflict Reports"
                  description="Review timetable conflicts detected by the backend."
                />
              }
            />
          </Route>

          <Route
            element={
              <RoleRoute
                allowedRoles={[ROLES.STUDENT, ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN]}
              />
            }
          >
            <Route
              path={routes.timetables}
              element={
                <RequiredModulePage
                  title="Timetable View"
                  description="View generated timetables based on your role."
                />
              }
            />
            <Route
              path={routes.courseSelections}
              element={
                <RequiredModulePage
                  title="Course Selection"
                  description="Manage or view course selections depending on your role."
                />
              }
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}