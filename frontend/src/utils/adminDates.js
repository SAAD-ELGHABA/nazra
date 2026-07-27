const ADMIN_LOCALE = "fr-MA";
const ADMIN_TIMEZONE = "Africa/Casablanca";

const dateFormatter = new Intl.DateTimeFormat(ADMIN_LOCALE, {
  timeZone: ADMIN_TIMEZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat(ADMIN_LOCALE, {
  timeZone: ADMIN_TIMEZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const relativeFormatter = new Intl.RelativeTimeFormat(ADMIN_LOCALE, {
  numeric: "auto",
});

const parseDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatAdminDate = (value) => {
  const date = parseDate(value);
  return date ? dateFormatter.format(date) : "—";
};

export const formatAdminDateTime = (value) => {
  const date = parseDate(value);
  return date ? dateTimeFormatter.format(date) : "—";
};

export const formatRelativeTime = (value) => {
  const date = parseDate(value);
  if (!date) return "—";

  const diffMs = date.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 60) return relativeFormatter.format(diffSeconds, "second");

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return relativeFormatter.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return relativeFormatter.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) return relativeFormatter.format(diffDays, "day");

  return formatAdminDate(date);
};
