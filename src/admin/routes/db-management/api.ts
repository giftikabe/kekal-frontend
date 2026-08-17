// Thin wrappers around B4's custom-table engine endpoints.

import { apiClient } from '../../../shared/api/client';
import type { CustomRow, PaginatedRows, TableDef } from '../../../shared/types/tables';

export interface TableDefInput {
  name: string;
  label: string;
  category: string;
  isCommerce: boolean;
  fields: Array<{
    id?: string; // present when editing an existing field
    key: string;
    label: string;
    type: TableDef['fields'][number]['type'];
    isRequired: boolean;
    options: TableDef['fields'][number]['options'];
    order: number;
  }>;
}

export function listTables() {
  return apiClient.get<TableDef[]>('/api/tables');
}

export function createTable(input: TableDefInput) {
  return apiClient.post<TableDef>('/api/tables', input);
}

export function updateTable(id: string, input: Partial<TableDefInput>) {
  return apiClient.patch<TableDef>(`/api/tables/${id}`, input);
}

export function deleteTable(id: string) {
  return apiClient.delete<void>(`/api/tables/${id}`);
}

export function listRows(tableId: string, page = 1, pageSize = 25) {
  return apiClient.get<PaginatedRows>(
    `/api/tables/${tableId}/rows?page=${page}&pageSize=${pageSize}`
  );
}

export function getRow(tableId: string, rowId: string) {
  return apiClient.get<CustomRow>(`/api/tables/${tableId}/rows/${rowId}`);
}

// IMPORTANT: the backend (src/modules/tables/router.ts + service.ts) expects
// the row's field values as the request body directly — NOT wrapped in
// `{ data: ... }`. It does its own wrapping internally when it writes to the
// `custom_rows.data` jsonb column. Sending `{ data }` here meant every field
// key showed up as "missing" to validateRowData and every create/update
// failed with a 422.
export function createRow(tableId: string, data: Record<string, unknown>) {
  return apiClient.post<CustomRow>(`/api/tables/${tableId}/rows`, data);
}

export function updateRow(tableId: string, rowId: string, data: Record<string, unknown>) {
  return apiClient.patch<CustomRow>(`/api/tables/${tableId}/rows/${rowId}`, data);
}

export function deleteRow(tableId: string, rowId: string) {
  return apiClient.delete<void>(`/api/tables/${tableId}/rows/${rowId}`);
}
