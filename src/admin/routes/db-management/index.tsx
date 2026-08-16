import { useEffect, useMemo, useState } from 'react';
import type { TableDef } from '../../../shared/types/tables';
import { deleteTable, listTables } from './api';
import TableForm from '../../components/TableBuilder/TableForm';
import RowList from '../../components/TableBuilder/RowList';
import Modal from '../../components/TableBuilder/Modal';
import styles from './index.module.css';

// Individual table data views open as a modal (rather than a nested route) —
// see F5 spec: "pick one approach and keep it consistent."
type ModalState =
  | { kind: 'none' }
  | { kind: 'newTable' }
  | { kind: 'editTable'; table: TableDef }
  | { kind: 'rows'; table: TableDef };

const UNCATEGORIZED = 'Uncategorized';

export default function DbManagementIndex() {
  const [tables, setTables] = useState<TableDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });

  async function refresh() {
    setLoading(true);
    try {
      const data = await listTables();
      setTables(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    tables.forEach((t) => set.add(t.category?.trim() || UNCATEGORIZED));
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return list;
  }, [tables]);

  useEffect(() => {
    if (categories.length === 0) {
      setActiveCategory(null);
      return;
    }
    if (!activeCategory || !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const tablesInCategory = tables.filter(
    (t) => (t.category?.trim() || UNCATEGORIZED) === activeCategory
  );

  async function handleDeleteTable(table: TableDef) {
    if (!confirm(`Delete "${table.label}"? This deletes all of its rows too.`)) return;
    await deleteTable(table.id);
    refresh();
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>DB Management</h1>
          <p className={styles.subtitle}>Custom tables that power the storefront and admin.</p>
        </div>
        <button className={styles.newTableButton} onClick={() => setModal({ kind: 'newTable' })}>
          + New table
        </button>
      </div>

      {loading ? (
        <p className={styles.hint}>Loading…</p>
      ) : tables.length === 0 ? (
        <p className={styles.hint}>No tables yet. Create one to get started.</p>
      ) : (
        <>
          <div className={styles.tabs}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={cat === activeCategory ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.tableGrid}>
            {tablesInCategory.map((table) => (
              <div key={table.id} className={styles.tableCard}>
                <button
                  className={styles.tableCardMain}
                  onClick={() => setModal({ kind: 'rows', table })}
                >
                  <span className={styles.tableCardLabel}>{table.label}</span>
                  <span className={styles.tableCardMeta}>
                    {table.fields.length} field{table.fields.length === 1 ? '' : 's'}
                    {table.isCommerce ? ' · Sellable' : ''}
                  </span>
                </button>
                <div className={styles.tableCardActions}>
                  <button onClick={() => setModal({ kind: 'editTable', table })}>Edit</button>
                  <button className={styles.deleteButton} onClick={() => handleDeleteTable(table)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modal.kind === 'newTable' && (
        <Modal title="New table" onClose={() => setModal({ kind: 'none' })}>
          <TableForm
            existingTables={tables}
            onCancel={() => setModal({ kind: 'none' })}
            onSaved={() => {
              setModal({ kind: 'none' });
              refresh();
            }}
          />
        </Modal>
      )}

      {modal.kind === 'editTable' && (
        <Modal title={`Edit ${modal.table.label}`} onClose={() => setModal({ kind: 'none' })}>
          <TableForm
            initialTable={modal.table}
            existingTables={tables}
            onCancel={() => setModal({ kind: 'none' })}
            onSaved={() => {
              setModal({ kind: 'none' });
              refresh();
            }}
          />
        </Modal>
      )}

      {modal.kind === 'rows' && (
        <Modal title={modal.table.label} onClose={() => setModal({ kind: 'none' })} wide>
          <RowList table={modal.table} />
        </Modal>
      )}
    </div>
  );
}
