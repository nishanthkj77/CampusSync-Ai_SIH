export const USER_ROLES = {
  STUDENT: "STUDENT",
  FACULTY: "FACULTY",
  HOD: "HOD",
  ADMIN: "ADMIN"
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
