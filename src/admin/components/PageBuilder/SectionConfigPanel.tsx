import  { useEffect, useMemo, useState } from 'react';
import { componentRegistry } from '../../../shared/componentLibrary/registry';
import { fetchTables } from './api';
import type { CustomTableDef, DataBinding, PageSection, StyleOverrides } from './types';
import styles from './PageBuilder.module.css';

interface SectionConfigPanelProps {
  section: PageSection;
  onSave: (patch: { dataBinding?: DataBinding | null; styleOverrides?: StyleOverrides | null }) => void;
  onClose: () => void;
}

// Theme-token-backed choices — kept in lockstep with src/shared/theme/tokens.ts (F1).
// If tokens.ts adds/renames scale values, update this list to match.
const BACKGROUND_OPTIONS = [
  { label: 'None', value: '' },
  { label: 'White', value: 'var(--color-white, #fff)' },
  { label: 'Black', value: 'var(--color-black, #000)' },
  { label: 'Gray 100', value: 'var(--color-gray-100, #f5f5f5)' },
];
const SPACING_OPTIONS = [
  { label: 'None', value: '' },
  { label: 'Small', value: 'var(--space-sm, 16px)' },
  { label: 'Medium', value: 'var(--space-md, 32px)' },
  { label: 'Large', value: 'var(--space-lg, 64px)' },
  { label: 'Extra large', value: 'var(--space-xl, 96px)' },
];
const TEXT_ALIGN_OPTIONS: Array<StyleOverrides['textAlign']> = ['left', 'center', 'right'];

/**
 * Derives the field slots a component expects for its `data` prop from the shape of its
 * registered previewProps — this is the closest thing we have to a machine-readable version
 * of the "expected data shape" comment each component file documents (F3).
 */
function expectedDataKeys(previewProps: unknown): string[] {
  if (previewProps && typeof previewProps === 'object' && !Array.isArray(previewProps)) {
    return Object.keys(previewProps as Record<string, unknown>);
  }
  return [];
}

