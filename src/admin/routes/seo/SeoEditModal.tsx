import { useState } from "react";
import { apiClient } from "@/shared/api/client";
import type { SeoRecord } from "../brand/types";
import styles from "./seo.module.css";

interface SeoEditModalProps {
  record: SeoRecord;
  onClose: () => void;
  onSaved: (updated: SeoRecord) => void;
}

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
      const updated = await apiClient.patch<SeoRecord>(`/api/seo/${record.id}`, {
        title,
        description,
        keywords: parseKeywords(),
        is_manual_override: true,
      });
      onSaved(updated);
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
      const updated = await apiClient.post<SeoRecord>(
        `/api/seo/${record.id}/regenerate`,
        {}
      );
      setTitle(updated.title);
      setDescription(updated.description);
      setKeywordsText(updated.keywords.join(", "));
      onSaved(updated);
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
            <h2>{record.page_label}</h2>
            <p className={styles.pageSlug}>/{record.page_slug}</p>
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
              {JSON.stringify(record.structured_data, null, 2)}
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
