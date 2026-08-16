import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../shared/api/client";
import { DashboardShell } from "../../components/layout/DashboardShell";
import { ProtectedRoute } from "../../auth/ProtectedRoute";
import styles from "./commerce.module.css";

interface CommerceSettings {
  is_active: boolean;
  chapa_public_key: string;
  chapa_secret_key: string;
  webhook_url: string;
}

interface OrderItem {
  id: string;
  custom_row_id: string;
  quantity: number;
  unit_price: number;
  currency: "etb" | "usd";
}

interface Order {
  id: string;
  order_number: string;
  customer_type: "local" | "international";
  contact_name: string;
  contact_phone?: string;
  shipping_address?: Record<string, string>;
  currency: "etb" | "usd";
  total_amount: number;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "failed" | "cancelled";
  created_at: string;
  items?: OrderItem[];
  payment?: { chapa_tx_ref: string; status: string };
  shipment?: { status: string; tracking_note: string };
}

const ORDER_STATUSES = [
  "all", "pending", "paid", "processing", "shipped", "delivered", "failed", "cancelled",
] as const;

function ChapaSetupForm({ settings, onSaved }: { settings: CommerceSettings | null; onSaved: (s: CommerceSettings) => void }) {
  const [publicKey, setPublicKey] = useState(settings?.chapa_public_key ?? "");
  const [secretKey, setSecretKey] = useState(settings?.chapa_secret_key ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await apiClient.post<CommerceSettings>("/api/commerce/settings", {
        chapa_public_key: publicKey,
        chapa_secret_key: secretKey,
      });
      onSaved(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const copyWebhook = () => {
    if (settings?.webhook_url) {
      navigator.clipboard.writeText(settings.webhook_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Chapa Payment Integration</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          Chapa Public Key
          <input className={styles.input} type="text" value={publicKey} onChange={(e) => setPublicKey(e.target.value)} placeholder="CHAPUBK-..." required />
        </label>
        <label className={styles.label}>
          Chapa Secret Key
          <input className={styles.input} type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="CHASECK-..." required />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.btnPrimary} disabled={saving}>
          {saving ? "Saving…" : "Save & Activate"}
        </button>
      </form>
      {settings?.is_active && settings.webhook_url && (
        <div className={styles.webhookBox}>
          <p className={styles.webhookLabel}>
            ✅ Chapa is active. Paste this webhook URL into your{" "}
            <a href="https://dashboard.chapa.co" target="_blank" rel="noreferrer" className={styles.link}>Chapa dashboard</a>:
          </p>
          <div className={styles.webhookRow}>
            <code className={styles.webhookUrl}>{settings.webhook_url}</code>
            <button type="button" className={styles.btnSecondary} onClick={copyWebhook}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function SetupChecklist() {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Next Steps</h2>
      <ol className={styles.checklist}>
        <li>Go to <strong>Pages</strong> → open or create a product page.</li>
        <li>In the Page Builder, drag an <strong>AddToCart</strong> component onto the page and bind it to a product row.</li>
        <li>Publish the page — customers can now add items and check out.</li>
        <li>Paste the webhook URL above into your <strong>Chapa Dashboard → Webhooks</strong>.</li>
      </ol>
    </section>
  );
}

function OrderDetailModal({ order, onClose, onUpdated }: { order: Order; onClose: () => void; onUpdated: (o: Order) => void }) {
  const [orderStatus, setOrderStatus] = useState(order.status);
  const [shipStatus, setShipStatus] = useState(order.shipment?.status ?? "");
  const [trackingNote, setTrackingNote] = useState(order.shipment?.tracking_note ?? "");
  const [saving, setSaving] = useState(false);

  const saveOrderStatus = async () => {
    setSaving(true);
    try {
      const updated = await apiClient.patch<Order>(`/api/commerce/orders/${order.id}/status`, { status: orderStatus });
      onUpdated(updated);
    } finally { setSaving(false); }
  };

  const saveShipment = async () => {
    setSaving(true);
    try {
      const updated = await apiClient.patch<Order>(`/api/commerce/orders/${order.id}/shipment`, {
        status: shipStatus, tracking_note: trackingNote,
      });
      onUpdated(updated);
    } finally { setSaving(false); }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        <h2 className={styles.cardTitle}>Order {order.order_number}</h2>
        <div className={styles.detailGrid}>
          <span className={styles.detailKey}>Customer</span><span>{order.contact_name}</span>
          <span className={styles.detailKey}>Type</span><span className={styles.badge}>{order.customer_type}</span>
          {order.contact_phone && (<><span className={styles.detailKey}>Phone</span><span>{order.contact_phone}</span></>)}
          {order.shipping_address && (
            <><span className={styles.detailKey}>Ship To</span><span>{Object.values(order.shipping_address).filter(Boolean).join(", ")}</span></>
          )}
          <span className={styles.detailKey}>Total</span>
          <span>{order.total_amount.toLocaleString()} {order.currency.toUpperCase()}</span>
          <span className={styles.detailKey}>Payment</span>
          <span>{order.payment?.chapa_tx_ref ?? "—"} ({order.payment?.status ?? "pending"})</span>
          <span className={styles.detailKey}>Placed</span>
          <span>{new Date(order.created_at).toLocaleString()}</span>
        </div>

        {order.items && order.items.length > 0 && (
          <>
            <h3 className={styles.subTitle}>Items</h3>
            <table className={styles.table}>
              <thead><tr><th>Row ID</th><th>Qty</th><th>Unit Price</th><th>Currency</th></tr></thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.mono}>{item.custom_row_id}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit_price.toLocaleString()}</td>
                    <td>{item.currency.toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <h3 className={styles.subTitle}>Order Status</h3>
        <div className={styles.row}>
          <select className={styles.select} value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as Order["status"])}>
            {ORDER_STATUSES.filter((s) => s !== "all").map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="button" className={styles.btnPrimary} onClick={saveOrderStatus} disabled={saving}>Update</button>
        </div>

        <h3 className={styles.subTitle}>Shipment</h3>
        <div className={styles.shipmentForm}>
          <input className={styles.input} type="text" placeholder="Shipment status" value={shipStatus} onChange={(e) => setShipStatus(e.target.value)} />
          <input className={styles.input} type="text" placeholder="Tracking note" value={trackingNote} onChange={(e) => setTrackingNote(e.target.value)} />
          <button type="button" className={styles.btnPrimary} onClick={saveShipment} disabled={saving}>Save Shipment</button>
        </div>
      </div>
    </div>
  );
}

function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const qs = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await apiClient.get<Order[]>(`/api/commerce/orders${qs}`);
      setOrders(res);
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openOrder = async (order: Order) => {
    try {
      const detail = await apiClient.get<Order>(`/api/commerce/orders/${order.id}`);
      setSelectedOrder(detail);
    } catch { setSelectedOrder(order); }
  };

  const handleUpdated = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedOrder(updated);
  };

  return (
    <section className={styles.card}>
      <div className={styles.ordersHeader}>
        <h2 className={styles.cardTitle}>Orders</h2>
        <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
        </select>
      </div>

      {loading ? (
        <p className={styles.muted}>Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className={styles.muted}>No orders found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr><th>Order #</th><th>Customer</th><th>Type</th><th>Total</th><th>Status</th><th>Placed</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className={styles.clickableRow} onClick={() => openOrder(o)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && openOrder(o)}>
                <td className={styles.mono}>{o.order_number}</td>
                <td>{o.contact_name}</td>
                <td><span className={styles.badge}>{o.customer_type}</span></td>
                <td>{o.total_amount.toLocaleString()} {o.currency.toUpperCase()}</td>
                <td><span className={`${styles.statusBadge} ${styles[`status_${o.status}` as keyof typeof styles]}`}>{o.status}</span></td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdated={handleUpdated} />
      )}
    </section>
  );
}

export default function CommercePage() {
  const [settings, setSettings] = useState<CommerceSettings | null>(null);

  useEffect(() => {
    apiClient.get<CommerceSettings>("/api/commerce/settings").then(setSettings).catch(() => {});
  }, []);

  return (
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <DashboardShell>
        <div className={styles.page}>
          <h1 className={styles.pageTitle}>Commerce</h1>
          <ChapaSetupForm settings={settings} onSaved={(s) => setSettings(s)} />
          {settings?.is_active && <SetupChecklist />}
          <OrdersTable />
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}