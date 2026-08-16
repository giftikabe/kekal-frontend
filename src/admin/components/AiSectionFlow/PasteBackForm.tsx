import React, { useState } from "react";
import styles from "./AiSectionFlow.module.css";

interface PasteBackFormProps {
  tsxCode: string;
  cssCode: string;
  onChange: (tsxCode: string, cssCode: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PasteBackForm({
  tsxCode,
  cssCode,
  onChange,
  onNext,
  onBack,
}: PasteBackFormProps) {
  const [activeTab, setActiveTab] = useState<"tsx" | "css">("tsx");

  const isReady = tsxCode.trim().length > 0 && cssCode.trim().length > 0;

  function handleTsx(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value, cssCode);
  }

  function handleCss(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(tsxCode, e.target.value);
  }

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>2 — Paste the AI's output</h2>
      <p className={styles.stepDesc}>
        Paste the two files your AI tool returned. Switch between the tabs to enter each one.
        We'll compile and preview them in the next step — nothing is saved yet.
      </p>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "tsx" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("tsx")}
        >
          ComponentName.tsx{tsxCode.trim() ? " ✓" : ""}
        </button>
        <button
          className={`${styles.tab} ${activeTab === "css" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("css")}
        >
          ComponentName.module.css{cssCode.trim() ? " ✓" : ""}
        </button>
      </div>

      {activeTab === "tsx" && (
        <textarea
          className={styles.codeArea}
          rows={24}
          spellCheck={false}
          placeholder={`Paste your .tsx file here…\n\nexport function MyComponent({ data, styleOverrides }) {\n  return <section>…</section>;\n}`}
          value={tsxCode}
          onChange={handleTsx}
        />
      )}

      {activeTab === "css" && (
        <textarea
          className={styles.codeArea}
          rows={24}
          spellCheck={false}
          placeholder={`Paste your .module.css file here…\n\n.root {\n  background: var(--color-surface, #fff);\n}`}
          value={cssCode}
          onChange={handleCss}
        />
      )}

      <div className={styles.actions}>
        <button className={styles.ghostBtn} onClick={onBack}>
          ← Back
        </button>
        <button className={styles.primaryBtn} disabled={!isReady} onClick={onNext}>
          Preview →
        </button>
      </div>
    </div>
  );
}
