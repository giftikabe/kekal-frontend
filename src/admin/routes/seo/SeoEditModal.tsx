import { useState } from "react";
import { apiClient } from "@/shared/api/client";
import type { SeoRecord } from "../brand/types";
import styles from "./seo.module.css";

interface SeoEditModalProps {
  record: SeoRecord;
  onClose: () => void;
  onSaved: (updated: SeoRecord) => void;
}

// The backend's PATCH /api/seo/:id and POST /api/seo/:id/regenerate only
// return the seo_settings row itself (id, pageId, title, description,
// keywords, structuredData, isManualOverride, updatedAt) — it doesn't
// re-join the page's title/slug. Merge those back in from the record we
// already have so the list row doesn't lose its label after a save.
type SeoSettingsPatchResult = Omit<SeoRecord, "pageLabel" | "pageSlug">;

export function SeoEditModal({ record, onClose, onSaved }: SeoEditModalProps) {
  const [title, setTitle] = useState(record.title);
  const [description, setDescription] = useState(record.description);
  const [keywordsText, setKeywordsText] = useState(record.keywords.join(", "));
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function parseKeywords(): string[] {
    return keywordsText
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }

  async function handleSaveOverride() {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await apiClient.patch<SeoSettingsPatchResult>(`/api/seo/${record.id}`, {
        title,
        description,
        keywords: parseKeywords(),
      });
      onSaved({ ...record, ...updated });
      onClose();
    } catch {
      setError("Couldn't save. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRegenerate() {
    setIsRegenerating(true);
    setError(null);
    try {
      const updated = await apiClient.post<SeoSettingsPatchResult>(
        `/api/seo/${record.id}/regenerate`,
        {}
      );
      setTitle(updated.title);
      setDescription(updated.description);
      setKeywordsText(updated.keywords.join(", "));
      onSaved({ ...record, ...updated });
    } catch {
      setError("Couldn't regenerate. Try again.");
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHeader}>
          <div>
            <h2>{record.pageLabel}</h2>
            <p className={styles.pageSlug}>/{record.pageSlug}</p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className={styles.modalBody}>
          <label className={styles.field}>
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Description</span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Keywords (comma separated)</span>
            <input
              type="text"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
            />
          </label>

          <div className={styles.field}>
            <span>Structured data (read-only)</span>
            <pre className={styles.structuredData}>
              {JSON.stringify(record.structuredData, null, 2)}
            </pre>
          </div>

          {error && <p className={styles.uploadError}>{error}</p>}
        </div>

        <footer className={styles.modalFooter}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? "Regenerating…" : "Regenerate"}
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleSaveOverride}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save override"}
          </button>
        </footer>
      </div>
    </div>
  );
}
