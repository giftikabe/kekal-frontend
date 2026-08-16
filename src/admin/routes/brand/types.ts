// Types for the Brand, Nav & SEO admin settings screens (F7).
//
// These mirror the backend shapes described in the F7 build prompt.
// If B5/B7 end up naming fields slightly differently, adjust here —
// every screen in this feature imports from this one file.

export interface BrandSettings {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo_light_url: string | null;
  logo_dark_url: string | null;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
}

export type BrandSettingsInput = Omit<BrandSettings, "id">;

export interface NavItem {
  id: string;
  label: string;
  order: number;
  page_id: string;
  page_slug: string;
}

export interface SeoRecord {
  id: string;
  page_id: string;
  page_label: string;
  page_slug: string;
  title: string;
  description: string;
  keywords: string[];
  structured_data: Record<string, unknown>;
  is_manual_override: boolean;
  updated_at: string;
}

export type SeoRecordInput = Pick<
  SeoRecord,
  "title" | "description" | "keywords"
>;

export interface CloudinarySignResponse {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  signature: string;
  folder?: string;
}
