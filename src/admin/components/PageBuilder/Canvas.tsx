import React, { useEffect, useState } from 'react';
import { componentRegistry } from '../../../shared/componentLibrary/registry';
import { PreviewFrame } from '../PreviewFrame/PreviewFrame';
import { fetchTableRows } from './api';
import type { CustomRow, DataBinding, PageSection } from './types';
import styles from './PageBuilder.module.css';
import { DRAG_MIME_TYPE } from './ComponentLibraryPanel';

interface CanvasProps {
  sections: PageSection[];
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onReorder: (orderedSectionIds: string[]) => void;
  onDropNewComponent: (componentKey: string, atIndex: number) => void;
}

/** Resolves a section's `data` prop: previewProps when unbound, real rows when bound. */
async function resolveSectionData(binding: DataBinding | null, previewProps: unknown): Promise<unknown> {
  if (!binding) return previewProps;

  const rows: CustomRow[] = await fetchTableRows(binding.tableId, {
    filterField: binding.mode === 'single' ? 'id' : binding.filter?.field,
    filterEquals: binding.mode === 'single' ? binding.rowId ?? undefined : binding.filter?.equals,
  });

  const applyFieldMap = (row: CustomRow): Record<string, unknown> => {
    if (!binding.fieldMap) return row.data;
    const mapped: Record<string, unknown> = {};
    for (const [targetKey, sourceFieldKey] of Object.entries(binding.fieldMap)) {
      mapped[targetKey] = row.data[sourceFieldKey];
    }
    return mapped;
  };

  if (binding.mode === 'single') {
    const row = rows[0];
    return row ? applyFieldMap(row) : previewProps;
  }

  return rows.map(applyFieldMap);
}

export function Canvas({
  sections,
  selectedSectionId,
  onSelectSection,
  onDeleteSection,
  onReorder,
  onDropNewComponent,
}: CanvasProps) {
  const [resolvedData, setResolvedData] = useState<Record<string, unknown>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveAll() {
      const entries = await Promise.all(
        sections.map(async (section) => {
          const entry = componentRegistry[section.componentInstance.componentKey];
          const data = await resolveSectionData(section.componentInstance.dataBinding, entry?.previewProps);
          return [section.id, data] as const;
        })
      );
      if (!cancelled) {
        setResolvedData(Object.fromEntries(entries));
      }
    }

    resolveAll();
    return () => {
      cancelled = true;
    };
  }, [sections]);

  function handleDragStart(sectionId: string) {
    setDraggingId(sectionId);
  }

  function handleDragOverSection(event: React.DragEvent, index: number) {
    event.preventDefault();
    event.dataTransfer.dropEffect = event.dataTransfer.types.includes(DRAG_MIME_TYPE) ? 'copy' : 'move';
    setDropIndex(index);
  }

  function handleDrop(event: React.DragEvent, index: number) {
    event.preventDefault();
    const newComponentKey = event.dataTransfer.getData(DRAG_MIME_TYPE);
    if (newComponentKey) {
      onDropNewComponent(newComponentKey, index);
    } else if (draggingId) {
      const currentOrder = sections.map((s) => s.id);
      const fromIndex = currentOrder.indexOf(draggingId);
      if (fromIndex !== -1) {
        const next = [...currentOrder];
        next.splice(fromIndex, 1);
        next.splice(fromIndex < index ? index - 1 : index, 0, draggingId);
        onReorder(next);
      }
    }
    setDraggingId(null);
    setDropIndex(null);
  }

  if (sections.length === 0) {
    return (
      <div
        className={styles.canvasEmpty}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => handleDrop(event, 0)}
      >
        <p>This page has no sections yet.</p>
        <p className={styles.panelHint}>Drag a component here from the library to get started.</p>
      </div>
    );
  }

  return (
    <div className={styles.canvas}>
      {sections.map((section, index) => (
        <React.Fragment key={section.id}>
          <div
            className={`${styles.dropIndicator} ${dropIndex === index ? styles.dropIndicatorActive : ''}`}
            onDragOver={(event) => handleDragOverSection(event, index)}
            onDrop={(event) => handleDrop(event, index)}
          />
          <div
            className={`${styles.sectionWrapper} ${
              selectedSectionId === section.id ? styles.sectionWrapperSelected : ''
            }`}
            draggable
            onDragStart={() => handleDragStart(section.id)}
          >
            <div className={styles.sectionToolbar}>
              <span className={styles.sectionToolbarLabel}>
                {componentRegistry[section.componentInstance.componentKey]?.label ??
                  section.componentInstance.componentKey}
              </span>
              <button
                type="button"
                className={styles.sectionToolbarButton}
                onClick={() => onDeleteSection(section.id)}
                aria-label="Remove section"
              >
                Remove
              </button>
            </div>
            <PreviewFrame
              componentKey={section.componentInstance.componentKey}
              data={resolvedData[section.id]}
              styleOverrides={section.componentInstance.styleOverrides}
              onClick={() => onSelectSection(section.id)}
            />
          </div>
        </React.Fragment>
      ))}
      <div
        className={`${styles.dropIndicator} ${dropIndex === sections.length ? styles.dropIndicatorActive : ''}`}
        onDragOver={(event) => handleDragOverSection(event, sections.length)}
        onDrop={(event) => handleDrop(event, sections.length)}
      />
    </div>
  );
}
