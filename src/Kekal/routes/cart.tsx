/**
 * src/Kekal/routes/cart.tsx
 *
 * Storefront cart page.
 * Reads cart state from CartContext; lets the customer adjust quantities
 * or remove items, then proceeds to checkout.
 */

import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import styles from "./cart.module.css";

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>Your Cart</h1>
        <p className={styles.empty}>Your cart is empty.</p>
        <Link to="/" className={styles.linkBtn}>
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Your Cart</h1>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Item</th>
            <th className={styles.th}>Price (ETB)</th>
            <th className={styles.th}>Price (USD)</th>
            <th className={styles.th}>Qty</th>
            <th className={styles.th}>Subtotal (ETB)</th>
            <th className={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.custom_row_id} className={styles.row}>
              <td className={styles.td}>
                <div className={styles.itemCell}>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className={styles.thumb}
                    />
                  )}
                  <span className={styles.itemName}>{item.name}</span>
                </div>
              </td>
              <td className={styles.td}>
                {item.price.etb.toLocaleString()}
              </td>
              <td className={styles.td}>
                {item.price.usd.toLocaleString()}
              </td>
              <td className={styles.td}>
                <div className={styles.qtyRow}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() =>
                      updateQty(item.custom_row_id, item.quantity - 1)
                    }
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className={styles.qty}>{item.quantity}</span>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() =>
                      updateQty(item.custom_row_id, item.quantity + 1)
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className={styles.td}>
                {(item.price.etb * item.quantity).toLocaleString()}
              </td>
              <td className={styles.td}>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeItem(item.custom_row_id)}
                  aria-label={`Remove ${item.name}`}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.summary}>
        <div className={styles.totals}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalAmount}>
            ETB {totalPrice("etb").toLocaleString()}
            <span className={styles.totalAlt}>
              {" "}/ USD {totalPrice("usd").toLocaleString()}
            </span>
          </span>
        </div>
        <Link to="/checkout" className={styles.checkoutBtn}>
          Proceed to Checkout →
        </Link>
      </div>
    </main>
  );
}
