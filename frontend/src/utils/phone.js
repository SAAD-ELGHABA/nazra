/**
 * Moroccan phone validation for the checkout form.
 *
 * Mirrors `backend/utils/moroccanPhone.js`. The server remains the authority —
 * this exists so the customer is told about a typo before submitting, not
 * after a round trip. Keep the two in step.
 */

const PHONE_INPUT_PATTERN = /^[0-9+\s().-]+$/;
const MAX_RAW_PHONE_LENGTH = 30;

export const normalizePhone = (value) => {
  const compact = String(value).normalize("NFKC").trim().replace(/[\s().-]/g, "");
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  if (/^212[5-8]\d{8}$/.test(compact)) return `+${compact}`;
  if (/^0[5-8]\d{8}$/.test(compact)) return `+212${compact.slice(1)}`;
  return compact;
};

export const isValidInternationalPhone = (value) => /^\+[1-9]\d{7,14}$/.test(value);

/** Canonical E.164 number, or null when the input cannot be a phone number. */
export const parsePhone = (value) => {
  if (typeof value !== "string") return null;

  const raw = value.normalize("NFKC").trim();
  if (!raw || raw.length > MAX_RAW_PHONE_LENGTH) return null;
  if (!PHONE_INPUT_PATTERN.test(raw)) return null;

  const normalized = normalizePhone(raw);
  return isValidInternationalPhone(normalized) ? normalized : null;
};

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
