import type { CSSProperties } from 'react';
import type { SectionComponentProps } from '../../types/component';
import styles from './Card.module.css';

export interface CardItem {
  imageUrl?: string;
  title: string;
  text?: string;
  linkHref?: string;
  linkLabel?: string;
  priceLabel?: string;
}

export type CardData = CardItem | CardItem[];

function CardTile({ item }: { item: CardItem }) {
  const { imageUrl, title, text, linkHref, linkLabel = 'View', priceLabel } = item;
  const Wrapper = linkHref ? 'a' : 'div';

  return (
    <Wrapper className={styles.card} {...(linkHref ? { href: linkHref } : {})}>
      <div className={styles.imageFrame}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {text ? <p className={styles.text}>{text}</p> : null}
        <div className={styles.footer}>
          {priceLabel ? <span className={styles.price}>{priceLabel}</span> : null}
          {linkHref ? <span className={styles.link}>{linkLabel} →</span> : null}
        </div>
      </div>
    </Wrapper>
  );
}

export default function Card({ data, styleOverrides }: SectionComponentProps<CardData>) {
  const items = Array.isArray(data) ? data : [data];

  if (items.length === 1) {
    return (
      <div className={styles.single} style={styleOverrides as CSSProperties}>
        <CardTile item={items[0]} />
      </div>
    );
  }

  return (
    <div className={styles.grid} style={styleOverrides as CSSProperties}>
      {items.map((item, i) => (
        <CardTile key={item.linkHref ?? `${item.title}-${i}`} item={item} />
      ))}
    </div>
  );
}