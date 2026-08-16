import { useState, type FormEvent, type CSSProperties } from 'react';
import type { SectionComponentProps } from '../../types/component';
import styles from './Form.module.css';

export type FormFieldType = 'text' | 'email' | 'tel' | 'textarea' | 'select';

export interface FormFieldConfig {
  key: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormData {
  heading?: string;
  description?: string;
  fields: FormFieldConfig[];
  endpoint?: string;
  submitLabel?: string;
  successMessage?: string;
}

export interface FormProps extends SectionComponentProps<FormData> {
  onSubmit?: (values: Record<string, string>) => Promise<void> | void;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function Form({ data, styleOverrides, onSubmit }: FormProps) {
  const {
    heading,
    description,
    fields,
    endpoint,
    submitLabel = 'Send',
    successMessage = "Thanks — we'll be in touch.",
  } = data;

  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);

    try {
      if (onSubmit) {
        await onSubmit(values);
      } else if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
      }
      setStatus('success');
      setValues({});
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <section className={styles.section} style={styleOverrides as CSSProperties}>
        <div className={styles.inner}>
          <p className={styles.success}>{successMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} style={styleOverrides as CSSProperties}>
      <div className={styles.inner}>
        {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
        {description ? <p className={styles.description}>{description}</p> : null}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {fields.map((field) => (
            <label key={field.key} className={styles.field}>
              <span className={styles.label}>
                {field.label}
                {field.required ? <span aria-hidden="true"> *</span> : null}
              </span>

              {field.type === 'textarea' ? (
                <textarea
                  className={styles.textarea}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={values[field.key] ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  rows={4}
                />
              ) : field.type === 'select' ? (
                <select
                  className={styles.input}
                  required={field.required}
                  value={values[field.key] ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                >
                  <option value="" disabled>
                    {field.placeholder ?? 'Select…'}
                  </option>
                  {(field.options ?? []).map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={styles.input}
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={values[field.key] ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}
            </label>
          ))}

          {status === 'error' && errorMessage ? (
            <p className={styles.error}>{errorMessage}</p>
          ) : null}

          <button type="submit" className={styles.submit} disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending…' : submitLabel}
          </button>
        </form>
      </div>
    </section>
  );
}