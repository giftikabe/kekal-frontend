import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPage, fetchPages } from '../../components/PageBuilder/api';
import type { PageSummary } from '../../components/PageBuilder/types';
import styles from './pages.module.css';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function PagesIndexRoute() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPages()
      .then((result) => {
        if (!cancelled) setPages(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load pages.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setFormError('Both a title and a slug are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const page = await createPage({ title: title.trim(), slug: slug.trim() });
      navigate(`/admin/pages/${page.id}/builder`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create the page.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pages</h1>
          <p className={styles.subtitle}>Every page on Kekal Living, system and custom.</p>
        </div>
        <button type="button" className={styles.newPageButton} onClick={() => setIsCreating(true)}>
          New page
        </button>
      </div>

      {loading && <p className={styles.stateText}>Loading pages…</p>}
      {error && <p className={styles.stateTextError}>{error}</p>}

      {!loading && !error && pages.length === 0 && (
        <p className={styles.stateText}>No pages yet — create the first one above.</p>
      )}

      {!loading && !error && pages.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td>{page.title}</td>
                <td className={styles.slugCell}>/{page.slug}</td>
                <td>
                  <span className={`${styles.statusBadge} ${page.status === 'published' ? styles.statusLive : ''}`}>
                    {page.status}
                  </span>
                </td>
                <td className={styles.rowAction}>
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => navigate(`/admin/pages/${page.id}/builder`)}
                  >
                    Open builder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isCreating && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="New page">
          <form className={styles.modal} onSubmit={handleCreate}>
            <h2 className={styles.modalTitle}>New page</h2>
            <label className={styles.modalLabel}>
              Title
              <input
                className={styles.modalInput}
                type="text"
                value={title}
                autoFocus
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="About Us"
              />
            </label>
            <label className={styles.modalLabel}>
              Slug
              <input
                className={styles.modalInput}
                type="text"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                placeholder="about-us"
              />
            </label>
            {formError && <p className={styles.stateTextError}>{formError}</p>}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setIsCreating(false);
                  setTitle('');
                  setSlug('');
                  setSlugTouched(false);
                  setFormError(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className={styles.newPageButton} disabled={submitting}>
                {submitting ? 'Creating…' : 'Create & open builder'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
