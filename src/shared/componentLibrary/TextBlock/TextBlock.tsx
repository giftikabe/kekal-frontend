import type { CSSProperties } from 'react';
import type { SectionComponentProps } from '../../types/component';
import styles from './TextBlock.module.css';

export interface TextBlockData {
  eyebrow?: string;
  heading?: string;
  html: string;
  width?: 'narrow' | 'wide';
}

export default function TextBlock({ data, styleOverrides }: SectionComponentProps<TextBlockData>) {
  const { eyebrow, heading, html, width = 'narrow' } = data;

  return (
    <section
      className={[styles.block, width === 'wide' ? styles.wide : ''].join(' ')}
      style={styleOverrides as CSSProperties}
    >
      <div className={styles.inner}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
        <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}