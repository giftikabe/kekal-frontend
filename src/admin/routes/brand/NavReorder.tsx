import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/shared/api/client";
import type { NavItem } from "./types";
import styles from "./brand.module.css";

export function NavReorder() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<NavItem[]>("/api/nav")
      .then((data) => {
        if (!cancelled) setItems([...data].sort((a, b) => a.order - b.order));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, overIndex: number) {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === overIndex) return;

    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(overIndex, 0, moved);
      return next;
    });
    dragIndex.current = overIndex;
  }

  async function handleDragEnd() {
    dragIndex.current = null;
    const orderedIds = items.map((item) => item.id);
    try {
      await apiClient.patch("/api/nav/reorder", { order: orderedIds });
    } catch {
      // Reordering failed silently — refetch to fall back to the server's truth.
      const fresh = await apiClient.get<NavItem[]>("/api/nav");
      setItems([...fresh].sort((a, b) => a.order - b.order));
    }
  }

  function handleLabelChange(id: string, label: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label } : item))
    );
  }

  async function handleLabelBlur(item: NavItem) {
    setSavingId(item.id);
    try {
      await apiClient.patch(`/api/nav/${item.id}`, { label: item.label });
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading) {
    return <p className={styles.loading}>Loading navigation…</p>;
  }

  if (items.length === 0) {
    return <p className={styles.empty}>No nav items yet — add a page to create one.</p>;
  }

  return (
    <ul className={styles.navList}>
      {items.map((item, index) => (
        <li
          key={item.id}
          className={styles.navItem}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
        >
          <span className={styles.dragHandle} aria-hidden="true">
            ⠿
          </span>
          <input
            className={styles.navLabelInput}
            value={item.label}
            onChange={(e) => handleLabelChange(item.id, e.target.value)}
            onBlur={() => handleLabelBlur(item)}
          />
          <span className={styles.navSlug}>/{item.page_slug}</span>
          {savingId === item.id && (
            <span className={styles.savingHint}>Saving…</span>
          )}
        </li>
      ))}
    </ul>
  );
}
