 import { useEffect, useState, type FormEvent } from "react";

import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Input from "../../../components/ui/Input";
import { API_ENDPOINTS } from "../../../config/endpoints";
import { ROLES } from "../../../constants/roles";
import { useAuth } from "../../auth/store/auth.store";
import { getApiErrorMessage } from "../../../lib/api";
import {
  createResource,
  deleteResource,
  getRecordId,
  listResource,
  type ResourceRecord,
} from "../../../lib/resourceApi";

interface CourseSelectionForm {
  studentId: string;
  subjectId: string;
  semester: string;
  status: string;
}

const initialForm: CourseSelectionForm = {
  studentId: "",
  subjectId: "",
  semester: "1",
  status: "",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "object") {
    const record = asRecord(value);

    return String(
      record.name ||
        record.fullName ||
        record.title ||
        record.code ||
        record.email ||
        record.rollNumber ||
        record.id ||
        record._id ||
        "-"
    );
  }

  return String(value);
}

function getStudentLabel(student: ResourceRecord): string {
  const name = String(student.name || student.fullName || "Student");
  const rollNumber = student.rollNumber
    ? ` • ${String(student.rollNumber)}`
    : "";
  const email = student.email ? ` • ${String(student.email)}` : "";

  return `${name}${rollNumber}${email}`;
}

function getSubjectLabel(subject: ResourceRecord): string {
  const name = String(subject.name || subject.title || "Subject");
  const code = subject.code ? ` • ${String(subject.code)}` : "";

  return `${name}${code}`;
}

