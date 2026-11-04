import {
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
type Shared = { label: string; hint?: string };
export function Field({
  label,
  hint,
  ...props
}: Shared & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const id = props.id || generatedId;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {props.required ? " *" : ""}
      </label>
      <input
        {...props}
        id={id}
        aria-describedby={
          [props["aria-describedby"], hint ? `${id}-hint` : ""]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function Textarea({
  label,
  hint,
  ...props
}: Shared & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generatedId = useId();
  const id = props.id || generatedId;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {props.required ? " *" : ""}
      </label>
      <textarea
        {...props}
        id={id}
        aria-describedby={
          [props["aria-describedby"], hint ? `${id}-hint` : ""]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
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
