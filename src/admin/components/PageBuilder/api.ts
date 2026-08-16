// Thin wrapper around the shared typed fetch client (src/shared/api/client.ts, built in F1)
// for every endpoint the Page Builder needs.
//
// Assumption: src/shared/api/client.ts exports `apiClient` with `get`/`post`/`patch`/`delete`
// generic methods (base URL + auth header + 401 refresh retry handled inside that module).
// If the real export differs (e.g. default export, different method names), only this file
// needs to change — nothing else in the Page Builder talks to fetch/axios directly.
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
  return apiClient.post<PageSummary>('/api/pages', input);
}

export async function fetchPageById(pageId: string): Promise<PageDetail> {
  // GET /api/pages/:slug is the public/by-slug shape from B5; the builder also needs to look
  // pages up by id, so this calls the equivalent by-id path. Adjust if B5's admin route differs.
  return apiClient.get<PageDetail>(`/api/pages/id/${pageId}`);
}

export async function addSection(
  pageId: string,
  input: { componentKey: string; dataBinding?: DataBinding | null }
): Promise<PageDetail['sections'][number]> {
  return apiClient.post(`/api/pages/${pageId}/sections`, {
    component_key: input.componentKey,
    data_binding: input.dataBinding ?? null,
  });
}

export async function reorderSections(pageId: string, orderedSectionIds: string[]): Promise<void> {
  await apiClient.patch(`/api/pages/${pageId}/sections/reorder`, {
    order: orderedSectionIds,
  });
}

export async function updateSectionInstance(
  instanceId: string,
  patch: { dataBinding?: DataBinding | null; styleOverrides?: StyleOverrides | null }
): Promise<void> {
  await apiClient.patch(`/api/sections/${instanceId}`, {
    data_binding: patch.dataBinding,
    style_overrides: patch.styleOverrides,
  });
}

export async function deleteSection(sectionId: string): Promise<void> {
  await apiClient.delete(`/api/sections/${sectionId}`);
}

export async function fetchTables(): Promise<CustomTableDef[]> {
  return apiClient.get<CustomTableDef[]>('/api/tables');
}

export async function fetchTableRows(
  tableId: string,
  params?: { filterField?: string; filterEquals?: string }
): Promise<CustomRow[]> {
  const query = new URLSearchParams();
  if (params?.filterField && params?.filterEquals) {
    query.set('filterField', params.filterField);
    query.set('filterEquals', params.filterEquals);
  }
  const qs = query.toString();
  return apiClient.get<CustomRow[]>(`/api/tables/${tableId}/rows${qs ? `?${qs}` : ''}`);
}

export async function publishPage(pageId: string): Promise<void> {
  await apiClient.post(`/api/publish/page/${pageId}`, {});
}
