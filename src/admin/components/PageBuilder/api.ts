// Thin wrapper around the shared typed fetch client (src/shared/api/client.ts, built in F1)
// for every endpoint the Page Builder needs.
import { apiClient } from '../../../shared/api/client';
import type {
  CustomRow,
  CustomTableDef,
  DataBinding,
  PageDetail,
  PageSummary,
  StyleOverrides,
} from './types';

export async function fetchPages(): Promise<PageSummary[]> {
  return apiClient.get<PageSummary[]>('/api/pages');
}

export async function createPage(input: { title: string; slug: string }): Promise<PageSummary> {
  // Backend returns { page, navEntry } (POST /api/pages), not the page row
  // directly — unwrap it here so callers can keep using PageSummary.
  const result = await apiClient.post<{ page: PageSummary; navEntry: unknown }>('/api/pages', input);
  return result.page;
}

export async function fetchPageById(pageId: string): Promise<PageDetail> {
  // Requires the backend's GET /api/pages/id/:id route (added alongside this fix —
  // it previously didn't exist, so this always 404'd).
  return apiClient.get<PageDetail>(`/api/pages/id/${pageId}`);
}

export async function addSection(
  pageId: string,
  input: { componentKey: string; dataBinding?: DataBinding | null }
): Promise<PageDetail['sections'][number]> {
  // Backend's createSectionSchema (Zod) expects camelCase keys.
  return apiClient.post(`/api/pages/${pageId}/sections`, {
    componentKey: input.componentKey,
    dataBinding: input.dataBinding ?? null,
  });
}

export async function reorderSections(pageId: string, orderedSectionIds: string[]): Promise<void> {
  // Backend's reorderSectionsSchema expects { orderedSectionIds }, not { order }.
  await apiClient.patch(`/api/pages/${pageId}/sections/reorder`, {
    orderedSectionIds,
  });
}

export async function updateSectionInstance(
  instanceId: string,
  patch: { dataBinding?: DataBinding | null; styleOverrides?: StyleOverrides | null }
): Promise<void> {
  // Backend's updateSectionInstanceSchema expects camelCase keys.
  await apiClient.patch(`/api/sections/${instanceId}`, {
    dataBinding: patch.dataBinding,
    styleOverrides: patch.styleOverrides,
  });
}

export async function deleteSection(pageId: string, sectionId: string): Promise<void> {
  // The backend only exposes this as a nested route under the page
  // (DELETE /api/pages/:pageId/sections/:sectionId) — there is no bare
  // /api/sections/:id delete route.
  await apiClient.delete(`/api/pages/${pageId}/sections/${sectionId}`);
}

export async function fetchTables(): Promise<CustomTableDef[]> {
  return apiClient.get<CustomTableDef[]>('/api/tables');
}

export async function fetchTableRows(
  tableId: string,
  params?: { filterField?: string; filterEquals?: string }
): Promise<CustomRow[]> {
  // The backend's GET /api/tables/:tableId/rows returns a paginated envelope
  // ({ rows, total, page, pageSize }), not a bare array — and it doesn't
  // support server-side field filtering at all. Unwrap `.rows` and filter
  // client-side as a stopgap so bound list sections render correctly.
  const result = await apiClient.get<{ rows: CustomRow[]; total: number }>(
    `/api/tables/${tableId}/rows?pageSize=100`
  );
  let rows = result.rows ?? [];
  if (params?.filterField && params?.filterEquals) {
    const { filterField, filterEquals } = params;
    rows = rows.filter((row) => String((row.data as Record<string, unknown>)?.[filterField]) === filterEquals);
  }
  return rows;
}

export async function publishPage(pageId: string): Promise<void> {
  await apiClient.post(`/api/publish/page/${pageId}`, {});
}
