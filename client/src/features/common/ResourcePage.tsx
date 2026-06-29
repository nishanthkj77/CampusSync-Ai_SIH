import { useEffect, useMemo, useState, type FormEvent } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Input from "../../components/ui/Input";
import { getApiErrorMessage } from "../../lib/api";
import {
  createResource,
  deleteResource,
  getRecordId,
  listResource,
  type EndpointList,
  type ResourceRecord,
} from "../../lib/resourceApi";

interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "time" | "date";
  placeholder?: string;
  required?: boolean;
}

interface ColumnConfig {
  key: string;
  label: string;
}

interface ResourcePageProps {
  title: string;
  description: string;
  endpoints: EndpointList;
  columns: ColumnConfig[];
  fields?: FieldConfig[];
  canCreate?: boolean;
  canDelete?: boolean;
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
        record.id ||
        record._id ||
        "-"
    );
  }

  return String(value);
}

function buildInitialForm(fields: FieldConfig[]) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});
}

export default function ResourcePage({
  title,
  description,
  endpoints,
  columns,
  fields = [],
  canCreate = true,
  canDelete = true,
}: ResourcePageProps) {
  const [items, setItems] = useState<ResourceRecord[]>([]);
  const [form, setForm] = useState<Record<string, string>>(
    buildInitialForm(fields)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasForm = canCreate && fields.length > 0;

  const visibleItems = useMemo(() => items, [items]);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await listResource(endpoints);
      setItems(data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function updateForm(name: string, value: string) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function buildPayload() {
    const payload: Record<string, unknown> = {};

    fields.forEach((field) => {
      const value = form[field.name];

      if (value === "") return;

      payload[field.name] = field.type === "number" ? Number(value) : value;
    });

    return payload;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const missingField = fields.find(
      (field) => field.required && !form[field.name]?.trim()
    );

    if (missingField) {
      setError(`${missingField.label} is required`);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await createResource(endpoints, buildPayload());
      setForm(buildInitialForm(fields));
      await loadData();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(record: ResourceRecord) {
    const id = getRecordId(record);

    if (!id) {
      setError("Cannot delete this record because id is missing.");
      return;
    }

    const confirmed = window.confirm("Delete this record?");
    if (!confirmed) return;

    try {
      setError(null);
      await deleteResource(endpoints, id);
      await loadData();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    }
  }

  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
            CampusSync AI module
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>

        <Button variant="secondary" onClick={() => void loadData()}>
          Refresh
        </Button>
      </div>

      {error && <div className="mb-5"><ErrorMessage message={error} /></div>}

      <div className={hasForm ? "grid gap-6 xl:grid-cols-[1fr_360px]" : ""}>
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-950">Records</h2>
              <p className="mt-1 text-sm text-slate-500">
                Total records loaded: {items.length}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-14 text-center text-sm font-medium text-slate-500">
              Loading {title.toLowerCase()}...
            </div>
          ) : visibleItems.length === 0 ? (
            <EmptyState
              title="No records found"
              description="Backend returned an empty list for this module."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="border-b border-slate-200 bg-slate-50 px-4 py-3 font-black text-slate-600"
                      >
                        {column.label}
                      </th>
                    ))}

                    {canDelete && (
                      <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-right font-black text-slate-600">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {visibleItems.map((item, index) => (
                    <tr key={getRecordId(item) || index}>
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="border-b border-slate-100 px-4 py-3 text-slate-700"
                        >
                          {formatValue(item[column.key])}
                        </td>
                      ))}

                      {canDelete && (
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

        {hasForm && (
          <Card>
            <h2 className="text-lg font-black text-slate-950">Add Record</h2>
            <p className="mt-1 text-sm text-slate-500">
              This form submits directly to your backend API.
            </p>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              {fields.map((field) => (
                <Input
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={form[field.name] || ""}
                  onChange={(event) =>
                    updateForm(field.name, event.target.value)
                  }
                />
              ))}

              <Button
                type="submit"
                variant="ai"
                className="w-full"
                isLoading={isSaving}
              >
                Save {title}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}