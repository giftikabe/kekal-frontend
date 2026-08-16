import { Link } from "react-router-dom";
import styles from "./AiSectionFlow.module.css";

interface PublishSuccessProps {
  commitUrl: string;
  componentKey: string;
  onReset: () => void;
}

export function PublishSuccess({ commitUrl, componentKey, onReset }: PublishSuccessProps) {
  return (
    <div className={styles.step}>
      <div className={styles.successIcon}>✓</div>
      <h2 className={styles.stepTitle}>Component published</h2>
      <p className={styles.stepDesc}>
        <strong>{componentKey}</strong> has been committed to the frontend repository and
        registered in the component library. Once the Cloudflare Pages build completes (usually
        under two minutes), it will appear in the Page Builder's component list.
      </p>

      {commitUrl && (
        <a
          href={commitUrl}
          target="_blank"
          rel="noreferrer"
          className={styles.commitLink}
        >
          View commit on GitHub →
        </a>
      )}

      <div className={styles.nextSteps}>
        <p className={styles.sectionLabel}>Next steps</p>
        <ol className={styles.nextList}>
          <li>Wait for the Cloudflare Pages build to finish.</li>
          <li>
            Open the{" "}
            <Link to="/admin/pages" className={styles.inlineLink}>
              Page Builder
            </Link>{" "}
            and select the page you want to add this section to.
          </li>
          <li>
            Find <strong>{componentKey}</strong> in the component library panel and drag it onto
            the canvas.
          </li>
          <li>Configure its data binding and style overrides in the section config panel.</li>
          <li>Publish the page when ready.</li>
        </ol>
      </div>

      <div className={styles.actions}>
        <button className={styles.ghostBtn} onClick={onReset}>
          Create another component
        </button>
        <Link to="/admin/pages" className={styles.primaryBtn}>
          Go to Page Builder
        </Link>
      </div>
    </div>
  );
}
