/**
 * Dynamic page route — resolves any slug against the backend's pages table
 * and renders its ordered sections via the component registry.
 *
 * FIXED:
 * - Field names were snake_case (component_key, data_binding, style_overrides)
 *   but the backend (pagesService.ts) always returns camelCase Drizzle rows —
 *   every binding read as `undefined`.
 * - Data bindings were never resolved; every section rendered its registry
 *   placeholder (previewProps) regardless of what was actually bound in the
 *   Page Builder. Ported the same resolveSectionData logic used by the admin
 *   Canvas (admin/components/PageBuilder/Canvas.tsx) so real customers see
 *   real content.
 */

import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { apiClient } from '@/shared/api/client'
import { componentRegistry } from '@/shared/componentLibrary/registry'
import type { DataBinding } from '@/admin/components/PageBuilder/types'

interface ComponentInstance {
  id: string
  componentKey: string
  dataBinding: DataBinding | null
  styleOverrides: Record<string, string> | null
}

interface Section {
  id: string
  order: number
  componentInstance: ComponentInstance
}

interface PageData {
  page: { id: string; slug: string; title: string; status: string }
  sections: Section[]
}

interface CustomRow {
  id: string
  tableId: string
  data: Record<string, unknown>
}

async function fetchTableRows(
  tableId: string,
  params?: { filterField?: string; filterEquals?: string },
): Promise<CustomRow[]> {
  const result = await apiClient.get<{ rows: CustomRow[]; total: number }>(
    `/api/tables/${tableId}/rows?pageSize=100`,
  )
  let rows = result.rows ?? []
  if (params?.filterField && params?.filterEquals) {
    const { filterField, filterEquals } = params
    rows = rows.filter(
      (row) => String((row.data as Record<string, unknown>)?.[filterField]) === filterEquals,
    )
  }
  return rows
}

async function resolveSectionData(binding: DataBinding | null, previewProps: unknown): Promise<unknown> {
  if (!binding) return previewProps

  const rows = await fetchTableRows(binding.tableId, {
    filterField: binding.mode === 'single' ? 'id' : binding.filter?.field,
    filterEquals: binding.mode === 'single' ? binding.rowId ?? undefined : binding.filter?.equals,
  })

  const applyFieldMap = (row: CustomRow): Record<string, unknown> => {
    if (!binding.fieldMap) return row.data
    const mapped: Record<string, unknown> = {}
    for (const [targetKey, sourceFieldKey] of Object.entries(binding.fieldMap)) {
      mapped[targetKey] = row.data[sourceFieldKey]
    }
    return mapped
  }

  if (binding.mode === 'single') {
    const row = rows[0]
    return row ? applyFieldMap(row) : previewProps
  }

  return rows.map(applyFieldMap)
}

export default function SlugPage() {
  const { slug } = useParams<{ slug: string }>()
  const [data, setData] = useState<PageData | null>(null)
  const [resolvedData, setResolvedData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setNotFound(false)

    apiClient
      .get<PageData>(`/api/pages/${slug}`)
      .then(async (pageData) => {
        if (cancelled) return
        setData(pageData)

        const entries = await Promise.all(
          pageData.sections.map(async (section) => {
            const entry = componentRegistry[section.componentInstance.componentKey]
            const resolved = await resolveSectionData(
              section.componentInstance.dataBinding,
              entry?.previewProps,
            )
            return [section.id, resolved] as const
          }),
        )
        if (!cancelled) setResolvedData(Object.fromEntries(entries))
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--kk-font-sans)', color: 'var(--kk-gray-400)' }}>Loading…</span>
      </div>
    )
  }

  if (notFound || !data) return <Navigate to="/" replace />

  return (
    <main>
      {data.sections
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const entry = componentRegistry[section.componentInstance.componentKey]
          if (!entry) return null
          const Component = entry.component
          return (
            <Component
              key={section.id}
              data={resolvedData[section.id] ?? entry.previewProps}
              styleOverrides={section.componentInstance.styleOverrides ?? undefined}
            />
          )
        })}
    </main>
  )
}