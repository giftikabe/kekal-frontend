import { useEffect, useState } from "react";
import { apiClient } from "@/shared/api/client";
import type { BrandSettings, BrandSettingsInput } from "./types";
import { ImageUploadSlot } from "./ImageUploadSlot";
import styles from "./brand.module.css";

const EMPTY_BRAND: BrandSettingsInput = {
  name: "",
  tagline: "",
  description: "",
  logoLightUrl: null,
  logoDarkUrl: null,
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
};

export function BrandForm() {
  const [brand, setBrand] = useState<BrandSettingsInput>(EMPTY_BRAND);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">(
    "idle"
  );

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<BrandSettings>("/api/brand")
      .then((data) => {
        if (cancelled) return;
        const { id, ...rest } = data;
        setBrand(rest);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof BrandSettingsInput>(
    key: K,
    value: BrandSettingsInput[K]
  ) {
    setBrand((prev) => ({ ...prev, [key]: value }));
    setSaveState("idle");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveState("idle");
    try {
      await apiClient.patch<BrandSettings>("/api/brand", brand);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className={styles.loading}>Loading brand settings…</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Identity</h2>

        <label className={styles.field}>
          <span>Name</span>
          <input
            type="text"
            value={brand.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Tagline</span>
          <input
            type="text"
            value={brand.tagline ?? ""}
            onChange={(e) => update("tagline", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Description</span>
          <textarea
            rows={4}
            value={brand.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
          />
        </label>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Logo</h2>
        <div className={styles.uploadRow}>
          <ImageUploadSlot
            label="Light background (black logo)"
            currentUrl={brand.logoLightUrl}
            previewBackground="light"
            onUploaded={(url) => update("logoLightUrl", url)}
          />
          <ImageUploadSlot
            label="Dark background (white logo)"
            currentUrl={brand.logoDarkUrl}
            previewBackground="dark"
            onUploaded={(url) => update("logoDarkUrl", url)}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact</h2>

        <label className={styles.field}>
          <span>Email</span>
          <input
            type="email"
            value={brand.contactEmail ?? ""}
            onChange={(e) => update("contactEmail", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Phone</span>
          <input
            type="tel"
            value={brand.contactPhone ?? ""}
            onChange={(e) => update("contactPhone", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Address</span>
          <textarea
            rows={2}
            value={brand.contactAddress ?? ""}
            onChange={(e) => update("contactAddress", e.target.value)}
          />
        </label>
      </section>

      <div className={styles.formFooter}>
        {saveState === "saved" && (
          <span className={styles.statusSaved}>Saved</span>
        )}
        {saveState === "error" && (
          <span className={styles.statusError}>
            Couldn't save. Try again.
          </span>
        )}
        <button type="submit" className={styles.primaryButton} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