export function SectionConfigPanel({ section, onSave, onClose }: SectionConfigPanelProps) {
  const registryEntry = componentRegistry[section.componentInstance.componentKey];
  const dataKeys = useMemo(() => expectedDataKeys(registryEntry?.previewProps), [registryEntry]);

  const [tables, setTables] = useState<CustomTableDef[]>([]);
  const [binding, setBinding] = useState<DataBinding | null>(section.componentInstance.dataBinding);
  const [styleOverrides, setStyleOverrides] = useState<StyleOverrides>(
    section.componentInstance.styleOverrides ?? {}
  );

  useEffect(() => {
    setBinding(section.componentInstance.dataBinding);
    setStyleOverrides(section.componentInstance.styleOverrides ?? {});
  }, [section.id]);

  useEffect(() => {
    fetchTables().then(setTables).catch(() => setTables([]));
  }, []);

  const selectedTable = tables.find((t) => t.id === binding?.tableId) ?? null;

  function updateBinding(patch: Partial<DataBinding>) {
    setBinding((current) => ({
      tableId: current?.tableId ?? '',
      mode: current?.mode ?? 'single',
      rowId: current?.rowId ?? null,
      filter: current?.filter ?? null,
      fieldMap: current?.fieldMap ?? {},
      ...patch,
    }));
  }

  function handleBindToTable(tableId: string) {
    if (!tableId) {
      setBinding(null);
      return;
    }
    updateBinding({ tableId });
  }

  function handleFieldMapChange(dataKey: string, fieldKey: string) {
    updateBinding({ fieldMap: { ...(binding?.fieldMap ?? {}), [dataKey]: fieldKey } });
  }

  function handleSave() {
    onSave({ dataBinding: binding, styleOverrides });
  }

  return (
    <aside className={styles.configPanel} aria-label="Section settings">
      <div className={styles.configPanelHeader}>
        <h2 className={styles.panelTitle}>{registryEntry?.label ?? section.componentInstance.componentKey}</h2>
        <button type="button" className={styles.sectionToolbarButton} onClick={onClose}>
          Close
        </button>
      </div>

      <section className={styles.configSection}>
        <h3 className={styles.configSectionTitle}>Data source</h3>
        <label className={styles.formLabel}>
          Table
          <select
            className={styles.formControl}
            value={binding?.tableId ?? ''}
            onChange={(event) => handleBindToTable(event.target.value)}
          >
            <option value="">Placeholder content (not bound)</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.label}
              </option>
            ))}
          </select>
        </label>

        {binding && selectedTable && (
          <>
            <label className={styles.formLabel}>
              Mode
              <select
                className={styles.formControl}
                value={binding.mode}
                onChange={(event) => updateBinding({ mode: event.target.value as DataBinding['mode'] })}
              >
                <option value="single">Single row</option>
                <option value="list">List of rows</option>
              </select>
            </label>

            {binding.mode === 'single' ? (
              <label className={styles.formLabel}>
                Row ID
                <input
                  className={styles.formControl}
                  type="text"
                  value={binding.rowId ?? ''}
                  placeholder="Paste a row ID from DB Management"
                  onChange={(event) => updateBinding({ rowId: event.target.value })}
                />
              </label>
            ) : (
              <div className={styles.filterRow}>
                <label className={styles.formLabel}>
                  Filter field
                  <select
                    className={styles.formControl}
                    value={binding.filter?.field ?? ''}
                    onChange={(event) =>
                      updateBinding({
                        filter: { field: event.target.value, equals: binding.filter?.equals ?? '' },
                      })
                    }
                  >
                    <option value="">No filter (all rows)</option>
                    {selectedTable.fields.map((field) => (
                      <option key={field.id} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </label>
                {binding.filter?.field && (
                  <label className={styles.formLabel}>
                    Equals
                    <input
                      className={styles.formControl}
                      type="text"
                      value={binding.filter?.equals ?? ''}
                      onChange={(event) =>
                        updateBinding({ filter: { field: binding.filter!.field, equals: event.target.value } })
                      }
                    />
                  </label>
                )}
              </div>
            )}

            {dataKeys.length > 0 && (
              <div className={styles.fieldMap}>
                <h4 className={styles.configSectionSubtitle}>Field mapping</h4>
                <p className={styles.panelHint}>
                  Match this component's expected fields to columns on {selectedTable.label}.
                </p>
                {dataKeys.map((dataKey) => (
                  <label key={dataKey} className={styles.formLabel}>
                    {dataKey}
                    <select
                      className={styles.formControl}
                      value={binding.fieldMap?.[dataKey] ?? ''}
                      onChange={(event) => handleFieldMapChange(dataKey, event.target.value)}
                    >
                      <option value="">Not mapped</option>
                      {selectedTable.fields.map((field) => (
                        <option key={field.id} value={field.key}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className={styles.configSection}>
        <h3 className={styles.configSectionTitle}>Style</h3>
        <label className={styles.formLabel}>
          Background
          <select
            className={styles.formControl}
            value={styleOverrides.background ?? ''}
            onChange={(event) => setStyleOverrides((s) => ({ ...s, background: event.target.value || undefined }))}
          >
            {BACKGROUND_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.formLabel}>
          Spacing
          <select
            className={styles.formControl}
            value={styleOverrides.spacing ?? ''}
            onChange={(event) => setStyleOverrides((s) => ({ ...s, spacing: event.target.value || undefined }))}
          >
            {SPACING_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.formLabel}>
          Text alignment
          <select
            className={styles.formControl}
            value={styleOverrides.textAlign ?? ''}
            onChange={(event) =>
              setStyleOverrides((s) => ({
                ...s,
                textAlign: (event.target.value || undefined) as StyleOverrides['textAlign'],
              }))
            }
          >
            <option value="">Default</option>
            {TEXT_ALIGN_OPTIONS.map((align) => (
              <option key={align} value={align}>
                {align}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className={styles.configPanelFooter}>
        <button type="button" className={styles.primaryButton} onClick={handleSave}>
          Apply changes
        </button>
      </div>
    </aside>
  );
}
