/**
 * src/Kekal/routes/order-confirmation.tsx
 *
 * Shown after Chapa redirects the customer back.
 * Chapa appends ?trx_ref=... and ?status=... to the return URL.
 * We read the status from the URL and display a result message.
 *
 * The backend webhook (POST /api/commerce/webhook/chapa) is the source of
 * truth for payment confirmation — this page is display only.
 */

import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import styles from "./order-confirmation.module.css";

export default function OrderConfirmationPage() {
  const [params] = useSearchParams();
  const { clearCart } = useCart();

  const status = params.get("status") ?? "unknown";
  const trxRef = params.get("trx_ref");

  const success = status === "success";

  // Clear the cart once the customer lands on a success confirmation
  useEffect(() => {
    if (success) clearCart();
  }, [success, clearCart]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>{success ? "✓" : "✕"}</div>

        <h1 className={styles.title}>
          {success ? "Order Placed!" : "Payment Unsuccessful"}
        </h1>

        <p className={styles.message}>
          {success
            ? "Thank you for your order. You will receive a confirmation shortly."
            : "Your payment could not be completed. Please try again or contact us."}
        </p>

        {trxRef && (
          <p className={styles.ref}>
            Reference: <span className={styles.mono}>{trxRef}</span>
          </p>
        )}

        <div className={styles.actions}>
          <Link to="/" className={styles.btnPrimary}>
            Continue Shopping
          </Link>
          {!success && (
            <Link to="/checkout" className={styles.btnSecondary}>
              Try Again
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
