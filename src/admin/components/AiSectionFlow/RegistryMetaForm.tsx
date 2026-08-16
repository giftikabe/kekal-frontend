import styles from "./AiSectionFlow.module.css";

export interface RegistryMeta {
  componentKey: string;
  label: string;
  category: string;
}

interface RegistryMetaFormProps {
  meta: RegistryMeta;
  onChange: (meta: RegistryMeta) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORIES = [
  "Hero",
  "Content",
  "Media",
  "Commerce",
  "Navigation",
  "Forms",
  "Miscellaneous",
];

export function RegistryMetaForm({ meta, onChange, onNext, onBack }: RegistryMetaFormProps) {
  const isValid =
    /^[a-z][a-z0-9_-]*$/.test(meta.componentKey) &&
    meta.label.trim().length > 0 &&
    meta.category.trim().length > 0;

  function set<K extends keyof RegistryMeta>(key: K, value: RegistryMeta[K]) {
    onChange({ ...meta, [key]: value });
  }

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>3 — Registry details</h2>
      <p className={styles.stepDesc}>
        These values are used to register the component in the library. The key becomes the
        permanent identifier — choose carefully, it cannot be changed after publishing.
      </p>

      <label className={styles.label}>
        Component key{" "}
        <span className={styles.hint}>(lowercase, letters/numbers/hyphens, e.g. hero-video)</span>
        <input
          className={styles.input}
          value={meta.componentKey}
          onChange={(e) => set("componentKey", e.target.value.toLowerCase().replace(/\s/g, "-"))}
          placeholder="hero-video"
        />
        {meta.componentKey && !/^[a-z][a-z0-9_-]*$/.test(meta.componentKey) && (
          <span className={styles.fieldError}>
            Must start with a letter and contain only lowercase letters, numbers, hyphens, or
            underscores.
          </span>
        )}
      </label>

      <label className={styles.label}>
        Display label <span className={styles.hint}>(shown in the Page Builder UI)</span>
        <input
          className={styles.input}
          value={meta.label}
          onChange={(e) => set("label", e.target.value)}
          placeholder="Hero with Video"
        />
      </label>

      <label className={styles.label}>
        Category
        <select
          className={styles.select}
          value={meta.category}
          onChange={(e) => set("category", e.target.value)}
        >
          <option value="">— select —</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.actions}>
        <button className={styles.ghostBtn} onClick={onBack}>
          ← Back
        </button>
        <button className={styles.primaryBtn} disabled={!isValid} onClick={onNext}>
          Preview →
        </button>
      </div>
    </div>
  );
}
