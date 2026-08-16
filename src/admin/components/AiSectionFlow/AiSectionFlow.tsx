/**
 * AiSectionFlow
 *
 * Multi-step wizard that lets an admin generate, preview, and publish a custom
 * React section component without leaving the browser.
 *
 * Steps:
 *   1. PromptGenerator  — fill in intent, copy a structured prompt for an external AI
 *   2. PasteBackForm    — paste back the AI's .tsx + .module.css output
 *   3. RegistryMetaForm — pick componentKey / label / category
 *   4. SandboxPreview   — live in-browser compile + iframe render, then publish
 *   5. PublishSuccess   — commit confirmed, guide to Page Builder
 *
 * This component is triggered from F6 (Page Builder) when an admin clicks
 * "Can't find what I need?" in the component library panel.
 *
 * Nothing is saved to the backend until the admin explicitly clicks "Publish component"
 * in step 4.
 */

import React, { useState } from "react";
import { PromptGenerator } from "./PromptGenerator";
import { PasteBackForm } from "./PasteBackForm";
import { RegistryMetaForm, type RegistryMeta } from "./RegistryMetaForm";
import { SandboxPreview } from "./SandboxPreview";
import { PublishSuccess } from "./PublishSuccess";
import styles from "./AiSectionFlow.module.css";

type Step = "prompt" | "paste" | "meta" | "preview" | "success";

const STEP_LABELS: Record<Step, string> = {
  prompt: "Describe",
  paste: "Paste",
  meta: "Details",
  preview: "Preview & Publish",
  success: "Done",
};

const STEP_ORDER: Step[] = ["prompt", "paste", "meta", "preview", "success"];

export function AiSectionFlow() {
  const [step, setStep] = useState<Step>("prompt");
  const [tsxCode, setTsxCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [meta, setMeta] = useState<RegistryMeta>({ componentKey: "", label: "", category: "" });
  const [commitUrl, setCommitUrl] = useState("");

  function reset() {
    setStep("prompt");
    setTsxCode("");
    setCssCode("");
    setMeta({ componentKey: "", label: "", category: "" });
    setCommitUrl("");
  }

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div className={styles.root}>
      {/* ── Progress bar ──────────────────────────────────────────────── */}
      <nav className={styles.progress} aria-label="Flow steps">
        {STEP_ORDER.filter((s) => s !== "success").map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`${styles.progressStep} ${
                i < stepIndex
                  ? styles.progressDone
                  : i === stepIndex
                  ? styles.progressCurrent
                  : styles.progressFuture
              }`}
            >
              <span className={styles.progressDot}>{i < stepIndex ? "✓" : i + 1}</span>
              <span className={styles.progressLabel}>{STEP_LABELS[s]}</span>
            </div>
            {i < STEP_ORDER.length - 2 && <div className={styles.progressLine} />}
          </React.Fragment>
        ))}
      </nav>

      {/* ── Steps ─────────────────────────────────────────────────────── */}

      {step === "prompt" && (
        <PromptGenerator onNext={() => setStep("paste")} />
      )}

      {step === "paste" && (
        <PasteBackForm
          tsxCode={tsxCode}
          cssCode={cssCode}
          onChange={(tsx, css) => {
            setTsxCode(tsx);
            setCssCode(css);
          }}
          onNext={() => setStep("meta")}
          onBack={() => setStep("prompt")}
        />
      )}

      {step === "meta" && (
        <RegistryMetaForm
          meta={meta}
          onChange={setMeta}
          onNext={() => setStep("preview")}
          onBack={() => setStep("paste")}
        />
      )}

      {step === "preview" && (
        <SandboxPreview
          tsxCode={tsxCode}
          cssCode={cssCode}
          componentKey={meta.componentKey}
          label={meta.label}
          category={meta.category}
          onBack={() => setStep("meta")}
          onPublished={(url) => {
            setCommitUrl(url);
            setStep("success");
          }}
        />
      )}

      {step === "success" && (
        <PublishSuccess
          commitUrl={commitUrl}
          componentKey={meta.componentKey}
          onReset={reset}
        />
      )}
    </div>
  );
}

export default AiSectionFlow;