export default function CourseSelectionsPage() {
  const { user } = useAuth();

  const canManageSelections =
    user?.role === ROLES.HOD || user?.role === ROLES.ADMIN;

  const [courseSelections, setCourseSelections] = useState<ResourceRecord[]>(
    []
  );
  const [students, setStudents] = useState<ResourceRecord[]>([]);
  const [subjects, setSubjects] = useState<ResourceRecord[]>([]);
  const [form, setForm] = useState<CourseSelectionForm>(initialForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPageData() {
    try {
      setIsLoading(true);
      setError(null);

      const courseSelectionData = await listResource(
        API_ENDPOINTS.courseSelections
      );

      setCourseSelections(courseSelectionData);

      if (canManageSelections) {
        const [studentData, subjectData] = await Promise.all([
          listResource(API_ENDPOINTS.students),
          listResource(API_ENDPOINTS.subjects),
        ]);

        setStudents(studentData);
        setSubjects(subjectData);

        setForm((previous) => ({
          ...previous,
          studentId: previous.studentId || getRecordId(studentData[0] || {}),
          subjectId: previous.subjectId || getRecordId(subjectData[0] || {}),
        }));
      }
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPageData();
  }, [canManageSelections]);

  function updateField(name: keyof CourseSelectionForm, value: string) {
    setError(null);

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!form.studentId) {
      setError("Select a student from the list.");
      return false;
    }

    if (!form.subjectId) {
      setError("Select a subject from the list.");
      return false;
    }

    const semester = Number(form.semester);

    if (!Number.isInteger(semester) || semester < 1 || semester > 12) {
      setError("Semester must be a valid number.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManageSelections) {
      setError("Only HOD or Admin can create course selections from this page.");
      return;
    }

    if (!validateForm()) return;

    try {
      setIsSaving(true);
      setError(null);

      const payload: Record<string, unknown> = {
        studentId: form.studentId,
        subjectId: form.subjectId,
        semester: Number(form.semester),
      };

      if (form.status) {
        payload.status = form.status;
      }

      await createResource(API_ENDPOINTS.courseSelections, payload);

      setForm((previous) => ({
        ...initialForm,
        studentId: previous.studentId,
        subjectId: previous.subjectId,
      }));

      await loadPageData();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(record: ResourceRecord) {
    if (!canManageSelections) {
      setError("Only HOD or Admin can delete course selections.");
      return;
    }

    const id = getRecordId(record);

    if (!id) {
      setError("Cannot delete this record because id is missing.");
      return;
    }

    const confirmed = window.confirm("Delete this course selection?");
    if (!confirmed) return;

    try {
      setError(null);
      await deleteResource(API_ENDPOINTS.courseSelections, id);
      await loadPageData();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    }
  }

  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
            Scheduling
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Course Selections
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Manage student course selections required for NEP-based timetable
            planning.
          </p>
        </div>

        <Button variant="secondary" onClick={() => void loadPageData()}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-5">
          <ErrorMessage message={error} />
        </div>
      )}

      {canManageSelections && (
        <Card className="mb-6">
          <div className="mb-5">
            <h2 className="text-lg font-black text-slate-950">
              Add Course Selection
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select real student and subject records from the system.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[1.3fr_1.3fr_0.7fr_0.9fr_auto]"
          >
            <div>
              <label
                htmlFor="studentId"
                className="text-sm font-semibold text-slate-700"
              >
                Student
              </label>

              <select
                id="studentId"
                value={form.studentId}
                disabled={isLoading || isSaving}
                onChange={(event) =>
                  updateField("studentId", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Select student</option>
                {students.map((student) => {
                  const id = getRecordId(student);

                  return (
                    <option key={id} value={id}>
                      {getStudentLabel(student)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label
                htmlFor="subjectId"
                className="text-sm font-semibold text-slate-700"
              >
                Subject
              </label>

              <select
                id="subjectId"
                value={form.subjectId}
                disabled={isLoading || isSaving}
                onChange={(event) =>
                  updateField("subjectId", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => {
                  const id = getRecordId(subject);

                  return (
                    <option key={id} value={id}>
                      {getSubjectLabel(subject)}
                    </option>
                  );
                })}
              </select>
            </div>

            <Input
              label="Semester"
              name="semester"
              type="number"
              min={1}
              max={12}
              value={form.semester}
              disabled={isSaving}
              onChange={(event) => updateField("semester", event.target.value)}
            />

            <div>
              <label
                htmlFor="status"
                className="text-sm font-semibold text-slate-700"
              >
                Status
              </label>

              <select
                id="status"
                value={form.status}
                disabled={isSaving}
                onChange={(event) => updateField("status", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Default</option>
                <option value="SELECTED">Selected</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                variant="ai"
                className="w-full"
                isLoading={isSaving}
                disabled={students.length === 0 || subjects.length === 0}
              >
                Save
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!canManageSelections && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <h2 className="text-lg font-black text-slate-950">
            Your Course Selections
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Your selected courses are shown below. Course selection changes are
            managed according to department approval rules.
          </p>
        </Card>
      )}

      <Card>
        <div className="mb-4">
          <h2 className="text-lg font-black text-slate-950">Records</h2>
          <p className="mt-1 text-sm text-slate-500">
            Total records loaded: {courseSelections.length}
          </p>
        </div>

        {isLoading ? (
          <div className="py-14 text-center text-sm font-medium text-slate-500">
            Loading course selections...
          </div>
        ) : courseSelections.length === 0 ? (
          <EmptyState
            title="No course selections found"
            description="Course selection records will appear here after they are created."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 font-black text-slate-600">
                    Student
                  </th>
                  <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 font-black text-slate-600">
                    Subject
                  </th>
                  <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 font-black text-slate-600">
                    Semester
                  </th>
                  <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 font-black text-slate-600">
                    Status
                  </th>
                  {canManageSelections && (
                    <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-right font-black text-slate-600">
                      Action
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {courseSelections.map((item, index) => (
                  <tr key={getRecordId(item) || index}>
                    <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                      {formatValue(item.student || item.studentId)}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                      {formatValue(item.subject || item.subjectId)}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                      {formatValue(item.semester)}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                      {formatValue(item.status)}
                    </td>

                    {canManageSelections && (
                      <td className="border-b border-slate-100 px-4 py-3 text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => void handleDelete(item)}
                        >
                          Delete
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}