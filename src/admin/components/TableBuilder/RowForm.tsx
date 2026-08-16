import { useEffect, useState } from 'react';
import type { CustomRow, FieldDef, RowData, TableDef } from '../../../shared/types/tables';
import { createRow, listRows, updateRow } from '../../routes/db-management/api';
import { uploadToCloudinary } from '../../../shared/api/media';
import styles from './RowForm.module.css';

interface RowFormProps {
  table: TableDef;
  initialRow?: CustomRow | null;
  onSaved: (row: CustomRow) => void;
  onCancel: () => void;
}

export default function RowForm({ table, initialRow, onSaved, onCancel }: RowFormProps) {
  const isEditing = Boolean(initialRow);
  const [data, setData] = useState<RowData>(initialRow?.data ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedFields = table.fields.slice().sort((a, b) => a.order - b.order);

  function setValue(key: string, value: unknown) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const missing = sortedFields.filter((f) => f.isRequired && isEmpty(data[f.key]));
    if (missing.length > 0) {
      setError(`Missing required field${missing.length > 1 ? 's' : ''}: ${missing.map((f) => f.label).join(', ')}`);
      return;
    }

    setSaving(true);
    try {
      const saved =
        isEditing && initialRow
          ? await updateRow(table.id, initialRow.id, data)
          : await createRow(table.id, data);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this row.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {sortedFields.map((field) => (
        <div key={field.id} className={styles.fieldBlock}>
          <label className={styles.label}>
            {field.label}
            {field.isRequired && <span className={styles.required}> *</span>}
          </label>
          <FieldInput field={field} value={data[field.key]} onChange={(v) => setValue(field.key, v)} />
        </div>
      ))}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Cancel
        </button>
        <button type="submit" className={styles.saveButton} disabled={saving}>
          {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create row'}
        </button>
      </div>
    </form>
  );
}

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === '';
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case 'text':
      return (
        <input
          className={styles.input}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'richtext':
      return (
        <textarea
          className={styles.textarea}
          rows={6}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          className={styles.input}
          value={(value as number) ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
      );

    case 'price': {
      const price = (value as { etb?: number; usd?: number } | undefined) ?? {};
      return (
        <div className={styles.priceRow}>
          <label className={styles.priceInput}>
            <span>ETB</span>
            <input
              type="number"
              value={price.etb ?? ''}
              onChange={(e) =>
                onChange({ ...price, etb: e.target.value === '' ? undefined : Number(e.target.value) })
              }
            />
          </label>
          <label className={styles.priceInput}>
            <span>USD</span>
            <input
              type="number"
              value={price.usd ?? ''}
              onChange={(e) =>
                onChange({ ...price, usd: e.target.value === '' ? undefined : Number(e.target.value) })
              }
            />
          </label>
        </div>
      );
    }

    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          className={styles.input}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'select': {
      const choices = field.options?.choices ?? [];
      return (
        <select
          className={styles.input}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {choices.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      );
    }

    case 'image':
      return <ImageField value={value as string | undefined} onChange={onChange} multiple={false} />;

    case 'gallery':
      return (
        <ImageField
          value={(value as string[] | undefined) ?? []}
          onChange={onChange}
          multiple
        />
      );

    case 'relation':
      return (
        <RelationField
          targetTableId={field.options?.targetTableId}
          value={value as string | undefined}
          onChange={onChange}
        />
      );

    default:
      return (
        <input
          className={styles.input}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function ImageField({
  value,
  onChange,
  multiple,
}: {
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  multiple: boolean;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map((f) => uploadToCloudinary(f)));
      if (multiple) {
        const existing = (value as string[]) ?? [];
        onChange([...existing, ...urls]);
      } else {
        onChange(urls[0]);
      }
    } finally {
      setUploading(false);
    }
  }

  if (multiple) {
    const urls = (value as string[]) ?? [];
    return (
      <div className={styles.gallery}>
        <div className={styles.galleryGrid}>
          {urls.map((url, idx) => (
            <div key={idx} className={styles.galleryItem}>
              <img src={url} alt="" />
              <button
                type="button"
                onClick={() => onChange(urls.filter((_, i) => i !== idx))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} />
        {uploading && <span className={styles.uploading}>Uploading…</span>}
      </div>
    );
  }

  const url = value as string | undefined;
  return (
    <div className={styles.imagePicker}>
      {url && <img src={url} alt="" className={styles.imagePreview} />}
      <input type="file" accept="image/*" onChange={(e) => handleFiles(e.target.files)} />
      {uploading && <span className={styles.uploading}>Uploading…</span>}
    </div>
  );
}

function RelationField({
  targetTableId,
  value,
  onChange,
}: {
  targetTableId: string | undefined;
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<CustomRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!targetTableId) return;
    let cancelled = false;
    setLoading(true);
    listRows(targetTableId, 1, 50)
      .then((res) => {
        if (!cancelled) setOptions(res.rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetTableId]);

  if (!targetTableId) {
    return <p className={styles.hint}>No target table configured for this field.</p>;
  }

  const filtered = options.filter((row) => {
    const label = rowPreviewLabel(row);
    return label.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className={styles.relationField}>
      <input
        className={styles.input}
        placeholder="Search…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading ? (
        <p className={styles.hint}>Loading…</p>
      ) : (
        <select
          className={styles.input}
          size={Math.min(6, Math.max(3, filtered.length))}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {filtered.map((row) => (
            <option key={row.id} value={row.id}>
              {rowPreviewLabel(row)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function rowPreviewLabel(row: CustomRow): string {
  const data = row.data as Record<string, unknown>;
  const candidate = data.name ?? data.title ?? data.label ?? row.id;
  return String(candidate);
}
