import { useState } from "react";
import { BrandForm } from "./BrandForm";
import { NavReorder } from "./NavReorder";
import styles from "./brand.module.css";

type Tab = "brand" | "navigation";

export default function BrandSettingsPage() {
  const [tab, setTab] = useState<Tab>("brand");

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Brand</h1>
        <p className={styles.pageSubtitle}>
          Identity, logos, contact details, and menu order — everything the
          storefront pulls from globally.
        </p>
      </header>

      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "brand"}
          className={styles.tab}
          data-active={tab === "brand"}
          onClick={() => setTab("brand")}
        >
          Brand
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "navigation"}
          className={styles.tab}
          data-active={tab === "navigation"}
          onClick={() => setTab("navigation")}
        >
          Navigation
        </button>
      </div>

      <div className={styles.tabPanel}>
        {tab === "brand" ? <BrandForm /> : <NavReorder />}
      </div>
    </div>
  );
}
