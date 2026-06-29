import { ROLES, type Role } from "../../../constants/roles";
import { api } from "../../../lib/api";
import type {
  ApiResponse,
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "../../../types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeRole(value: unknown): Role {
  const role = String(value || "").toUpperCase() as Role;

  if (!Object.values(ROLES).includes(role)) {
    throw new Error("Invalid user role received from server");
  }

  return role;
}

function normalizeUser(rawUser: unknown): AuthUser {
  const user = asRecord(rawUser);

  return {
    id: String(user.id || user._id || ""),
    name: String(user.name || user.fullName || "CampusSync User"),
    email: String(user.email || ""),
    role: normalizeRole(user.role),
    departmentId: user.departmentId ? String(user.departmentId) : undefined,
  };
}

function normalizeAuthResponse(rawData: unknown): AuthResponse {
  const root = asRecord(rawData);
  const nested = asRecord(root.data);

  const token =
    root.token ||
    root.accessToken ||
    root.jwt ||
    nested.token ||
    nested.accessToken ||
    nested.jwt;

  const user = root.user || nested.user || nested;

  if (!token || typeof token !== "string") {
    throw new Error("Login response does not contain a valid token");
  }

  return {
    token,
    user: normalizeUser(user),
  };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse> | AuthResponse>(
    "/auth/login",
    payload
  );

  return normalizeAuthResponse(response.data);
}

export async function register(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse> | AuthResponse>(
    "/auth/register",
    payload
  );

  return normalizeAuthResponse(response.data);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<ApiResponse<AuthUser> | AuthUser>("/auth/me");

  const root = asRecord(response.data);
  const user = root.data || root.user || response.data;

  return normalizeUser(user);
}