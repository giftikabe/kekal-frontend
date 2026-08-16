import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { apiClient } from "../../shared/api/client";
import styles from "./checkout.module.css";

type CustomerType = "local" | "international";
type Currency = "etb" | "usd";

interface CheckoutBody {
  items: { custom_row_id: string; quantity: number }[];
  customer_type: CustomerType;
  currency: Currency;
  contact_name: string;
  contact_phone?: string;
  shipping_address?: { address_line_1: string; city: string; country: string; postal_code?: string };
}

interface CheckoutResponse {
  checkout_url: string;
}

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();

  const [customerType, setCustomerType] = useState<CustomerType>("local");
  const [currency, setCurrency] = useState<Currency>("etb");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>Checkout</h1>
        <p className={styles.empty}>Your cart is empty.</p>
        <Link to="/cart" className={styles.linkBtn}>Back to Cart</Link>
      </main>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const body: CheckoutBody = {
      items: items.map((i) => ({ custom_row_id: i.custom_row_id, quantity: i.quantity })),
      customer_type: customerType,
      currency,
      contact_name: contactName,
    };

    if (customerType === "local") {
      body.contact_phone = contactPhone;
    } else {
      body.shipping_address = { address_line_1: addressLine1, city, country, postal_code: postalCode || undefined };
    }

    try {
      const res = await apiClient.post<CheckoutResponse>("/api/commerce/checkout", body);
      window.location.href = res.checkout_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Checkout</h1>
      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Payment Currency</legend>
            <div className={styles.radioGroup}>
              {(["etb", "usd"] as Currency[]).map((c) => (
                <label key={c} className={styles.radioLabel}>
                  <input type="radio" name="currency" value={c} checked={currency === c} onChange={() => setCurrency(c)} />
                  {c.toUpperCase()}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Customer Type</legend>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" name="customer_type" value="local" checked={customerType === "local"} onChange={() => setCustomerType("local")} />
                Local (Ethiopia)
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="customer_type" value="international" checked={customerType === "international"} onChange={() => setCustomerType("international")} />
                International
              </label>
            </div>
          </fieldset>

          <label className={styles.label}>
            Full Name
            <input className={styles.input} type="text" required autoComplete="name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </label>

          {customerType === "local" && (
            <label className={styles.label}>
              Phone Number
              <input className={styles.input} type="tel" required autoComplete="tel" placeholder="+251..." value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </label>
          )}

          {customerType === "international" && (
            <>
              <label className={styles.label}>
                Address
                <input className={styles.input} type="text" required autoComplete="address-line1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
              </label>
              <div className={styles.row}>
                <label className={styles.label} style={{ flex: 1 }}>
                  City
                  <input className={styles.input} type="text" required value={city} onChange={(e) => setCity(e.target.value)} />
                </label>
                <label className={styles.label} style={{ flex: 1 }}>
                  Country
                  <input className={styles.input} type="text" required value={country} onChange={(e) => setCountry(e.target.value)} />
                </label>
              </div>
              <label className={styles.label}>
                Postal Code (optional)
                <input className={styles.input} type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
              </label>
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? "Redirecting to payment…" : `Pay ${currency.toUpperCase()} ${totalPrice(currency).toLocaleString()} →`}
          </button>
        </form>

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          <ul className={styles.summaryList}>
            {items.map((item) => (
              <li key={item.custom_row_id} className={styles.summaryItem}>
                <span className={styles.summaryName}>{item.name} × {item.quantity}</span>
                <span className={styles.summaryPrice}>{currency.toUpperCase()} {(item.price[currency] * item.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <strong>{currency.toUpperCase()} {totalPrice(currency).toLocaleString()}</strong>
          </div>
          <Link to="/cart" className={styles.editCart}>← Edit cart</Link>
        </aside>
      </div>
    </main>
  );
}