const DEFAULT_TIMEZONE = "Africa/Casablanca";
const DEFAULT_RANGE_DAYS = 30;
const MAX_RANGE_DAYS = 366;
const DAY_MS = 24 * 60 * 60 * 1000;
const COMPARISONS = new Set(["previous_period", "none"]);
const GRANULARITIES = new Set(["day", "week", "month"]);
const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/;

class AdminDateRangeValidationError extends Error {
  constructor(errors) {
    super("Invalid date range");
    this.name = "AdminDateRangeValidationError";
    this.errors = errors;
  }
}

const isValidTimeZone = (timeZone) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
};

const getTimeZoneOffsetMs = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );
  return asUtc - date.getTime();
};

const parseDateTime = (value, name, timeZone) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new AdminDateRangeValidationError({ [name]: `${name} must be an ISO date-time string.` });
  }
  const normalized = value.trim();
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(normalized)) {
    const instant = new Date(normalized);
    if (Number.isNaN(instant.getTime())) {
      throw new AdminDateRangeValidationError({ [name]: `${name} must be a valid ISO date-time.` });
    }
    return instant;
  }
  const match = normalized.match(LOCAL_DATE_TIME_PATTERN);
  if (!match) {
    throw new AdminDateRangeValidationError({
      [name]: `${name} must be an ISO date-time, with an offset or interpreted in timezone.`
    });
  }
  const [, year, month, day, hour = "00", minute = "00", second = "00", millisecond = "0"] = match;
  const wallClockUtc = Date.UTC(
    Number(year), Number(month) - 1, Number(day),
    Number(hour), Number(minute), Number(second), Number(millisecond.padEnd(3, "0"))
  );
  const candidate = new Date(wallClockUtc);
  const firstOffset = getTimeZoneOffsetMs(candidate, timeZone);
  const firstPass = new Date(wallClockUtc - firstOffset);
  const secondOffset = getTimeZoneOffsetMs(firstPass, timeZone);
  const instant = new Date(wallClockUtc - secondOffset);
  if (Number.isNaN(instant.getTime())) {
    throw new AdminDateRangeValidationError({ [name]: `${name} must be a valid ISO date-time.` });
  }
  const resolvedParts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(instant);
  const resolved = Object.fromEntries(resolvedParts.map(({ type, value }) => [type, value]));
  if (
    Number(resolved.year) !== Number(year)
    || Number(resolved.month) !== Number(month)
    || Number(resolved.day) !== Number(day)
    || Number(resolved.hour) !== Number(hour)
    || Number(resolved.minute) !== Number(minute)
    || Number(resolved.second) !== Number(second)
  ) {
    throw new AdminDateRangeValidationError({ [name]: `${name} is not a valid local date-time in timezone.` });
  }
  return instant;
};

const parseAdminDateRange = (query = {}, now = new Date()) => {
  const timezone = query.timezone === undefined ? DEFAULT_TIMEZONE : String(query.timezone).trim();
  if (!isValidTimeZone(timezone)) {
    throw new AdminDateRangeValidationError({ timezone: "timezone must be a valid IANA timezone." });
  }
  const comparison = query.comparison === undefined
    ? "previous_period"
    : String(query.comparison).trim().toLowerCase();
  if (!COMPARISONS.has(comparison)) {
    throw new AdminDateRangeValidationError({ comparison: "comparison must be previous_period or none." });
  }
  const hasFrom = query.from !== undefined && query.from !== "";
  const hasTo = query.to !== undefined && query.to !== "";
  if (hasFrom !== hasTo) {
    throw new AdminDateRangeValidationError({ range: "from and to must be provided together." });
  }
  const to = hasTo ? parseDateTime(query.to, "to", timezone) : now;
  const from = hasFrom ? parseDateTime(query.from, "from", timezone) : new Date(to.getTime() - DEFAULT_RANGE_DAYS * DAY_MS);
  const durationMs = to.getTime() - from.getTime();
  if (durationMs <= 0) {
    throw new AdminDateRangeValidationError({ range: "from must be before to." });
  }
  if (durationMs > MAX_RANGE_DAYS * DAY_MS) {
    throw new AdminDateRangeValidationError({ range: `Date range must not exceed ${MAX_RANGE_DAYS} days.` });
  }
  const previousTo = new Date(from);
  const previousFrom = new Date(from.getTime() - durationMs);
  return { from, to, timezone, comparison, durationMs, previousFrom, previousTo };
};

const parseOptionalDateRange = (query = {}) => {
  const hasFrom = query.from !== undefined && query.from !== "";
  const hasTo = query.to !== undefined && query.to !== "";
  if (!hasFrom && !hasTo) return null;
  if (hasFrom !== hasTo) {
    throw new AdminDateRangeValidationError({ range: "from and to must be provided together." });
  }
  const timezone = query.timezone === undefined ? DEFAULT_TIMEZONE : String(query.timezone).trim();
  if (!isValidTimeZone(timezone)) {
    throw new AdminDateRangeValidationError({ timezone: "timezone must be a valid IANA timezone." });
  }
  const from = parseDateTime(query.from, "from", timezone);
  const to = parseDateTime(query.to, "to", timezone);
  if (from >= to) {
    throw new AdminDateRangeValidationError({ range: "from must be before to." });
  }
  return { from, to, timezone };
};

const chooseGranularity = (durationMs, requested) => {
  if (requested !== undefined && requested !== "") {
    const granularity = String(requested).trim().toLowerCase();
    if (!GRANULARITIES.has(granularity)) {
      throw new AdminDateRangeValidationError({ granularity: "granularity must be day, week, or month." });
    }
    return granularity;
  }
  const days = durationMs / DAY_MS;
  if (days <= 31) return "day";
  if (days <= 180) return "week";
  return "month";
};

const sendDateRangeValidationError = (res, error) => res.status(400).json({
  success: false,
  code: "VALIDATION_ERROR",
  message: "The date range is invalid.",
  errors: error.errors
});

module.exports = {
  DEFAULT_TIMEZONE,
  DAY_MS,
  MAX_RANGE_DAYS,
  AdminDateRangeValidationError,
  isValidTimeZone,
  parseDateTime,
  parseAdminDateRange,
  parseOptionalDateRange,
  chooseGranularity,
  sendDateRangeValidationError
};
