import { useId } from "react";

export function Field({
  label,
  name,
  error,
  hint,
  optional,
  children,
  ...input
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children?: (props: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "children">) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children ? (
        children({ id, describedBy, invalid: Boolean(error) })
      ) : (
        <input
          id={id}
          name={name}
          className="field-input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          required={!optional}
          {...input}
        />
      )}
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="border border-error/40 border-l-4 border-l-error bg-paper px-4 py-3 text-forest">
      {message}
    </div>
  );
}
