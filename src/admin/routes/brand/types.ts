// Types for the Brand, Nav & SEO admin settings screens (F7).
//
// These mirror the ACTUAL backend response shapes (see src/db/schema/system/*
// and src/lib/response.ts `ok()` on the backend). Drizzle returns camelCase
// JS field names for every table, and the backend never converts to
// snake_case anywhere — so these types (and every screen that reads them)
// must use camelCase too. They previously used snake_case, which meant every
// field silently read as `undefined` and every form appeared empty.

export interface BrandSettings {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
}

export type BrandSettingsInput = Omit<BrandSettings, "id">;

// Backend's listNav() returns a nested `page` object (see
// pagesService.listNav), not flat page_id/page_slug fields.
export interface NavItem {
  id: string;
  label: string;
  order: number;
  page: { id: string; slug: string; title: string };
}

export interface SeoRecord {
  id: string;
  pageId: string | null;
  pageLabel: string;
  pageSlug: string;
  title: string;
  description: string;
  keywords: string[];
  structuredData: Record<string, unknown>;
  isManualOverride: boolean;
  updatedAt: string;
}

export type SeoRecordInput = Pick<SeoRecord, "title" | "description" | "keywords">;

export interface CloudinarySignResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder?: string;
}
