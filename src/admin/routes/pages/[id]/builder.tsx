import  { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ComponentLibraryPanel } from '../../../components/PageBuilder/ComponentLibraryPanel';
import { Canvas } from '../../../components/PageBuilder/Canvas';
import { SectionConfigPanel } from '../../../components/PageBuilder/SectionConfigPanel';
import {
  addSection,
  deleteSection,
  fetchPageById,
  publishPage,
  reorderSections,
  updateSectionInstance,
} from '../../../components/PageBuilder/api';
import type { DataBinding, PageDetail, StyleOverrides } from '../../../components/PageBuilder/types';
import styles from './builder.module.css';
import panelStyles from '../../../components/PageBuilder/PageBuilder.module.css';

export default function PageBuilderRoute() {
  const { id: pageId } = useParams<{ id: string }>();

  const [pageDetail, setPageDetail] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [addingComponentKey, setAddingComponentKey] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  const loadPage = useCallback(async () => {
    if (!pageId) return;
    setError(null);
    try {
      const detail = await fetchPageById(pageId);
      setPageDetail(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this page.');
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    setLoading(true);
    loadPage();
  }, [loadPage]);

  async function handleAddComponent(componentKey: string, atIndex?: number) {
    if (!pageId) return;
    setAddingComponentKey(componentKey);
    try {
      await addSection(pageId, { componentKey, dataBinding: null });
      const detail = await fetchPageById(pageId);
      if (typeof atIndex === 'number' && atIndex < detail.sections.length - 1) {
        const ids = detail.sections.map((s) => s.id);
        const newId = ids[ids.length - 1];
        const reordered = ids.slice(0, -1);
        reordered.splice(atIndex, 0, newId);
        await reorderSections(pageId, reordered);
        setPageDetail(await fetchPageById(pageId));
      } else {
        setPageDetail(detail);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that component.');
    } finally {
      setAddingComponentKey(null);
    }
  }

  async function handleReorder(orderedSectionIds: string[]) {
    if (!pageId || !pageDetail) return;
    const bySectionId = new Map(pageDetail.sections.map((s) => [s.id, s]));
    const nextSections = orderedSectionIds
      .map((id, index) => {
        const section = bySectionId.get(id);
        return section ? { ...section, order: index } : null;
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
    setPageDetail({ ...pageDetail, sections: nextSections });
    try {
      await reorderSections(pageId, orderedSectionIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the new order.');
      loadPage();
    }
  }

  async function handleDeleteSection(sectionId: string) {
    if (!pageId) return;
    if (selectedSectionId === sectionId) setSelectedSectionId(null);
    try {
      await deleteSection(pageId, sectionId);
      setPageDetail(await fetchPageById(pageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that section.');
    }
  }

  async function handleSaveSectionConfig(patch: {
    dataBinding?: DataBinding | null;
    styleOverrides?: StyleOverrides | null;
  }) {
    if (!pageId || !selectedSectionId) return;
    try {
      await updateSectionInstance(selectedSectionId, patch);
      setPageDetail(await fetchPageById(pageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save those changes.');
    }
  }

  async function handlePublish() {
    if (!pageId) return;
    setPublishing(true);
    setPublishMessage(null);
    try {
      await publishPage(pageId);
      setPublishMessage('Published.');
      setPageDetail((current) => (current ? { ...current, page: { ...current.page, status: 'published' } } : current));
    } catch (err) {
      setPublishMessage(err instanceof Error ? err.message : 'Could not publish this page.');
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return <p className={styles.stateText}>Loading builder…</p>;
  }

  if (error && !pageDetail) {
    return <p className={styles.stateTextError}>{error}</p>;
  }

  if (!pageDetail) {
    return null;
  }

  const selectedSection = pageDetail.sections.find((s) => s.id === selectedSectionId) ?? null;

  return (
    <div className={styles.builderPage}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <Link to="/admin/pages" className={styles.backLink}>
            ← Pages
          </Link>
          <div>
            <h1 className={styles.pageTitle}>{pageDetail.page.title}</h1>
            <span className={styles.pageSlug}>/{pageDetail.page.slug}</span>
          </div>
          <span
            className={`${styles.statusBadge} ${pageDetail.page.status === 'published' ? styles.statusLive : ''}`}
          >
            {pageDetail.page.status}
          </span>
        </div>
        <div className={styles.topBarRight}>
          {publishMessage && <span className={styles.publishMessage}>{publishMessage}</span>}
          <button type="button" className={panelStyles.primaryButton} onClick={handlePublish} disabled={publishing}>
            {publishing ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>

      {error && <p className={styles.stateTextError}>{error}</p>}

      <div
        className={panelStyles.builderLayout}
        style={!selectedSection ? { gridTemplateColumns: '220px 1fr' } : undefined}
      >
        <ComponentLibraryPanel onAddComponent={handleAddComponent} addingComponentKey={addingComponentKey} />
        <Canvas
          sections={pageDetail.sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
          onDeleteSection={handleDeleteSection}
          onReorder={handleReorder}
          onDropNewComponent={handleAddComponent}
        />
        {selectedSection && (
          <SectionConfigPanel
            section={selectedSection}
            onSave={handleSaveSectionConfig}
            onClose={() => setSelectedSectionId(null)}
          />
        )}
      </div>
    </div>
  );
}
