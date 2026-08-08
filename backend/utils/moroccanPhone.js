/**
 * Moroccan phone normalisation, shared by the contact form and checkout.
 *
 * Cash on delivery lives or dies on phone quality: a courier who cannot reach
 * the customer returns the parcel and the sale is lost, so an unreachable
 * number costs more than a rejected order.
 *
 * Accepts the forms customers actually type — `0612345678`, `06 12 34 56 78`,
 * `+212612345678`, `00212612345678`, `212-612-345-678` — and produces a single
 * canonical E.164 string.
 */

/**
 * Characters a phone number may legitimately contain. An allowlist rather than
 * a control-character denylist: anything unexpected, including control
 * characters and RTL marks, simply fails to match.
 */
const PHONE_INPUT_PATTERN = /^[0-9+\s().-]+$/;

/** Longest raw input worth considering; anything beyond this is not a number. */
const MAX_RAW_PHONE_LENGTH = 30;

/**
 * Collapses formatting and converts a recognised Moroccan number to E.164.
 * Unrecognised input is returned compacted rather than rejected here, so the
 * caller decides what counts as valid.
 */
const normalizePhone = (value) => {
  const compact = String(value).normalize("NFKC").trim().replace(/[\s().-]/g, "");
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  if (/^212[5-8]\d{8}$/.test(compact)) return `+${compact}`;
  if (/^0[5-8]\d{8}$/.test(compact)) return `+212${compact.slice(1)}`;
  return compact;
};

/** E.164: a leading +, a non-zero country digit, then 7 to 14 more digits. */
const isValidInternationalPhone = (value) => /^\+[1-9]\d{7,14}$/.test(value);

/**
 * Normalises and validates in one step.
 * Returns the canonical number, or null when the input cannot be a phone.
 */
const parsePhone = (value) => {
  if (typeof value !== "string") return null;

  const raw = value.normalize("NFKC").trim();
  if (!raw || raw.length > MAX_RAW_PHONE_LENGTH) return null;
  if (!PHONE_INPUT_PATTERN.test(raw)) return null;

  const normalized = normalizePhone(raw);
  return isValidInternationalPhone(normalized) ? normalized : null;
};

module.exports = {
  MAX_RAW_PHONE_LENGTH,
  PHONE_INPUT_PATTERN,
  isValidInternationalPhone,
  normalizePhone,
  parsePhone,
};
