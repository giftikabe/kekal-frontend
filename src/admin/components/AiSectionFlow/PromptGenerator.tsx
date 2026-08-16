import  { useState } from "react";
import styles from "./AiSectionFlow.module.css";

interface PromptGeneratorProps {
  onNext: () => void;
}

export function PromptGenerator({ onNext }: PromptGeneratorProps) {
  const [componentName, setComponentName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const assembled =
    componentName.trim() && purpose.trim() && contentDescription.trim()
      ? buildPrompt(componentName.trim(), purpose.trim(), contentDescription.trim())
      : null;

  async function handleCopy() {
    if (!assembled) return;
    await navigator.clipboard.writeText(assembled);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>1 — Describe the section you need</h2>
      <p className={styles.stepDesc}>
        Fill in the fields below. We'll assemble a structured prompt you can paste into any AI
        code generator (ChatGPT, Claude, Gemini, Copilot, etc.) to get back the exact file format
        Kekal Living expects.
      </p>

      <label className={styles.label}>
        Component name <span className={styles.hint}>(PascalCase, e.g. HeroWithVideo)</span>
        <input
          className={styles.input}
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
          placeholder="HeroWithVideo"
        />
      </label>

      <label className={styles.label}>
        Purpose / role on the page
        <input
          className={styles.input}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="A full-bleed hero section with an autoplay background video and a centred CTA button"
        />
      </label>

      <label className={styles.label}>
        Content description{" "}
        <span className={styles.hint}>(what fields/data will this component display?)</span>
        <textarea
          className={styles.textarea}
          rows={4}
          value={contentDescription}
          onChange={(e) => setContentDescription(e.target.value)}
          placeholder="title (text), subtitle (text), video_url (text), cta_label (text), cta_href (text)"
        />
      </label>

      {assembled && (
        <div className={styles.promptBox}>
          <div className={styles.promptHeader}>
            <span>Generated prompt — copy and paste into your AI tool</span>
            <button className={styles.copyBtn} onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className={styles.promptPre}>{assembled}</pre>
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={styles.primaryBtn}
          disabled={!assembled}
          onClick={onNext}
        >
          I have the AI output — next →
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildPrompt(name: string, purpose: string, contentDescription: string): string {
  return `Generate a React section component for a CMS called Kekal Living.

## Component identity
- Name: ${name}
- Purpose: ${purpose}

## Required file outputs
Produce exactly two files:
1. ${name}.tsx
2. ${name}.module.css

## Props contract (MANDATORY — do not deviate)
The component must accept a single props object with this exact shape:

\`\`\`ts
interface ${name}Props {
  data: {
    ${contentDescription
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean)
      .join(";\n    ")};
  };
  styleOverrides?: Record<string, string>; // CSS custom properties, applied to the root element
}
\`\`\`

Export it as: \`export function ${name}({ data, styleOverrides }: ${name}Props) { ... }\`

## Styling rules
- Use CSS Modules (${name}.module.css) — no inline styles except for styleOverrides.
- All colours MUST be CSS custom properties referencing the theme:
  --color-primary (default #000), --color-on-primary (default #fff),
  --color-surface (default #fff), --color-on-surface (default #000),
  --color-border (default #e5e5e5), --color-muted (default #666).
  Define fallbacks inline: \`color: var(--color-primary, #000)\`.
- Apply \`styleOverrides\` as inline CSS variables on the root element:
  \`<section style={styleOverrides as React.CSSProperties}>\`
- Aesthetic: monochrome black/white, high contrast, generous whitespace, typography-led. No colours beyond the palette above.

## Placeholder data (MANDATORY)
Every text, image src, and href must use clearly-labelled placeholder values — real content is
injected at runtime via the \`data\` prop. Use strings like "[Title text]", "[Subtitle]",
"https://placehold.co/1200x600?text=${encodeURIComponent(name)}", "/[link]".

## Expected data shape comment (MANDATORY)
At the very top of ${name}.tsx, include a JSDoc comment block:

\`\`\`ts
/**
 * Expected data shape:
 * {
 *   ${contentDescription
     .split(",")
     .map((f) => f.trim())
     .filter(Boolean)
     .join(";\n *   ")};
 * }
 */
\`\`\`

## Do NOT
- Import anything from outside React and the standard browser APIs.
- Hardcode the Kekal brand, logo paths, or any real content.
- Use Tailwind classes (this project uses CSS Modules).
- Add props beyond \`data\` and \`styleOverrides\`.

Return ONLY the two files, clearly separated. No explanation text.`;
}
