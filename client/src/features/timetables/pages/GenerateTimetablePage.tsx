 import { useEffect, useMemo, useState, type FormEvent } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Input from "../../../components/ui/Input";
import { API_ENDPOINTS } from "../../../config/endpoints";
import { api, getApiErrorMessage } from "../../../lib/api";
import {
  getRecordId,
  listResource,
  type ResourceRecord,
} from "../../../lib/resourceApi";

interface GenerateTimetableForm {
  academicYear: string;
  semester: string;
  batchYear: string;
  departmentId: string;
}

interface GenerateTimetablePayload {
  academicYear: string;
  semester: number;
  batchYear: number;
  departmentId: string;
}

interface NormalizedGenerationResult {
  message: string;
  optimizationSummary: Record<string, unknown>;
  timetableEntries: ResourceRecord[];
  conflictReports: ResourceRecord[];
  raw: unknown;
}

const initialForm: GenerateTimetableForm = {
  academicYear: "2026-2027",
  semester: "1",
  batchYear: "2026",
  departmentId: "",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): ResourceRecord[] {
  return Array.isArray(value) ? (value as ResourceRecord[]) : [];
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    return String(
      record.name ||
        record.title ||
        record.code ||
        record.email ||
        record.roomNumber ||
        record.label ||
        record.id ||
        record._id ||
        "-"
    );
  }

  return String(value);
}

function getDepartmentName(department: ResourceRecord): string {
  return String(
    department.name ||
      department.departmentName ||
      department.title ||
      department.code ||
      getRecordId(department)
  );
}

function normalizeGenerationResult(raw: unknown): NormalizedGenerationResult {
  const root = asRecord(raw);
  const data = asRecord(root.data || raw);

  const optimizationSummary = asRecord(
    data.optimizationSummary ||
      data.summary ||
      data.optimization ||
      data.resultSummary ||
      {}
  );

  const timetableEntries =
    asArray(data.timetableEntries) ||
    asArray(data.generatedTimetable) ||
    asArray(data.timetables) ||
    asArray(data.entries);

  const conflictReports =
    asArray(data.conflictReports) ||
    asArray(data.conflicts) ||
    asArray(data.reports);

  return {
    message: String(root.message || data.message || "Timetable generated successfully."),
    optimizationSummary,
    timetableEntries:
      timetableEntries.length > 0
        ? timetableEntries
        : asArray(data.generatedEntries),
    conflictReports,
    raw,
  };
}

function getEntryTime(entry: ResourceRecord): string {
  const timeSlot = asRecord(entry.timeSlot);

  const startTime =
    entry.startTime || timeSlot.startTime || timeSlot.start || entry.start;

  const endTime = entry.endTime || timeSlot.endTime || timeSlot.end || entry.end;

  if (startTime && endTime) {
    return `${String(startTime)} - ${String(endTime)}`;
  }

  return formatValue(entry.timeSlot || entry.timeSlotId || entry.slot);
}

function getEntrySubject(entry: ResourceRecord): string {
  return formatValue(entry.subject || entry.subjectName || entry.subjectId);
}

function getEntryFaculty(entry: ResourceRecord): string {
  return formatValue(entry.faculty || entry.facultyName || entry.facultyId);
}

function getEntryRoom(entry: ResourceRecord): string {
  return formatValue(entry.room || entry.roomName || entry.roomId);
}

function getEntryDepartment(entry: ResourceRecord): string {
  return formatValue(
    entry.department || entry.departmentName || entry.departmentId
  );
}

