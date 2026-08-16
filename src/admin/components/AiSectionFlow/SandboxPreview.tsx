import  { useEffect, useRef, useState } from "react";
import { compileSandbox, buildIframeDoc } from "../PreviewFrame/SandboxCompiler";
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

  // Re-compile whenever source changes
  useEffect(() => {
    setCompileError(null);

    const result = compileSandbox(tsxCode, cssCode);

    if ("message" in result) {
      setCompileError(result.message);
      return;
    }

    // Revoke previous blob URL
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);

    const blob = new Blob([result.js], { type: "text/javascript" });
    const jsBlobUrl = URL.createObjectURL(blob);
    blobRef.current = jsBlobUrl;

    // Minimal placeholder data matching the component's documented shape
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
      const res = await fetch("/api/publish/component", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({
          componentKey,
          label,
          category,
          tsxCode,
          cssCode,
          isNew: true,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setPublishError(json?.error?.message ?? "Publish failed.");
        return;
      }

      onPublished(json.data?.commitUrl ?? "");
    } catch (err: unknown) {
      setPublishError(String((err as Error).message ?? err));
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAccessToken(): string {
  // Access token is stored in localStorage by the AuthContext (F2)
  try {
    return localStorage.getItem("kekal_access_token") ?? "";
  } catch {
    return "";
  }
}
