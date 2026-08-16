import type { CSSProperties } from 'react';
import type { SectionComponentProps } from '../../types/component';
import styles from './Header.module.css';

export interface HeaderData {
  title: string;
  subtitle?: string;
  backgroundImageUrl?: string;
  align?: 'left' | 'center';
}

export default function Header({ data, styleOverrides }: SectionComponentProps<HeaderData>) {
  const { title, subtitle, backgroundImageUrl, align = 'left' } = data;

  return (
    <header
      className={[styles.header, align === 'center' ? styles.center : ''].join(' ')}
      style={styleOverrides as CSSProperties}
      data-has-image={Boolean(backgroundImageUrl)}
    >
      {backgroundImageUrl ? (
        <div className={styles.imageLayer} aria-hidden="true">
          <img src={backgroundImageUrl} alt="" className={styles.image} />
          <div className={styles.scrim} />
        </div>
      ) : null}
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
    </header>
  );
}