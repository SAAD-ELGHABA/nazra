export const AUTH_USER_STORAGE_KEY = "User_Data";
export const AUTH_TOKEN_STORAGE_KEY = "User_Data_token";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_CODE_PATTERN = /^\d{8}$/;

export const normalizeEmail = (email = "") => email.trim().toLowerCase();

export const validateEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) return "Email is required.";
  if (normalizedEmail.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) {
    return "Enter a valid email address.";
  }

  return "";
};

export const validateResetCode = (code) => {
  if (!code) return "Reset code is required.";
  if (!RESET_CODE_PATTERN.test(code)) return "Enter the eight-digit reset code.";
  return "";
};

export const getUtf8ByteLength = (value = "") =>
  new TextEncoder().encode(value).length;

export const validateNewPassword = (password) => {
  if (!password) return "New password is required.";
  if (Array.from(password).length < 12) {
    return "Password must contain at least 12 characters.";
  }
  if (getUtf8ByteLength(password) > 72) {
    return "Password must be no more than 72 UTF-8 bytes.";
  }
  return "";
};

export const getRetryAfterSeconds = (error) => {
  const bodyValue = Number(error?.response?.data?.retryAfterSeconds);
  if (Number.isFinite(bodyValue) && bodyValue > 0) return Math.ceil(bodyValue);

  const headerValue = error?.response?.headers?.["retry-after"];
  const numericHeader = Number(headerValue);
  if (Number.isFinite(numericHeader) && numericHeader > 0) {
    return Math.ceil(numericHeader);
  }

  if (typeof headerValue === "string") {
    const retryDate = Date.parse(headerValue);
    if (!Number.isNaN(retryDate)) {
      return Math.max(0, Math.ceil((retryDate - Date.now()) / 1000));
    }
  }

  return 0;
};

export const clearAuthStorage = () => {
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
};

export const hasStoredAuthSession = () => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const userData = localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!token || !userData) return false;

  try {
    return Boolean(JSON.parse(userData));
  } catch {
    return false;
  }
};
