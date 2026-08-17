import { useEffect, useState } from "react";
import { apiClient } from "@/shared/api/client";
import type { SeoRecord } from "../brand/types";
import { SeoEditModal } from "./SeoEditModal";
import styles from "./seo.module.css";

export default function SeoSettingsPage() {
  const [records, setRecords] = useState<SeoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  function refresh() {
    return apiClient.get<SeoRecord[]>("/api/seo").then(setRecords);
  }

  useEffect(() => {
    setIsLoading(true);
    refresh().finally(() => setIsLoading(false));
  }, []);

  const activeRecord = records.find((r) => r.id === activeId) ?? null;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>SEO</h1>
        <p className={styles.pageSubtitle}>
          Titles, descriptions, and structured data for every page. Pages
          without a manual override use the auto-generated version.
        </p>
      </header>

      {isLoading ? (
        <p className={styles.loading}>Loading SEO records…</p>
      ) : records.length === 0 ? (
        <p className={styles.empty}>No pages with SEO records yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Page</th>
              <th>Title</th>
              <th>Source</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                className={styles.row}
                onClick={() => setActiveId(record.id)}
              >
                <td>
                  <div className={styles.pageLabel}>{record.pageLabel}</div>
                  <div className={styles.pageSlug}>/{record.pageSlug}</div>
                </td>
                <td className={styles.titleCell}>{record.title || "—"}</td>
                <td>
                  <span
                    className={styles.badge}
                    data-variant={record.isManualOverride ? "manual" : "auto"}
                  >
                    {record.isManualOverride ? "Manual" : "Auto-generated"}
                  </span>
                </td>
                <td className={styles.updatedCell}>
                  {new Date(record.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeRecord && (
        <SeoEditModal
          record={activeRecord}
          onClose={() => setActiveId(null)}
          onSaved={(updated) => {
            setRecords((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            );
          }}
        />
      )}
    </div>
  );
}
