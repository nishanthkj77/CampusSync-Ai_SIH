import { API_ENDPOINTS } from "../../../config/endpoints";
import ResourcePage from "../../common/ResourcePage";

export default function TimetablesPage() {
  return (
    <ResourcePage
      title="Timetable View"
      description="View generated timetables from the backend based on logged-in user role."
      endpoints={API_ENDPOINTS.timetables}
      canCreate={false}
      canDelete={false}
      columns={[
        { key: "department", label: "Department" },
        { key: "semester", label: "Semester" },
        { key: "day", label: "Day" },
        { key: "timeSlot", label: "TimeSlot" },
        { key: "subject", label: "Subject" },
        { key: "faculty", label: "Faculty" },
        { key: "room", label: "Room" },
      ]}
    />
  );
}