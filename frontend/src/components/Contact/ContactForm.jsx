import React, { useRef, useState } from "react";
import { CircleCheck, LoaderCircle, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { submitContactMessage } from "../../api/api";

const SUBJECT_KEYS = ["order", "shipping", "returns", "product", "payment", "partnership", "press", "other"];
const INITIAL_VALUES = { name: "", email: "", phone: "", subject: "", message: "", website: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOROCCAN_PHONE_PATTERN = /^(?:\+?212|0)[5-7]\d{8}$/;

function validate(values, t) {
  const errors = {};
  const name = values.name.trim();
  const phone = values.phone.replace(/[\s().-]/g, "");
  const message = values.message.trim();

  if (!name) errors.name = t("contactPage.form.errors.required");
  else if (name.length < 2 || name.length > 80) errors.name = t("contactPage.form.errors.nameLength");

  if (!values.email.trim()) errors.email = t("contactPage.form.errors.required");
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = t("contactPage.form.errors.email");

  if (phone && !MOROCCAN_PHONE_PATTERN.test(phone)) errors.phone = t("contactPage.form.errors.phone");
  if (!SUBJECT_KEYS.includes(values.subject)) errors.subject = t("contactPage.form.errors.subject");

  if (!message) errors.message = t("contactPage.form.errors.required");
  else if (message.length < 20 || message.length > 2000) errors.message = t("contactPage.form.errors.messageLength");

  return errors;
}

function getApiFieldErrors(error, t) {
  const source = error?.response?.data?.errors;
  if (!source) return {};
  const translatedError = (field) => {
    const keyByField = { name: "nameLength", email: "email", phone: "phone", subject: "subject", message: "messageLength" };
    return keyByField[field] ? t(`contactPage.form.errors.${keyByField[field]}`) : null;
  };
  if (Array.isArray(source)) {
    return source.reduce((result, item) => {
      const field = item?.field || item?.path;
      const message = translatedError(field);
      if (message) result[field] = message;
      return result;
    }, {});
  }
  return Object.fromEntries(Object.keys(source).map((field) => [field, translatedError(field)]).filter(([, message]) => message));
}

function FieldError({ id, children }) {
  if (!children) return null;
  return <p id={id} className="mt-1 text-[11px] text-red-700">{children}</p>;
}

export default function ContactForm() {
  const { t } = useTranslation();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const submissionLock = useRef(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
    if (status !== "idle" && status !== "sending") setStatus("idle");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submissionLock.current) return;

    const nextErrors = validate(values, t);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus("validation");
      const firstInvalidField = Object.keys(nextErrors)[0];
      requestAnimationFrame(() => document.getElementById(`contact-${firstInvalidField}`)?.focus());
      return;
    }

    submissionLock.current = true;
    setStatus("sending");
    try {
      await submitContactMessage({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        subject: values.subject,
        message: values.message.trim(),
        website: values.website,
      });
      setValues(INITIAL_VALUES);
      setErrors({});
      setStatus("success");
    } catch (error) {
      const apiErrors = getApiFieldErrors(error, t);
      if (Object.keys(apiErrors).length) setErrors(apiErrors);
      setStatus(error?.response?.status === 429 ? "rateLimited" : "error");
    } finally {
      submissionLock.current = false;
    }
  };

  const fieldClass = "min-h-10 w-full border border-stone-200 bg-[#f7f3ec] px-3 text-xs text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#9a6e3b] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";
  const pending = status === "sending";

  return (
    <section className="border border-stone-200 bg-white p-4 shadow-[0_8px_28px_rgba(52,37,18,.04)] sm:p-5" aria-labelledby="contact-form-title">
      <h2 id="contact-form-title" className="flex items-center gap-2 font-display text-base font-semibold">
        <Mail size={18} className="text-[#9a6e3b]" aria-hidden="true" /> {t("contactPage.form.title")}
      </h2>
      <form className="mt-4" onSubmit={submit} noValidate>
        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-1 block text-[11px] font-medium">{t("contactPage.form.name")} <span aria-hidden="true" className="text-[#9a6e3b]">*</span></label>
            <input id="contact-name" name="name" autoComplete="name" value={values.name} onChange={updateField} disabled={pending} maxLength="80" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} placeholder={t("contactPage.form.namePlaceholder")} className={fieldClass} />
            <FieldError id="contact-name-error">{errors.name}</FieldError>
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1 block text-[11px] font-medium">{t("contactPage.form.email")} <span aria-hidden="true" className="text-[#9a6e3b]">*</span></label>
            <input id="contact-email" name="email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={updateField} disabled={pending} maxLength="254" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "contact-email-error" : undefined} placeholder={t("contactPage.form.emailPlaceholder")} className={fieldClass} />
            <FieldError id="contact-email-error">{errors.email}</FieldError>
          </div>
          <div>
            <label htmlFor="contact-phone" className="mb-1 block text-[11px] font-medium">{t("contactPage.form.phone")}</label>
            <input id="contact-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={updateField} disabled={pending} maxLength="30" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "contact-phone-error" : "contact-phone-help"} placeholder={t("contactPage.form.phonePlaceholder")} className={fieldClass} />
            <p id="contact-phone-help" className="sr-only">{t("contactPage.form.phoneHelp")}</p>
            <FieldError id="contact-phone-error">{errors.phone}</FieldError>
          </div>
          <div>
            <label htmlFor="contact-subject" className="mb-1 block text-[11px] font-medium">{t("contactPage.form.subject")} <span aria-hidden="true" className="text-[#9a6e3b]">*</span></label>
            <select id="contact-subject" name="subject" value={values.subject} onChange={updateField} disabled={pending} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? "contact-subject-error" : undefined} className={fieldClass}>
              <option value="">{t("contactPage.form.subjectPlaceholder")}</option>
              {SUBJECT_KEYS.map((key) => <option key={key} value={key}>{t(`contactPage.form.subjects.${key}`)}</option>)}
            </select>
            <FieldError id="contact-subject-error">{errors.subject}</FieldError>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="contact-message" className="mb-1 block text-[11px] font-medium">{t("contactPage.form.message")} <span aria-hidden="true" className="text-[#9a6e3b]">*</span></label>
            <textarea id="contact-message" name="message" rows="4" value={values.message} onChange={updateField} disabled={pending} maxLength="2000" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "contact-message-error" : "contact-message-count"} placeholder={t("contactPage.form.messagePlaceholder")} className={`${fieldClass} min-h-24 resize-y py-3`} />
            <div className="flex justify-between gap-3"><FieldError id="contact-message-error">{errors.message}</FieldError><p id="contact-message-count" className="ms-auto mt-1 text-[10px] text-stone-400">{values.message.length}/2000</p></div>
          </div>
        </div>

        <div className="absolute -start-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" name="website" value={values.website} onChange={updateField} tabIndex="-1" autoComplete="off" />
        </div>

        <button type="submit" disabled={pending} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 bg-black px-5 text-[10px] font-bold uppercase tracking-[.08em] text-white transition hover:bg-[#9a6e3b] disabled:cursor-wait disabled:opacity-60">
          {pending ? <><LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> {t("contactPage.form.sending")}</> : t("contactPage.form.submit")}
        </button>

        <div className="mt-3 min-h-5 text-xs" aria-live="polite">
          {status === "success" && <p className="flex items-start gap-2 text-emerald-700"><CircleCheck size={16} className="mt-px shrink-0" aria-hidden="true" /> {t("contactPage.form.success")}</p>}
          {status === "error" && <p role="alert" className="text-red-700">{t("contactPage.form.serverError")}</p>}
          {status === "rateLimited" && <p role="alert" className="text-red-700">{t("contactPage.form.rateLimited")}</p>}
          {status === "validation" && <p role="alert" className="text-red-700">{t("contactPage.form.validationSummary")}</p>}
        </div>
      </form>
    </section>
  );
}
