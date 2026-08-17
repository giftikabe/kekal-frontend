import  { useEffect, useRef, useState } from "react";
import { compileSandbox, buildIframeDoc } from "../PreviewFrame/SandboxCompiler";
import { apiClient } from "../../../shared/api/client";
import styles from "./AiSectionFlow.module.css";

interface SandboxPreviewProps {
  tsxCode: string;
  cssCode: string;
  componentKey: string;
  label: string;
  category: string;
  onBack: () => void;
  onPublished: (commitUrl: string) => void;
}

// FIXED: matches the backend's actual response shape
// ({ componentKey, isNew, commitShas, commitUrls }) — was reading a
// nonexistent `commitUrl` singular field.
interface PublishComponentResponse {
  componentKey: string;
  isNew: boolean;
  commitShas: string[];
  commitUrls: string[];
}

export function SandboxPreview({
  tsxCode,
  cssCode,
  componentKey,
  label,
  category,
  onBack,
  onPublished,
}: SandboxPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blobRef = useRef<string | null>(null);

  const [compileError, setCompileError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  useEffect(() => {
    setCompileError(null);

    const result = compileSandbox(tsxCode, cssCode);

    if ("message" in result) {
      setCompileError(result.message);
      return;
    }

    if (blobRef.current) URL.revokeObjectURL(blobRef.current);

    const blob = new Blob([result.js], { type: "text/javascript" });
    const jsBlobUrl = URL.createObjectURL(blob);
    blobRef.current = jsBlobUrl;

    const previewProps = {
      data: {},
      styleOverrides: {},
    };

    if (iframeRef.current) {
      iframeRef.current.srcdoc = buildIframeDoc(jsBlobUrl, result.css, previewProps);
    }

    return () => {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [tsxCode, cssCode]);

  async function handlePublish() {
    setPublishing(true);
    setPublishError(null);
    try {
      // FIXED: was fetch("/api/publish/component", ...) — a RELATIVE url,
      // which hits the frontend's own origin (Cloudflare Pages) instead of
      // the backend Worker. Was also reading the token from the wrong
      // localStorage key ("kekal_access_token" vs the real "kk_access_token"),
      // so Authorization was always missing → 401. apiClient fixes both:
      // correct base URL (VITE_API_URL) and correct token key.
      const result = await apiClient.post<PublishComponentResponse>(
        "/api/publish/component",
        { componentKey, label, category, tsxCode, cssCode, isNew: true },
      );
      onPublished(result.commitUrls?.[0] ?? "");
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>3 — Preview</h2>
      <p className={styles.stepDesc}>
        This is a live in-browser render of the pasted code — nothing has been saved yet.
        If it looks right, fill in the registry details below and publish.
      </p>

      {compileError ? (
        <div className={styles.errorBox}>
          <strong>Compile error</strong>
          <pre className={styles.errorPre}>{compileError}</pre>
          <p>Fix the code in the previous step and come back.</p>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          className={styles.previewIframe}
          sandbox="allow-scripts"
          title="Component preview"
        />
      )}

      <div className={styles.publishMeta}>
        <p className={styles.sectionLabel}>Registry details</p>
        <div className={styles.metaGrid}>
          <span className={styles.metaKey}>Component key</span>
          <span className={styles.metaVal}>{componentKey || "—"}</span>
          <span className={styles.metaKey}>Label</span>
          <span className={styles.metaVal}>{label || "—"}</span>
          <span className={styles.metaKey}>Category</span>
          <span className={styles.metaVal}>{category || "—"}</span>
        </div>
        <p className={styles.metaNote}>
          Edit these on the previous screen if needed before publishing.
        </p>
      </div>

      {publishError && (
        <div className={styles.errorBox}>
          <strong>Publish error</strong>
          <p>{publishError}</p>
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.ghostBtn} onClick={onBack} disabled={publishing}>
          ← Back
        </button>
        <button
          className={styles.primaryBtn}
          disabled={!!compileError || publishing}
          onClick={handlePublish}
        >
          {publishing ? "Publishing…" : "Publish component"}
        </button>
      </div>
    </div>
  );
}