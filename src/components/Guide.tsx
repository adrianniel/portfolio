import { useEffect, useRef, useSyncExternalStore } from 'react'
import { GuideController } from '../lib/guide'
import type { Section } from '../lib/router'
import { Bird } from './Bird'
import { NestBack, NestFront } from './Nest'

const noop = () => () => {}

/**
 * Pip, the guide hummingbird, and her nest. Purely decorative (aria-hidden):
 * every line she says repeats something already on the page. Not part of the
 * prerendered HTML. Layer order: nest back, bird, nest front, speech bubble.
 */
export function Guide({ section, routeKey }: { section: Section; routeKey: string }) {
  const client = useSyncExternalStore(noop, () => true, () => false)
  const bird = useRef<HTMLButtonElement>(null)
  const bubble = useRef<HTMLDivElement>(null)
  const homeBack = useRef<HTMLDivElement>(null)
  const homeFront = useRef<HTMLDivElement>(null)
  const guide = useRef<GuideController | null>(null)

  useEffect(() => {
    if (!client || !bird.current || !bubble.current || !homeBack.current || !homeFront.current) return
    const g = new GuideController(bird.current, bubble.current, [homeBack.current, homeFront.current])
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
      <div ref={homeBack} className="guide-home">
        <NestBack />
        {/* Where her feet go when she is home. */}
        <span data-home-perch className="absolute top-[37px] left-[62px] size-px" />
      </div>
      <button
        ref={bird}
        type="button"
        tabIndex={-1}
        onClick={() => guide.current?.poke()}
        className="guide-bird pointer-events-auto"
        title="Pip"
      >
        <Bird />
      </button>
      <div ref={homeFront} className="guide-home">
        <NestFront />
      </div>
      <div ref={bubble} className="guide-bubble" />
    </div>
  )
}
