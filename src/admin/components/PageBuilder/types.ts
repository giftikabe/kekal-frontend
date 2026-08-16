// Shared types for the Page Builder admin feature.
// Mirrors the shapes documented in B5 (pages/sections API) and B4 (custom tables API).

export type PageStatus = 'draft' | 'published';

export interface PageSummary {
  id: string;
  slug: string;
  title: string;
  status: PageStatus;
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** A single-table "equals" filter used for list bindings, e.g. { field: 'category', equals: 'rings' } */
export interface RowFilter {
  field: string;
  equals: string;
}

export interface DataBinding {
  tableId: string;
  mode: 'single' | 'list';
  /** Used when mode === 'single' */
  rowId?: string | null;
  /** Used when mode === 'list' */
  filter?: RowFilter | null;
  /**
   * Maps the keys the target component expects in its `data` prop (derived from the
   * component's previewProps shape in the registry) to the custom field key on the table
   * that should fill that slot. e.g. { title: 'name', image: 'heroImage' }
   */
  fieldMap?: Record<string, string>;
}

export interface StyleOverrides {
  background?: string;
  spacing?: string;
  textAlign?: 'left' | 'center' | 'right';
  [key: string]: string | undefined;
}

export interface ComponentInstance {
  id: string;
  componentKey: string;
  dataBinding: DataBinding | null;
  styleOverrides: StyleOverrides | null;
}

export interface PageSection {
  id: string;
  order: number;
  componentInstance: ComponentInstance;
}

export interface PageDetail {
  page: PageSummary;
  sections: PageSection[];
}

export interface CustomFieldDef {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'richtext' | 'number' | 'price' | 'image' | 'gallery' | 'boolean' | 'date' | 'select' | 'relation';
  isRequired: boolean;
  options?: unknown;
  order: number;
}

export interface CustomTableDef {
  id: string;
  name: string;
  label: string;
  category: string | null;
  isCommerce: boolean;
  fields: CustomFieldDef[];
}

export interface CustomRow {
  id: string;
  tableId: string;
  data: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
