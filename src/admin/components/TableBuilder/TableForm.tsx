import { useState } from 'react';
import type { FieldDefDraft, FieldOptions, FieldType, TableDef } from '../../../shared/types/tables';
import { createTable, updateTable, type TableDefInput } from '../../routes/db-management/api';
import styles from './TableForm.module.css';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'richtext', label: 'Rich text' },
  { value: 'number', label: 'Number' },
  { value: 'price', label: 'Price' },
  { value: 'image', label: 'Image' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'relation', label: 'Relation' },
];

let tempIdCounter = 0;
function tempId() {
  tempIdCounter += 1;
  return `tmp_${Date.now()}_${tempIdCounter}`;
}

function emptyField(order: number): FieldDefDraft {
  return {
    id: tempId(),
    key: '',
    label: '',
    type: 'text',
    isRequired: false,
    options: null,
    order,
    isNewField: true,
  };
}

interface TableFormProps {
  initialTable?: TableDef | null;
  existingTables: TableDef[];
  onSaved: (table: TableDef) => void;
  onCancel: () => void;
}

export default function TableForm({ initialTable, existingTables, onSaved, onCancel }: TableFormProps) {
  const isEditing = Boolean(initialTable);

  const [name, setName] = useState(initialTable?.name ?? '');
  const [label, setLabel] = useState(initialTable?.label ?? '');
  const [category, setCategory] = useState(initialTable?.category ?? '');
  const [isCommerce, setIsCommerce] = useState(initialTable?.isCommerce ?? false);
  const [fields, setFields] = useState<FieldDefDraft[]>(
    initialTable
      ? initialTable.fields
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((f) => ({ ...f, isNewField: false }))
      : [emptyField(0)]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(id: string, patch: Partial<FieldDefDraft>) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function addField() {
    setFields((prev) => [...prev, emptyField(prev.length)]);
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id).map((f, idx) => ({ ...f, order: idx })));
  }

  function moveField(id: string, direction: -1 | 1) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      const targetIdx = idx + direction;
      if (idx === -1 || targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = prev.slice();
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next.map((f, i) => ({ ...f, order: i }));
    });
  }

  function updateFieldOptions(id: string, patch: Partial<FieldOptions>) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, options: { ...(f.options ?? {}), ...patch } } : f))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !label.trim()) {
      setError('Name and label are required.');
      return;
    }
    if (fields.some((f) => !f.key.trim() || !f.label.trim())) {
      setError('Every field needs a key and a label.');
      return;
    }

    const input: TableDefInput = {
      name: name.trim(),
      label: label.trim(),
      category: category.trim() || 'Uncategorized',
      isCommerce,
      fields: fields.map((f) => ({
        id: f.isNewField ? undefined : f.id,
        key: f.key.trim(),
        label: f.label.trim(),
        type: f.type,
        isRequired: f.isRequired,
        options: f.options,
        order: f.order,
      })),
    };

    setSaving(true);
    try {
      const saved = isEditing && initialTable
        ? await updateTable(initialTable.id, input)
        : await createTable(input);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this table.');
    } finally {
      setSaving(false);
    }
  }

  const relationTargets = existingTables.filter((t) => t.id !== initialTable?.id);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Name (slug)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="products"
            disabled={isEditing}
          />
        </label>
        <label className={styles.field}>
          <span>Label</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Products" />
        </label>
        <label className={styles.field}>
          <span>Category</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Catalog"
          />
        </label>
        <label className={styles.checkboxField}>
          <input
            type="checkbox"
            checked={isCommerce}
            onChange={(e) => setIsCommerce(e.target.checked)}
          />
          <span>Sellable (is_commerce)</span>
        </label>
      </div>

      <div className={styles.fieldsSection}>
        <div className={styles.fieldsHeader}>
          <h3>Fields</h3>
          <button type="button" className={styles.addFieldButton} onClick={addField}>
            + Add field
          </button>
        </div>

        {fields.map((field, idx) => (
          <div key={field.id} className={styles.fieldRow}>
            <div className={styles.fieldRowMain}>
              <input
                className={styles.fieldKeyInput}
                value={field.key}
                onChange={(e) => updateField(field.id, { key: e.target.value })}
                placeholder="key"
              />
              <input
                className={styles.fieldLabelInput}
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                placeholder="Label"
              />
              <select
                value={field.type}
                onChange={(e) => updateField(field.id, { type: e.target.value as FieldType, options: null })}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <label className={styles.requiredToggle}>
                <input
                  type="checkbox"
                  checked={field.isRequired}
                  onChange={(e) => updateField(field.id, { isRequired: e.target.checked })}
                />
                Required
              </label>
              <div className={styles.fieldRowActions}>
                <button type="button" disabled={idx === 0} onClick={() => moveField(field.id, -1)}>
                  ↑
                </button>
                <button
                  type="button"
                  disabled={idx === fields.length - 1}
                  onClick={() => moveField(field.id, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={styles.removeFieldButton}
                  onClick={() => removeField(field.id)}
                >
                  Remove
                </button>
              </div>
            </div>

            {field.type === 'select' && (
              <div className={styles.fieldOptions}>
                <span className={styles.fieldOptionsLabel}>Options</span>
                <SelectOptionsEditor
                  choices={field.options?.choices ?? []}
                  onChange={(choices) => updateFieldOptions(field.id, { choices })}
                />
              </div>
            )}

            {field.type === 'relation' && (
              <div className={styles.fieldOptions}>
                <span className={styles.fieldOptionsLabel}>Target table</span>
                <select
                  value={field.options?.targetTableId ?? ''}
                  onChange={(e) => updateFieldOptions(field.id, { targetTableId: e.target.value })}
                >
                  <option value="">Select a table…</option>
                  {relationTargets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Cancel
        </button>
        <button type="submit" className={styles.saveButton} disabled={saving}>
          {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create table'}
        </button>
      </div>
    </form>
  );
}

function SelectOptionsEditor({
  choices,
  onChange,
}: {
  choices: { value: string; label: string }[];
  onChange: (choices: { value: string; label: string }[]) => void;
}) {
  function update(idx: number, patch: Partial<{ value: string; label: string }>) {
    onChange(choices.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }
  function add() {
    onChange([...choices, { value: '', label: '' }]);
  }
  function remove(idx: number) {
    onChange(choices.filter((_, i) => i !== idx));
  }

  return (
    <div className={styles.optionsEditor}>
      {choices.map((choice, idx) => (
        <div key={idx} className={styles.optionRow}>
          <input
            placeholder="value"
            value={choice.value}
            onChange={(e) => update(idx, { value: e.target.value })}
          />
          <input
            placeholder="Label"
            value={choice.label}
            onChange={(e) => update(idx, { label: e.target.value })}
          />
          <button type="button" onClick={() => remove(idx)}>
            ✕
          </button>
        </div>
      ))}
      <button type="button" className={styles.addOptionButton} onClick={add}>
        + Add option
      </button>
    </div>
  );
}
