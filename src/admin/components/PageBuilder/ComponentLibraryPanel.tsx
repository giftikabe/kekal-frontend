import { componentRegistry } from '../../../shared/componentLibrary/registry';
import styles from './PageBuilder.module.css';

export const DRAG_MIME_TYPE = 'application/x-kekal-component-key';

interface ComponentLibraryPanelProps {
  onAddComponent: (componentKey: string) => void;
  addingComponentKey: string | null;
}

/**
 * The library to drag from. Reads entirely off componentRegistry — a newly published
 * component (via F9's publish flow) shows up here automatically, no code change needed.
 */
export function ComponentLibraryPanel({ onAddComponent, addingComponentKey }: ComponentLibraryPanelProps) {
  const entries = Object.entries(componentRegistry);

  return (
    <aside className={styles.libraryPanel} aria-label="Component library">
      <h2 className={styles.panelTitle}>Components</h2>
      <p className={styles.panelHint}>Drag onto the canvas, or click to add to the end of the page.</p>
      <ul className={styles.libraryList}>
        {entries.map(([componentKey, entry]) => (
          <li
            key={componentKey}
            className={styles.libraryItem}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData(DRAG_MIME_TYPE, componentKey);
              event.dataTransfer.effectAllowed = 'copy';
            }}
            onClick={() => onAddComponent(componentKey)}
            aria-disabled={addingComponentKey === componentKey}
          >
            <span className={styles.libraryItemLabel}>{entry.label}</span>
            <span className={styles.libraryItemKey}>{componentKey}</span>
            {addingComponentKey === componentKey && <span className={styles.libraryItemBusy}>Adding…</span>}
          </li>
        ))}
        {entries.length === 0 && <li className={styles.libraryEmpty}>No components registered yet.</li>}
      </ul>
    </aside>
  );
}
