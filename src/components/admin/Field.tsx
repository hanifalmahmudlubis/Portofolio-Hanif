import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
type Shared = { label: string; hint?: string };
export function Field({
  label,
  hint,
  ...props
}: Shared & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field">
      {label}
      {props.required ? " *" : ""}
      <input {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Textarea({
  label,
  hint,
  ...props
}: Shared & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="field">
      {label}
      {props.required ? " *" : ""}
      <textarea {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-panel">
      <h2 className="text-base font-medium">{title}</h2>
      {description && (
        <p className="muted mt-2 text-xs leading-6">{description}</p>
      )}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}
