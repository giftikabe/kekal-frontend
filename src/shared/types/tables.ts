export type FieldType =
  | 'text' | 'richtext' | 'number' | 'price' | 'image'
  | 'gallery' | 'boolean' | 'date' | 'select' | 'relation';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldOptions {
  choices?: SelectOption[];
  targetTableId?: string;
}

export interface FieldDef {
  id: string;
  tableId: string;
  key: string;
  label: string;
  type: FieldType;
  isRequired: boolean;
  options: FieldOptions | null;
  order: number;
}

export interface TableDef {
  id: string;
  name: string;
  label: string;
  category: string | null;
  isCommerce: boolean;
  icon: string | null;
  createdAt: string;
  fields: FieldDef[];
}

export type RowData = Record<string, unknown>;

export interface RelationPreview {
  id: string;
  label: string;
}

export interface CustomRow {
  id: string;
  tableId: string;
  data: RowData;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRows {
  rows: CustomRow[];
  total: number;
  page: number;
  pageSize: number;
}

// FieldDefDraft includes 'order' (not omitted)
export interface FieldDefDraft extends Omit<FieldDef, 'id' | 'tableId'> {
  id: string;
  isNewField: boolean;
}

export interface TableDefDraft {
  id: string | null;
  name: string;
  label: string;
  category: string;
  isCommerce: boolean;
  fields: FieldDefDraft[];
}