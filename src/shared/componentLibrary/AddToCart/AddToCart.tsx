/**
 * src/shared/componentLibrary/AddToCart/AddToCart.tsx
 *
 * Component contract (F3):
 *   props: { data, styleOverrides? }
 *
 * Expected data shape (when bound to a commerce-enabled custom_row):
 * {
 *   custom_row_id: string        // the row's id (used as cart key)
 *   name: string                 // product display name
 *   price: { etb: number, usd: number }
 *   imageUrl?: string            // optional thumbnail for cart display
 *   description?: string         // short product blurb shown alongside button
 * }
 *
 * Placeholder previewProps are provided in registry.ts for admin preview.
 * The component is intentionally lightweight — layout is the parent section's
 * responsibility. This renders just the price display and "Add to Cart" button.
 *
 * Uses CartContext (Kekal/context/CartContext.tsx) — must be mounted inside
 * a <CartProvider> (added to src/Kekal/layout wrapping in F4/F8).
 */

import { useState } from "react";
import { useCart } from "../../../Kekal/context/CartContext";
import styles from "./AddToCart.module.css";

interface AddToCartData {
  custom_row_id: string;
  name: string;
  price: { etb: number; usd: number };
  imageUrl?: string;
  description?: string;
}

interface AddToCartProps {
  data: AddToCartData;
  styleOverrides?: Record<string, string>;
}

export default function AddToCart({ data, styleOverrides }: AddToCartProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);

  const alreadyInCart = items.some(
    (i) => i.custom_row_id === data.custom_row_id
  );

  const handleAdd = () => {
    addItem({
      custom_row_id: data.custom_row_id,
      name: data.name,
      price: data.price,
      imageUrl: data.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={styles.wrapper} style={styleOverrides as React.CSSProperties}>
      {data.description && (
        <p className={styles.description}>{data.description}</p>
      )}

      <div className={styles.priceRow}>
        <span className={styles.priceEtb}>
          ETB {data.price.etb.toLocaleString()}
        </span>
        <span className={styles.priceSep}>·</span>
        <span className={styles.priceUsd}>
          USD {data.price.usd.toLocaleString()}
        </span>
      </div>

      <button
        type="button"
        className={`${styles.btn} ${alreadyInCart ? styles.btnInCart : ""}`}
        onClick={handleAdd}
        disabled={added}
        aria-label={`Add ${data.name} to cart`}
      >
        {added ? "Added ✓" : alreadyInCart ? "Add Another" : "Add to Cart"}
      </button>
    </div>
  );
}
