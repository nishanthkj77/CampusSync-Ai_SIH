 import axios from "axios";
import { env } from "../config/env";
import { storage } from "./storage";

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.removeToken();
    }

    return Promise.reject(error);
  }
);

function formatErrorDetails(errors: unknown): string {
  if (!errors) return "";

  if (typeof errors === "string") {
    return errors;
  }

  if (Array.isArray(errors)) {
    return errors.map(String).join(", ");
  }

  if (typeof errors === "object") {
    return Object.entries(errors as Record<string, unknown>)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.map(String).join(", ")}`;
        }

        return `${key}: ${String(value)}`;
      })
      .join(" | ");
  }

  return "";
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | {
          message?: string;
          error?: string;
          errors?: unknown;
        }
      | undefined;

    const message =
      responseData?.message ||
      responseData?.error ||
      error.message ||
      "Request failed. Please try again.";

    const details = formatErrorDetails(responseData?.errors);

    return details ? `${message}: ${details}` : message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}