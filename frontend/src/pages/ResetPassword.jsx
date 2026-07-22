import React, { useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPasswordWithCode } from "../api/api";
import AuthShell from "../components/auth/AuthShell";
import PasswordField from "../components/auth/PasswordField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useRateLimitCountdown from "../hooks/useRateLimitCountdown";
import {
  clearAuthStorage,
  getRetryAfterSeconds,
  normalizeEmail,
  validateEmail,
  validateNewPassword,
  validateResetCode,
} from "../utils/auth";
import { FORGOT_PASSWORD, LOGIN } from "../constant/routerConstants";

const DEFAULT_CODE_SENT_MESSAGE =
  "If an account exists for this email, an eight-digit reset code has been sent.";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const errorAlertRef = useRef(null);
  const initialEmail =
    typeof location.state?.email === "string" ? location.state.email : "";

  const [form, setForm] = useState({
    email: initialEmail,
    code: "",
    password: "",
    passwordConfirmation: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useRateLimitCountdown();
  const codeWasSent = location.state?.codeSent === true;
  const codeSentMessage =
    typeof location.state?.successMessage === "string"
      ? location.state.successMessage
      : DEFAULT_CODE_SENT_MESSAGE;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    if (!isRateLimited) setRequestError("");
  };

  const focusFirstError = (errors) => {
    const fieldIds = {
      email: "reset-email",
      code: "reset-code",
      password: "new-password",
      passwordConfirmation: "confirm-password",
    };
    const firstInvalidField = Object.keys(fieldIds).find((field) => errors[field]);
    document.getElementById(fieldIds[firstInvalidField])?.focus();
  };

  const focusErrorAlert = () => {
    window.requestAnimationFrame(() => errorAlertRef.current?.focus());
  };

  const validateForm = () => {
    const errors = {
      email: validateEmail(form.email),
      code: validateResetCode(form.code),
      password: validateNewPassword(form.password),
      passwordConfirmation: form.passwordConfirmation
        ? form.passwordConfirmation === form.password
          ? ""
          : "Passwords do not match."
        : "Confirm your new password.",
    };

    setFieldErrors(errors);
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || secondsRemaining > 0) return;

    const normalizedEmail = normalizeEmail(form.email);
    setForm((current) => ({ ...current, email: normalizedEmail }));
    setRequestError("");
    setIsRateLimited(false);

    const errors = validateForm();
    errors.email = validateEmail(normalizedEmail);
    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      focusFirstError(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordWithCode({
        email: normalizedEmail,
        code: form.code,
        password: form.password,
        passwordConfirmation: form.passwordConfirmation,
      });

      setForm({
        email: "",
        code: "",
        password: "",
        passwordConfirmation: "",
      });
      clearAuthStorage();
      navigate(LOGIN, {
        replace: true,
        state: { passwordReset: true },
      });
    } catch (error) {
      const status = error?.response?.status;

      if (status === 400) {
        const responseErrors = error?.response?.data?.errors;
        const nextFieldErrors = responseErrors
          ? {
              email:
                typeof responseErrors.email === "string"
                  ? responseErrors.email
                  : "",
              code:
                typeof responseErrors.code === "string"
                  ? responseErrors.code
                  : "",
              password:
                typeof (responseErrors.password || responseErrors.newPassword) ===
                "string"
                  ? responseErrors.password || responseErrors.newPassword
                  : "",
              passwordConfirmation:
                typeof responseErrors.passwordConfirmation === "string"
                  ? responseErrors.passwordConfirmation
                  : "",
            }
          : {};

        if (Object.values(nextFieldErrors).some(Boolean)) {
          setFieldErrors((current) => ({ ...current, ...nextFieldErrors }));
          focusFirstError(nextFieldErrors);
        } else {
          const serverMessage = error?.response?.data?.message;
          setRequestError(
            serverMessage ===
              "New password must be different from the current password."
              ? serverMessage
              : "The reset code is invalid or expired."
          );
          focusErrorAlert();
        }
      } else if (status === 429) {
        setIsRateLimited(true);
        setRequestError("Too many reset attempts.");
        setSecondsRemaining(getRetryAfterSeconds(error));
        focusErrorAlert();
      } else if (!error?.response) {
        setRequestError(
          "Unable to reach the server. Check your connection and try again."
        );
        focusErrorAlert();
      } else {
        setRequestError("Something went wrong. Please try again later.");
        focusErrorAlert();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create a new password"
      description="Enter the code from your email and choose a new administrator password."
      footer={
        <div className="flex flex-col items-center gap-3">
          <Link
            to={FORGOT_PASSWORD}
            state={{ email: form.email }}
            className="font-medium text-black underline-offset-4 hover:underline"
          >
            Request another code
          </Link>
          <Link
            to={LOGIN}
            className="inline-flex items-center gap-2 font-medium text-black underline-offset-4 hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {codeWasSent ? (
          <Alert className="border-[#906941]/30 bg-[#906941]/10 text-black">
            <CheckCircle2 aria-hidden="true" />
            <AlertDescription className="text-black/75">
              {codeSentMessage}
            </AlertDescription>
          </Alert>
        ) : null}

        {requestError ? (
          <div
            ref={errorAlertRef}
            tabIndex={-1}
            className="outline-none"
          >
            <Alert variant="destructive" className="items-start">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>
                {requestError}{" "}
                {isRateLimited && secondsRemaining > 0
                  ? `Try again in ${secondsRemaining} second${secondsRemaining === 1 ? "" : "s"}.`
                  : isRateLimited
                    ? "You can try again now."
                    : ""}
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "reset-email-error" : undefined}
            className="h-11"
          />
          {fieldErrors.email ? (
            <p id="reset-email-error" className="text-sm text-destructive">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reset-code">Eight-digit reset code</Label>
          <Input
            id="reset-code"
            type="text"
            value={form.code}
            onChange={(event) =>
              updateField(
                "code",
                event.target.value.replace(/\D/g, "").slice(0, 8)
              )
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            pattern="[0-9]{8}"
            placeholder="00000000"
            aria-invalid={Boolean(fieldErrors.code)}
            aria-describedby={fieldErrors.code ? "reset-code-error" : undefined}
            className="h-11 tracking-[0.25em]"
          />
          {fieldErrors.code ? (
            <p id="reset-code-error" className="text-sm text-destructive">
              {fieldErrors.code}
            </p>
          ) : null}
        </div>

        <div>
          <PasswordField
            id="new-password"
            label="New password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            error={fieldErrors.password}
          />
        </div>

        <div>
          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            value={form.passwordConfirmation}
            onChange={(event) =>
              updateField("passwordConfirmation", event.target.value)
            }
            error={fieldErrors.passwordConfirmation}
          />
        </div>

        <p className="text-xs leading-5 text-muted-foreground">
          Use at least 12 characters. For secure password hashing, the password
          must be no more than 72 UTF-8 bytes.
        </p>

        <Button
          type="submit"
          className="h-11 w-full bg-black text-white hover:bg-black/85"
          disabled={isSubmitting || secondsRemaining > 0}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Resetting password…
            </>
          ) : secondsRemaining > 0 ? (
            `Try again in ${secondsRemaining}s`
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
