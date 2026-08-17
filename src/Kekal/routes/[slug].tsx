/**
 * Dynamic page route — resolves any slug against the backend's pages table
 * and renders its ordered sections via the component registry.
 *
 * NOTE: SectionRenderer (F4) is inlined here until that file is confirmed
 * present at src/Kekal/render/SectionRenderer.tsx. Once it exists, swap the
 * inline rendering block for:
 *   import SectionRenderer from '@/Kekal/render/SectionRenderer'
 */

import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { apiClient } from '@/shared/api/client'
import { componentRegistry } from '@/shared/componentLibrary/registry'

interface ComponentInstance {
  component_key: string
  data_binding: Record<string, unknown> | null
  style_overrides: Record<string, string> | null
}

interface Section {
  id: string
  order: number
  component_instance: ComponentInstance
}

interface PageData {
  page: { id: string; slug: string; title: string; status: string }
  sections: Section[]
}

export default function SlugPage() {
  const { slug } = useParams<{ slug: string }>()
  const [data, setData]         = useState<PageData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)

    // apiClient is an object — use apiClient.get<T>(path)
    apiClient.get<PageData>(`/api/pages/${slug}`)
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--kk-font-sans)', color: 'var(--kk-gray-400)' }}>Loading…</span>
    </div>
  )

  if (notFound || !data) return <Navigate to="/" replace />

  return (
    <main>
      {data.sections
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const entry = componentRegistry[section.component_instance.component_key]
          if (!entry) return null
          const Component = entry.component
          return (
            <Component
              key={section.id}
              data={entry.previewProps}
              styleOverrides={section.component_instance.style_overrides ?? undefined}
            />
          )
        })}
    </main>
  )
}