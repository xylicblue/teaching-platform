import { useEffect, useState } from 'react'
import { fetchCatalog } from '../lib/catalog'
import type { Catalog } from '../lib/catalog'

/**
 * The landing page renders five sections that all need the same catalog.
 * One in-flight promise is shared between them so we hit Supabase once.
 */
let cache: Promise<Catalog> | null = null

export function primeCatalog(): Promise<Catalog> {
  if (!cache) cache = fetchCatalog()
  return cache
}

/** Drop the cache — call after a mutation that changes the public catalog. */
export function invalidateCatalog() {
  cache = null
}

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    primeCatalog().then(c => {
      if (!alive) return
      setCatalog(c)
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  return {
    catalog,
    teachers: catalog?.teachers ?? [],
    courses:  catalog?.courses  ?? [],
    loading,
  }
}
