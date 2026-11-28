import { useEffect, useRef, useSyncExternalStore } from 'react'
import { GuideController } from '../lib/guide'
import type { Section } from '../lib/router'
import { Bird } from './Bird'

const noop = () => () => {}

/**
 * Maya, the guide bird. Purely decorative (aria-hidden): every line she says
 * repeats something already on the page. Not part of the prerendered HTML.
 */
export function Guide({ section, routeKey }: { section: Section; routeKey: string }) {
  const client = useSyncExternalStore(noop, () => true, () => false)
  const bird = useRef<HTMLButtonElement>(null)
  const bubble = useRef<HTMLDivElement>(null)
  const guide = useRef<GuideController | null>(null)

  useEffect(() => {
    if (!client || !bird.current || !bubble.current) return
    const g = new GuideController(bird.current, bubble.current)
    guide.current = g
    return () => {
      g.destroy()
      guide.current = null
    }
  }, [client])

  useEffect(() => {
    guide.current?.routeChanged(section)
  }, [client, routeKey, section])

  if (!client) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div ref={bubble} className="guide-bubble" />
      <button
        ref={bird}
        type="button"
        tabIndex={-1}
        onClick={() => guide.current?.poke()}
        className="guide-bird pointer-events-auto"
        title="Maya"
      >
        <Bird />
      </button>
    </div>
  )
}
