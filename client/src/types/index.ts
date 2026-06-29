import type { Role } from "../constants/roles";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}