import { useEffect, useState } from 'react';
import type { CustomRow, FieldDef, TableDef } from '../../../shared/types/tables';
import { deleteRow, listRows } from '../../routes/db-management/api';
import RowForm from './RowForm';
import styles from './RowList.module.css';

interface RowListProps {
  table: TableDef;
}

type PanelState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; row: CustomRow };

const PAGE_SIZE = 25;

export default function RowList({ table }: RowListProps) {
  const [rows, setRows] = useState<CustomRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<PanelState>({ mode: 'closed' });

  const sortedFields = table.fields.slice().sort((a, b) => a.order - b.order);
  const displayFields = sortedFields.slice(0, 5); // keep the table readable

  async function refresh() {
    setLoading(true);
    try {
      const res = await listRows(table.id, page, PAGE_SIZE);
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.id, page]);

  async function handleDelete(row: CustomRow) {
    if (!confirm('Delete this row? This cannot be undone.')) return;
    await deleteRow(table.id, row.id);
    refresh();
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.count}>
          {total} row{total === 1 ? '' : 's'}
        </span>
        <button className={styles.newRowButton} onClick={() => setPanel({ mode: 'create' })}>
          + New row
        </button>
      </div>

      {loading ? (
        <p className={styles.hint}>Loading…</p>
      ) : rows.length === 0 ? (
        <p className={styles.hint}>No rows yet. Add the first one.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              {displayFields.map((f) => (
                <th key={f.id}>{f.label}</th>
              ))}
              <th className={styles.actionsHeader} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {displayFields.map((f) => (
                  <td key={f.id}>{formatCell(f, row)}</td>
                ))}
                <td className={styles.actionsCell}>
                  <button onClick={() => setPanel({ mode: 'edit', row })}>Edit</button>
                  <button className={styles.deleteButton} onClick={() => handleDelete(row)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}

      {panel.mode !== 'closed' && (
        <div className={styles.inlinePanel}>
          <h3>{panel.mode === 'create' ? `New ${table.label} row` : `Edit row`}</h3>
          <RowForm
            table={table}
            initialRow={panel.mode === 'edit' ? panel.row : null}
            onCancel={() => setPanel({ mode: 'closed' })}
            onSaved={() => {
              setPanel({ mode: 'closed' });
              refresh();
            }}
          />
        </div>
      )}
    </div>
  );
}

function formatCell(field: FieldDef, row: CustomRow): string {
  const value = row.data[field.key];
  const previewKey = `${field.key}$preview`;

  if (value === undefined || value === null || value === '') return '—';

  switch (field.type) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'price': {
      const price = value as { etb?: number; usd?: number };
      const parts = [];
      if (price.etb !== undefined) parts.push(`${price.etb} ETB`);
      if (price.usd !== undefined) parts.push(`$${price.usd}`);
      return parts.join(' / ') || '—';
    }
    case 'gallery':
      return Array.isArray(value) ? `${value.length} image${value.length === 1 ? '' : 's'}` : '—';
    case 'image':
      return typeof value === 'string' ? '1 image' : '—';
    case 'richtext':
      return String(value).replace(/<[^>]+>/g, '').slice(0, 60);
    case 'select': {
      const choice = field.options?.choices?.find((c) => c.value === value);
      return choice?.label ?? String(value);
    }
    case 'relation': {
      const preview = (row as unknown as Record<string, { label?: string } | undefined>)[previewKey];
      return preview?.label ?? String(value);
    }
    default:
      return String(value).slice(0, 80);
  }
}
