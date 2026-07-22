import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loginAdmin } from "../api/api";
import AuthShell from "../components/auth/AuthShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  normalizeEmail,
  validateEmail,
} from "../utils/auth";
import {
  DASHBOARDHOME,
  FORGOT_PASSWORD,
  LOGIN,
} from "../constant/routerConstants";

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const errorAlertRef = useRef(null);
  const [showResetSuccess] = useState(location.state?.passwordReset === true);
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.passwordReset) {
      navigate(LOGIN, { replace: true, state: null });
    }
  }, [location.state, navigate]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setRequestError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const email = normalizeEmail(form.email);
    const errors = {
      email: validateEmail(email),
      password: form.password ? "" : "Password is required.",
    };

    setForm((current) => ({ ...current, email }));
    setFieldErrors(errors);
    setRequestError("");

    if (errors.email) {
      document.getElementById("login-email")?.focus();
      return;
    }
    if (errors.password) {
      document.getElementById("login-password")?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await loginAdmin({ email, password: form.password });
      const token = response?.data?.token;

      if (response.status !== 200 || !token) {
        setRequestError("The server returned an unexpected response.");
        window.requestAnimationFrame(() => errorAlertRef.current?.focus());
        return;
      }

      const storedUser = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      };
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(storedUser));
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      toast.success("Welcome back to your dashboard account.");
      navigate(DASHBOARDHOME);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        setRequestError("Invalid email or password.");
      } else if (status === 400) {
        const responseErrors = error?.response?.data?.errors;
        const nextFieldErrors = {
          email:
            typeof responseErrors?.email === "string"
              ? responseErrors.email
              : "",
          password:
            typeof responseErrors?.password === "string"
              ? responseErrors.password
              : "",
        };

        if (Object.values(nextFieldErrors).some(Boolean)) {
          setFieldErrors(nextFieldErrors);
          const firstField = nextFieldErrors.email
            ? "login-email"
            : "login-password";
          document.getElementById(firstField)?.focus();
          return;
        }
        setRequestError("Check your email and password, then try again.");
      } else if (status === 429) {
        setRequestError("Too many sign-in attempts. Please try again later.");
      } else if (!error?.response) {
        setRequestError(
          "Unable to reach the server. Check your connection and try again."
        );
      } else {
        setRequestError("Something went wrong. Please try again later.");
      }
      window.requestAnimationFrame(() => errorAlertRef.current?.focus());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Administrator sign in"
      description="Sign in securely to manage the NAZRA dashboard."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {showResetSuccess ? (
          <Alert className="border-[#906941]/30 bg-[#906941]/10 text-black">
            <CheckCircle2 aria-hidden="true" />
            <AlertDescription className="text-black/75">
              Password reset successfully. Sign in with your new password.
            </AlertDescription>
          </Alert>
        ) : null}

        {requestError ? (
          <div ref={errorAlertRef} tabIndex={-1} className="outline-none">
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{requestError}</AlertDescription>
            </Alert>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            placeholder="admin@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            className="h-11"
          />
          {fieldErrors.email ? (
            <p id="login-email-error" className="text-sm text-destructive">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="login-password">Password</Label>
            <Link
              to={FORGOT_PASSWORD}
              state={{ email: form.email }}
              className="text-sm font-medium text-black underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="login-password"
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            autoComplete="current-password"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "login-password-error" : undefined
            }
            className="h-11"
          />
          {fieldErrors.password ? (
            <p id="login-password-error" className="text-sm text-destructive">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-black text-white hover:bg-black/85"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
