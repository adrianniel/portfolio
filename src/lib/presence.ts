import { useEffect, useSyncExternalStore } from 'react'
import type { Section } from './router'

/*
 * Live presence: who else has the portfolio open right now, and which
 * section they are on. Runs on Supabase Realtime Presence; nothing is stored
 * and nobody is identified. Each open tab is a random id that disappears
 * when the tab closes or goes to the background.
 *
 * The publishable key is meant to ship in client code. This project holds no
 * tables or data, only this presence channel.
 */
const SUPABASE_URL = 'https://anwkbnpsutetbkpcbffl.supabase.co'
const SUPABASE_KEY = 'sb_publishable_aLGZ8b77TLrgcFyBse-SZw_mxZTqIDj'
const CHANNEL = 'portfolio:presence'

export type Visitor = { id: string; section: Section; self: boolean }

type Meta = { section: Section }

let visitors: Visitor[] | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

let section: Section = 'home'
let started = false
let track: ((meta: Meta) => void) | null = null

const me =
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

async function connect() {
  const { RealtimeClient } = await import('@supabase/realtime-js')
  const client = new RealtimeClient(`${SUPABASE_URL.replace('https', 'wss')}/realtime/v1`, {
    params: { apikey: SUPABASE_KEY, eventsPerSecond: 5 },
  })
  const channel = client.channel(CHANNEL, { config: { presence: { key: me, enabled: true } } })

  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState<Meta>()
    visitors = Object.entries(state).map(([id, metas]) => ({
      id,
      section: metas[metas.length - 1]?.section ?? 'home',
      self: id === me,
    }))
    emit()
  })

  let joined = false
  track = (meta) => {
    if (joined && !document.hidden) void channel.track(meta)
  }

  channel.subscribe((status) => {
    if (status !== 'SUBSCRIBED') return
    joined = true
    track?.({ section })
  })

  // Only count people who are actually looking: a tab in the background leaves.
  document.addEventListener('visibilitychange', () => {
    if (!joined) return
    if (document.hidden) void channel.untrack()
    else void channel.track({ section })
  })
}

function start() {
  if (started || typeof window === 'undefined') return
  started = true
  // Wait until the page is idle, so presence never slows the first paint.
  const go = () => void connect().catch(() => undefined)
  if ('requestIdleCallback' in window) window.requestIdleCallback(go, { timeout: 3000 })
  else setTimeout(go, 1500)
}

/** Tells everyone else which section this visitor is on. Call once, high up. */
export function usePresenceReporter(current: Section) {
  useEffect(() => {
    start()
    section = current
    track?.({ section: current })
  }, [current])
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Everyone here right now (including you), or null until connected. */
export function useVisitors(): Visitor[] | null {
  return useSyncExternalStore(
    subscribe,
    () => visitors,
    () => null,
  )
}
