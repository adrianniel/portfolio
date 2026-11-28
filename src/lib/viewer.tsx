/* eslint-disable react/only-export-components -- provider and hook live together */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Who is reading. A browser cannot know a visitor's name on its own, so the
 * name comes from a personal link (?to=Maria, also ?for= or ?name=) or from
 * the visitor typing it. It is kept only in this browser (localStorage).
 */

const STORAGE_KEY = 'viewer-name'
const URL_KEYS = ['to', 'for', 'name']
const FALLBACK = 'friend'

export type PartOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

type Viewer = {
  /** The visitor's first name, or null when unknown. */
  name: string | null
  /** Fills `{name}` in a template, using a friendly fallback. */
  say: (template: string) => string
  setName: (name: string | null) => void
  partOfDay: PartOfDay
  greeting: string
  /** True when the name came from a personal link. */
  invited: boolean
}

const ViewerContext = createContext<Viewer | null>(null)

/** Keeps letters, spaces and a few name characters; title-cases the result. */
export function cleanName(raw: string | null | undefined): string | null {
  if (!raw) return null
  const name = raw
    .normalize('NFC')
    .replace(/[^\p{L}\p{M}\s.'-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 28)
  if (!name) return null
  return name.replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase())
}

function partOfDay(date = new Date()): PartOfDay {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  if (h >= 18 && h < 23) return 'evening'
  return 'night'
}

const GREETINGS: Record<PartOfDay, string> = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
  night: 'Up late',
}

function readStored(): string | null {
  try {
    return cleanName(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function store(name: string | null) {
  try {
    if (name) localStorage.setItem(STORAGE_KEY, name)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage can be blocked; the name still lives in memory */
  }
}

function readFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  for (const key of URL_KEYS) {
    const value = cleanName(params.get(key))
    if (value) return value
  }
  return null
}

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    const fromUrl = readFromUrl()
    return { name: fromUrl ?? readStored(), invited: Boolean(fromUrl) }
  })
  const [name, setNameState] = useState(initial.name)
  const [part, setPart] = useState<PartOfDay>(() => partOfDay())

  // Remember a name that arrived through a personal link.
  useEffect(() => {
    if (initial.invited) store(initial.name)
  }, [initial])

  // The greeting follows the visitor's clock, even on a long visit.
  useEffect(() => {
    const id = window.setInterval(() => setPart(partOfDay()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const setName = useCallback((value: string | null) => {
    const next = cleanName(value)
    setNameState(next)
    store(next)
  }, [])

  // Address people by first name: "Juan Dela Cruz" reads as "Juan".
  const first = name ? name.split(' ')[0] : null

  const value = useMemo<Viewer>(
    () => ({
      name: first,
      say: (template) => template.replaceAll('{name}', first ?? FALLBACK),
      setName,
      partOfDay: part,
      greeting: first ? `${GREETINGS[part]}, ${first}.` : `${GREETINGS[part]}.`,
      invited: initial.invited,
    }),
    [first, part, setName, initial.invited],
  )

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
}

export function useViewer(): Viewer {
  const ctx = useContext(ViewerContext)
  if (!ctx) throw new Error('useViewer must be used inside <ViewerProvider>')
  return ctx
}