export default function GenerateTimetablePage() {
  const [departments, setDepartments] = useState<ResourceRecord[]>([]);
  const [form, setForm] = useState<GenerateTimetableForm>(initialForm);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<NormalizedGenerationResult | null>(null);

  const selectedDepartment = useMemo(
    () =>
      departments.find(
        (department) => getRecordId(department) === form.departmentId
      ),
    [departments, form.departmentId]
  );

  async function loadDepartments() {
    try {
      setIsLoadingDepartments(true);
      setPageError(null);

      const data = await listResource(API_ENDPOINTS.departments);
      setDepartments(data);

      if (data.length > 0) {
        setForm((previous) => {
          if (previous.departmentId) return previous;

          return {
            ...previous,
            departmentId: getRecordId(data[0]),
          };
        });
      }
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    } finally {
      setIsLoadingDepartments(false);
    }
  }

  useEffect(() => {
    void loadDepartments();
  }, []);

  function updateField(name: keyof GenerateTimetableForm, value: string) {
    setFieldError(null);
    setPageError(null);
    setSuccessMessage(null);

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function validateForm(): GenerateTimetablePayload | null {
    if (!form.departmentId) {
      setFieldError("Select a department before generating timetable.");
      return null;
    }

    if (!form.academicYear.trim()) {
      setFieldError("Academic year is required.");
      return null;
    }

    const semester = Number(form.semester);
    const batchYear = Number(form.batchYear);

    if (!Number.isInteger(semester) || semester < 1 || semester > 12) {
      setFieldError("Semester must be a valid number.");
      return null;
    }

    if (!Number.isInteger(batchYear) || batchYear < 2000) {
      setFieldError("Batch year must be a valid year.");
      return null;
    }

    return {
      academicYear: form.academicYear.trim(),
      semester,
      batchYear,
      departmentId: form.departmentId,
    };
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = validateForm();
    if (!payload) return;

    try {
      setIsGenerating(true);
      setPageError(null);
      setSuccessMessage(null);
      setResult(null);

      const response = await api.post(API_ENDPOINTS.generateTimetable[0], payload);
      const normalizedResult = normalizeGenerationResult(response.data);

      setResult(normalizedResult);
      setSuccessMessage(normalizedResult.message);
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
          Timetable Generation
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Generate Optimized Timetable
        </h1>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          Create conflict-aware timetables using faculty availability, room
          capacity, subject requirements, and student course selections.
        </p>
      </div>

      {pageError && (
        <div className="mb-5">
          <ErrorMessage message={pageError} />
        </div>
      )}

      {successMessage && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <h2 className="text-lg font-black text-slate-950">
            Generation Inputs
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Select real academic data from the system before running timetable
            generation.
          </p>

          <form onSubmit={handleGenerate} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="departmentId"
                className="text-sm font-semibold text-slate-700"
              >
                Department
              </label>

              <select
                id="departmentId"
                value={form.departmentId}
                disabled={isLoadingDepartments || isGenerating}
                onChange={(event) =>
                  updateField("departmentId", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  {isLoadingDepartments
                    ? "Loading departments..."
                    : "Select department"}
                </option>

                {departments.map((department) => {
                  const id = getRecordId(department);

                  return (
                    <option key={id} value={id}>
                      {getDepartmentName(department)}
                    </option>
                  );
                })}
              </select>
            </div>

            <Input
              label="Academic Year"
              name="academicYear"
              placeholder="2026-2027"
              value={form.academicYear}
              disabled={isGenerating}
              onChange={(event) =>
                updateField("academicYear", event.target.value)
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Semester"
                name="semester"
                type="number"
                min={1}
                max={12}
                value={form.semester}
                disabled={isGenerating}
                onChange={(event) =>
                  updateField("semester", event.target.value)
                }
              />

              <Input
                label="Batch Year"
                name="batchYear"
                type="number"
                min={2000}
                value={form.batchYear}
                disabled={isGenerating}
                onChange={(event) =>
                  updateField("batchYear", event.target.value)
                }
              />
            </div>

            {selectedDepartment && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Selected department:{" "}
                <span className="font-bold">
                  {getDepartmentName(selectedDepartment)}
                </span>
              </div>
            )}

            {fieldError && <ErrorMessage message={fieldError} />}

            <Button
              type="submit"
              variant="ai"
              size="lg"
              className="w-full"
              isLoading={isGenerating}
              disabled={isLoadingDepartments || departments.length === 0}
            >
              Generate Timetable
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-black text-slate-950">
            Generation Result
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Results appear here after timetable generation is completed.
          </p>

          {isGenerating && (
            <div className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-6 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
              <h3 className="mt-4 text-lg font-black text-slate-950">
                Generating timetable
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Please wait while the academic timetable is created and checked
                for conflicts.
              </p>
            </div>
          )}

          {!isGenerating && !result && (
            <div className="mt-6">
              <EmptyState
                title="No generation result yet"
                description="Select department, semester, batch year, and academic year, then generate the timetable."
              />
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-6">
              <section>
                <h3 className="text-base font-black text-slate-950">
                  Optimization Summary
                </h3>

                {Object.keys(result.optimizationSummary).length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    No optimization summary was returned.
                  </p>
                ) : (
                  <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(result.optimizationSummary).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            {key.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="mt-2 text-xl font-black text-slate-950">
                            {formatValue(value)}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-base font-black text-slate-950">
                  Generated Timetable Entries
                </h3>

                {result.timetableEntries.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    No timetable entries were returned in the response.
                  </p>
                ) : (
                  <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full min-w-[860px] text-left text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 font-black text-slate-600">
                            Day
                          </th>
                          <th className="px-4 py-3 font-black text-slate-600">
                            Time
                          </th>
                          <th className="px-4 py-3 font-black text-slate-600">
                            Subject
                          </th>
                          <th className="px-4 py-3 font-black text-slate-600">
                            Faculty
                          </th>
                          <th className="px-4 py-3 font-black text-slate-600">
                            Room
                          </th>
                          <th className="px-4 py-3 font-black text-slate-600">
                            Department
                          </th>
                          <th className="px-4 py-3 font-black text-slate-600">
                            Semester
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {result.timetableEntries.map((entry, index) => (
                          <tr key={getRecordId(entry) || index}>
                            <td className="border-t border-slate-100 px-4 py-3">
                              {formatValue(entry.day)}
                            </td>
                            <td className="border-t border-slate-100 px-4 py-3">
                              {getEntryTime(entry)}
                            </td>
                            <td className="border-t border-slate-100 px-4 py-3">
                              {getEntrySubject(entry)}
                            </td>
                            <td className="border-t border-slate-100 px-4 py-3">
                              {getEntryFaculty(entry)}
                            </td>
                            <td className="border-t border-slate-100 px-4 py-3">
                              {getEntryRoom(entry)}
                            </td>
                            <td className="border-t border-slate-100 px-4 py-3">
                              {getEntryDepartment(entry)}
                            </td>
                            <td className="border-t border-slate-100 px-4 py-3">
                              {formatValue(entry.semester)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-base font-black text-slate-950">
                  Conflict Reports
                </h3>

                {result.conflictReports.length === 0 ? (
                  <p className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                    No conflicts were returned.
                  </p>
                ) : (
                  <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 font-black text-slate-600">
                            Type
                          </th>
                          <th className="px-4 py-3 font-black text-slate-600">
                            Severity
                          </th>
                          <th className="px-4 py-3 font-black text-slate-600">
                            Message
                          </th>
                          <th className="px-4 py-3 font-black text-slate-600">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {result.conflictReports.map((conflict, index) => (
                          <tr key={getRecordId(conflict) || index}>
                            <td className="border-t border-slate-100 px-4 py-3">
                              {formatValue(conflict.type)}
                            </td>
                            <td className="border-t border-slate-100 px-4 py-3">
                              {formatValue(conflict.severity)}
                            </td>
                            <td className="border-t border-slate-100 px-4 py-3">
                              {formatValue(
                                conflict.message || conflict.description
                              )}
                            </td>
                            <td className="border-t border-slate-100 px-4 py-3">
                              {formatValue(conflict.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}