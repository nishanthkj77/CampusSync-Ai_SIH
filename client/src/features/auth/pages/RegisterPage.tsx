import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import Button from "../../../components/ui/Button";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Input from "../../../components/ui/Input";
import { routes } from "../../../config/routes";
import { ROLES, type Role } from "../../../constants/roles";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../store/auth.store";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, registerUser, authError, clearAuthError } =
    useAuth();

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ROLES.STUDENT,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={routes.dashboard} replace />;
  }

  function updateField(name: keyof RegisterForm, value: string) {
    clearAuthError();
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof RegisterForm, string>> = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (!Object.values(ROLES).includes(form.role)) {
      nextErrors.role = "Select a valid role";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);

      await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });

      navigate(routes.dashboard, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Account setup"
      title="Register for CampusSync AI"
      subtitle="Create an account for a valid academic role. Backend authorization will control final access."
    >
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {authError && <ErrorMessage message={authError} />}

        <Input
          label="Full name"
          name="name"
          placeholder="Enter full name"
          value={form.name}
          error={errors.name}
          onChange={(event) => updateField("name", event.target.value)}
        />

        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="name@college.edu"
          value={form.email}
          error={errors.email}
          onChange={(event) => updateField("email", event.target.value)}
        />

        <div>
          <label htmlFor="role" className="text-sm font-semibold text-slate-700">
            Role
          </label>

          <select
            id="role"
            value={form.role}
            onChange={(event) => updateField("role", event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value={ROLES.STUDENT}>Student</option>
            <option value={ROLES.FACULTY}>Faculty</option>
            <option value={ROLES.HOD}>HOD</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>

          {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            error={errors.password}
            onChange={(event) => updateField("password", event.target.value)}
          />

          <Input
            label="Confirm"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) =>
              updateField("confirmPassword", event.target.value)
            }
          />
        </div>

        <Button type="submit" variant="ai" size="lg" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link
          to={routes.login}
          className="font-semibold text-blue-700 hover:text-blue-800"
        >
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}