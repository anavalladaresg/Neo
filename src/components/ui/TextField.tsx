import { useId, type InputHTMLAttributes } from "react";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  error?: string;
  hint?: string;
  label: string;
}

export function TextField({ error, hint, label, ...props }: TextFieldProps) {
  const inputId = useId();
  const descriptionId = error || hint ? `${inputId}-description` : undefined;

  return (
    <div className="text-field">
      <label htmlFor={inputId}>{label}</label>
      <input
        {...props}
        aria-describedby={descriptionId}
        aria-invalid={error ? true : undefined}
        className={error ? "text-field__input text-field__input--error" : "text-field__input"}
        id={inputId}
      />
      {error ? (
        <p
          className="text-field__message text-field__message--error"
          id={descriptionId}
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="text-field__message" id={descriptionId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
