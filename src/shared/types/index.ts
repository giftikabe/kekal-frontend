/**
 * Kekal Living — Shared TypeScript Types
 *
 * These types mirror the backend's API response shapes.
 * Later parts (F2–F9) extend and use these as a baseline.
 */

// ─── API ──────────────────────────────────────────────────────────────────────

/** Standard success envelope */
export interface ApiSuccess<T> {
  data: T
}

/** Standard error shape */
export interface ApiErrorShape {
  error: {
    message: string
    code: string
  }
}

/** Typed API error thrown by the api client */
export class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AdminRole = 'super_admin' | 'editor'

export interface Admin {
  id: string
  email: string
  role: AdminRole
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// ─── Pages ────────────────────────────────────────────────────────────────────

export type PageStatus = 'draft' | 'published'

export interface Page {
  id: string
  slug: string
  title: string
  status: PageStatus
  is_system: boolean
  created_at: string
  updated_at: string
}

// ─── Component Instances ──────────────────────────────────────────────────────

export interface DataBinding {
  tableId: string
  mode: 'single' | 'list'
  rowId?: string
  filter?: Record<string, unknown>
}

export interface ComponentInstance {
  id: string
  component_key: string
  data_binding: DataBinding | null
  style_overrides: Record<string, string> | null
}

export interface PageSection {
  id: string
  order: number
  component_instance: ComponentInstance
}

export interface PageWithSections extends Page {
  sections: PageSection[]
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

export interface NavItem {
  id: string
  label: string
  page_id: string
  slug: string
  order: number
}

// ─── Brand ────────────────────────────────────────────────────────────────────

export interface Brand {
  id: string
  name: string
  tagline: string | null
  description: string | null
  logo_light_url: string | null
  logo_dark_url: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_address: string | null
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export interface SeoSettings {
  id: string
  page_id: string | null
  custom_row_id: string | null
  title: string
  description: string
  keywords: string[]
  structured_data: Record<string, unknown> | null
  is_manual_override: boolean
}

// ─── Commerce ─────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'failed'
  | 'cancelled'

export type CustomerType = 'local' | 'international'
export type Currency = 'etb' | 'usd'

// ─── Custom Tables ────────────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'richtext'
  | 'number'
  | 'price'
  | 'image'
  | 'gallery'
  | 'boolean'
  | 'date'
  | 'select'
  | 'relation'

export interface CustomFieldDef {
  id: string
  table_id: string
  key: string
  label: string
  type: FieldType
  is_required: boolean
  options: Record<string, unknown> | null
  order: number
}

export interface CustomTableDef {
  id: string
  name: string
  label: string
  is_commerce: boolean
  icon: string | null
  category: string | null
  created_at: string
  fields: CustomFieldDef[]
}

export interface CustomRow {
  id: string
  table_id: string
  data: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
