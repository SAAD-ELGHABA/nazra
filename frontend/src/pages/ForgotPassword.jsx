import React, { useRef, useState } from "react";
import { AlertCircle, ArrowLeft, LoaderCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { requestPasswordResetCode } from "../api/api";
import AuthShell from "../components/auth/AuthShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useRateLimitCountdown from "../hooks/useRateLimitCountdown";
import {
  getRetryAfterSeconds,
  normalizeEmail,
  validateEmail,
} from "../utils/auth";
import { LOGIN, RESET_PASSWORD } from "../constant/routerConstants";

const GENERIC_SUCCESS_MESSAGE =
  "If an account exists for this email, an eight-digit reset code has been sent.";

export default function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const errorAlertRef = useRef(null);
  const initialEmail =
    typeof location.state?.email === "string" ? location.state.email : "";

  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useRateLimitCountdown();

  const focusErrorAlert = () => {
    window.requestAnimationFrame(() => errorAlertRef.current?.focus());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || secondsRemaining > 0) return;

    const normalizedEmail = normalizeEmail(email);
    const nextEmailError = validateEmail(normalizedEmail);
    setEmail(normalizedEmail);
    setEmailError(nextEmailError);
    setRequestError("");
    setIsRateLimited(false);

    if (nextEmailError) {
      document.getElementById("forgot-email")?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordResetCode(normalizedEmail);
      navigate(RESET_PASSWORD, {
        state: {
          email: normalizedEmail,
          codeSent: true,
          successMessage: GENERIC_SUCCESS_MESSAGE,
        },
      });
    } catch (error) {
      const status = error?.response?.status;

      if (status === 400) {
        setEmailError("Enter a valid email address.");
        document.getElementById("forgot-email")?.focus();
      } else if (status === 429) {
        setIsRateLimited(true);
        setRequestError("Too many reset-code requests.");
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
      title="Forgot your password?"
      description="Enter your administrator email and we’ll send you a secure reset code."
      footer={
        <Link
          to={LOGIN}
          className="inline-flex items-center gap-2 font-medium text-black underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError("");
              if (!isRateLimited) setRequestError("");
            }}
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            placeholder="admin@example.com"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "forgot-email-error" : undefined}
            className="h-11"
          />
          {emailError ? (
            <p id="forgot-email-error" className="text-sm text-destructive">
              {emailError}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-black text-white hover:bg-black/85"
          disabled={isSubmitting || secondsRemaining > 0}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Sending code…
            </>
          ) : secondsRemaining > 0 ? (
            `Try again in ${secondsRemaining}s`
          ) : (
            "Send reset code"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
