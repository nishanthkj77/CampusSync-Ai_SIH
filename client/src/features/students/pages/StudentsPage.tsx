import { API_ENDPOINTS } from "../../../config/endpoints";
import ResourcePage from "../../common/ResourcePage";

export default function StudentsPage() {
  return (
    <ResourcePage
      title="Student Management"
      description="Manage student records used for course selections and timetable visibility."
      endpoints={API_ENDPOINTS.students}
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "rollNumber", label: "Roll No" },
        { key: "department", label: "Department" },
        { key: "semester", label: "Semester" },
      ]}
      fields={[
        { name: "name", label: "Student Name", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "rollNumber", label: "Roll Number" },
        { name: "departmentId", label: "Department ID" },
        { name: "semester", label: "Semester", type: "number" },
      ]}
    />
  );
}