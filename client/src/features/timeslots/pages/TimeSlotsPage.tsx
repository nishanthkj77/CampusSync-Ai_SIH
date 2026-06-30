import { API_ENDPOINTS } from "../../../config/endpoints";
import ResourcePage from "../../common/ResourcePage";

export default function TimeSlotsPage() {
  return (
    <ResourcePage
      title="Manage available academic time slots for timetable generation."
      description="Manage available academic time slots for timetable generation."
      endpoints={API_ENDPOINTS.timeslots}
      columns={[
        { key: "day", label: "Day" },
        { key: "startTime", label: "Start Time" },
        { key: "endTime", label: "End Time" },
        { key: "label", label: "Label" },
      ]}
      fields={[
        { name: "day", label: "Day", required: true },
        { name: "startTime", label: "Start Time", type: "time", required: true },
        { name: "endTime", label: "End Time", type: "time", required: true },
        { name: "label", label: "Label" },
      ]}
    />
  );
}