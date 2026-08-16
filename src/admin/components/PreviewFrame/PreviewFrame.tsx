import React from 'react';
// Direct import of the real registry (built in F3) — this is what guarantees the admin
// preview can never drift from what the storefront actually renders. Never re-implement
// or mock a component here.
import { componentRegistry } from '../../../shared/componentLibrary/registry';
import type { StyleOverrides } from '../PageBuilder/types';
import styles from './PreviewFrame.module.css';

export interface PreviewFrameProps {
  componentKey: string;
  /** Resolved data for the bound row/list, or the registry's previewProps when unbound. */
  data: unknown;
  styleOverrides?: StyleOverrides | null;
  /** Optional wrapper className, e.g. for selection highlighting in the builder canvas. */
  className?: string;
  onClick?: () => void;
}

function styleOverridesToCss(overrides?: StyleOverrides | null): React.CSSProperties {
  if (!overrides) return {};
  const style: React.CSSProperties & Record<string, string> = {};
  if (overrides.background) style['--kk-section-bg'] = overrides.background;
  if (overrides.spacing) style['--kk-section-spacing'] = overrides.spacing;
  if (overrides.textAlign) style.textAlign = overrides.textAlign;
  return style;
}

/**
 * Renders a single section's live component, exactly as componentRegistry defines it.
 * Used by both the Page Builder canvas (F6) and, eventually, the AI section flow's
 * sandbox preview (F9) for already-published components.
 */
export function PreviewFrame({ componentKey, data, styleOverrides, className, onClick }: PreviewFrameProps) {
  const entry = componentRegistry[componentKey];

  if (!entry) {
    return (
      <div className={`${styles.frame} ${styles.missing} ${className ?? ''}`} onClick={onClick}>
        <p className={styles.missingText}>
          Unknown component <code>{componentKey}</code>. It may have been removed from the
          library.
        </p>
      </div>
    );
  }

  const Component = entry.component;

  // Cast or coerce styleOverrides to Record<string, string> to satisfy SectionComponentProps
  const castedOverrides = (styleOverrides ?? undefined) as Record<string, string> | undefined;

  return (
    <div
      className={`${styles.frame} ${className ?? ''}`}
      style={styleOverridesToCss(styleOverrides)}
      onClick={onClick}
    >
      <Component data={data} styleOverrides={castedOverrides} />
    </div>
  );
}