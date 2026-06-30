 import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import Button from "../../../components/ui/Button";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Input from "../../../components/ui/Input";
import { routes } from "../../../config/routes";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../store/auth.store";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const { isAuthenticated, loginUser, authError, clearAuthError } = useAuth();

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={routes.dashboard} replace />;
  }

  function updateField(name: keyof LoginForm, value: string) {
    clearAuthError();

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));
  }

  function validate() {
    const nextErrors: Partial<LoginForm> = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);

      await loginUser({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigate(routes.dashboard, { replace: true });
    } catch {
      // Error message is already handled by auth store.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
  eyebrow="Welcome back"
  title="Login to CampusSync AI"
  subtitle="Manage departments, faculty, rooms, course selections, and AI-generated timetables from one secure academic scheduling platform."
>
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {authError && <ErrorMessage message={authError} />}

        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="name@college.edu"
          value={form.email}
          error={errors.email}
          onChange={(event) => updateField("email", event.target.value)}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          error={errors.password}
          onChange={(event) => updateField("password", event.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Login
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New user?{" "}
        <Link
          to={routes.register}
          className="font-semibold text-orange-600 hover:text-orange-700"
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}