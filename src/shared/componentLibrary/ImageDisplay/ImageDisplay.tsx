import type { CSSProperties } from 'react';
import type { SectionComponentProps } from '../../types/component';
import styles from './ImageDisplay.module.css';

export interface ImageDisplayData {
  imageUrl: string;
  alt: string;
  caption?: string;
  ratio?: 'square' | 'portrait' | 'wide';
}

const ratioClass: Record<string, string> = {
  square: styles.square,
  portrait: styles.portrait,
  wide: styles.wide,
};

export default function ImageDisplay({ data, styleOverrides }: SectionComponentProps<ImageDisplayData>) {
  const { imageUrl, alt, caption, ratio = 'wide' } = data;

  return (
    <figure className={styles.figure} style={styleOverrides as CSSProperties}>
      <div className={[styles.frame, ratioClass[ratio] ?? styles.wide].join(' ')}>
        <img src={imageUrl} alt={alt} className={styles.image} loading="lazy" />
      </div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}