import axios from "axios";
import { api } from "./api";

export type EndpointList = readonly string[];

export interface ResourceRecord {
  id?: string;
  _id?: string;
  [key: string]: unknown;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function getCandidateData(raw: unknown): unknown {
  const root = asRecord(raw);
  const data = root.data;

  if (Array.isArray(raw)) return raw;
  if (Array.isArray(data)) return data;

  const dataRecord = asRecord(data);

  if (Array.isArray(dataRecord.items)) return dataRecord.items;
  if (Array.isArray(dataRecord.docs)) return dataRecord.docs;
  if (Array.isArray(dataRecord.records)) return dataRecord.records;
  if (Array.isArray(dataRecord.results)) return dataRecord.results;

  if (Array.isArray(root.items)) return root.items;
  if (Array.isArray(root.docs)) return root.docs;
  if (Array.isArray(root.records)) return root.records;
  if (Array.isArray(root.results)) return root.results;

  return data ?? raw;
}

export function normalizeList(raw: unknown): ResourceRecord[] {
  const candidate = getCandidateData(raw);

  if (Array.isArray(candidate)) {
    return candidate as ResourceRecord[];
  }

  return [];
}

export function getRecordId(record: ResourceRecord): string {
  return String(record.id || record._id || "");
}

async function requestWithFallback<T>(
  method: "get" | "post" | "put" | "delete",
  endpoints: EndpointList,
  data?: unknown,
  id?: string
): Promise<T> {
  let lastError: unknown;

  for (const endpoint of endpoints) {
    const url = id ? `${endpoint}/${id}` : endpoint;

    try {
      const response = await api.request<T>({
        url,
        method,
        data,
      });

      return response.data;
    } catch (error) {
      lastError = error;

      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export async function listResource(
  endpoints: EndpointList
): Promise<ResourceRecord[]> {
  const raw = await requestWithFallback<unknown>("get", endpoints);
  return normalizeList(raw);
}

export async function createResource(
  endpoints: EndpointList,
  payload: Record<string, unknown>
): Promise<void> {
  await requestWithFallback("post", endpoints, payload);
}

export async function deleteResource(
  endpoints: EndpointList,
  id: string
): Promise<void> {
  await requestWithFallback("delete", endpoints, undefined, id);
}

export async function postAction(
  endpoints: EndpointList,
  payload?: Record<string, unknown>
): Promise<unknown> {
  return requestWithFallback("post", endpoints, payload || {});
}