import { NavLink, useLocation } from "react-router";
import { routes } from "../../config/routes";
import { ROLES, type Role } from "../../constants/roles";
import { useAuth } from "../../features/auth/store/auth.store";

interface NavItem {
  label: string;
  path: string;
  code: string;
  roles: Role[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const allRoles: Role[] = [
  ROLES.STUDENT,
  ROLES.FACULTY,
  ROLES.HOD,
  ROLES.ADMIN,
];

const timetableManagerRoles: Role[] = [ROLES.HOD, ROLES.ADMIN]; 


const navGroups: NavGroup[] = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        path: routes.dashboard,
        code: "DB",
        roles: allRoles,
      },
      {
        label: "Timetables",
        path: routes.timetables,
        code: "TT",
        roles: allRoles,
      },
    ],
  },
  {
    title: "Master Data",
    items: [
      { label: "Departments", path: routes.departments, code: "DP", roles: [ROLES.HOD, ROLES.ADMIN] },
      { label: "Faculties", path: routes.faculties, code: "FC", roles: [ROLES.HOD, ROLES.ADMIN] },
      { label: "Students", path: routes.students, code: "ST", roles: [ROLES.HOD, ROLES.ADMIN] },
      { label: "Subjects", path: routes.subjects, code: "SB", roles: [ROLES.HOD, ROLES.ADMIN] },
      { label: "Rooms", path: routes.rooms, code: "RM", roles: [ROLES.HOD, ROLES.ADMIN] },
      { label: "TimeSlots", path: routes.timeslots, code: "TS", roles: [ROLES.HOD, ROLES.ADMIN] },
    ],
  },
  {
    title: "Academics",
    items: [
      {
        label: "Course Selections",
        path: routes.courseSelections,
        code: "CS",
        roles: [ROLES.STUDENT, ROLES.HOD, ROLES.ADMIN],
      },
      {
        label: "Conflict Reports",
        path: routes.conflictReports,
        code: "CR",
        roles: [ROLES.HOD, ROLES.ADMIN],
      },
    ],
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-sm font-black text-slate-950">
          CS
        </div>

        <div>
          <h1 className="text-lg font-black text-slate-950">
            Campus<span className="text-orange-500">Sync AI</span>
          </h1>
          <p className="text-xs text-slate-500">NEP Timetable System</p>
        </div>
      </div>

      <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-5">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) =>
            item.roles.includes(user.role)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="mb-6">
              <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </p>

              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isDashboardActive =
                    item.path === routes.dashboard &&
                    location.pathname.includes("dashboard");

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                          isActive || isDashboardActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                        ].join(" ")
                      }
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-[11px] font-black">
                        {item.code}
                      </span>
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}

          {timetableManagerRoles.includes(user.role) && (
           <div className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-black text-slate-950">AI Engine</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Generate optimized timetable using real academic data.
            </p>

            <NavLink
              to={routes.generateTimetable}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
            >
              Generate Timetable
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
}