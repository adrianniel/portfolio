import { useEffect, useRef, useState } from 'react'

/*
 * One shared IntersectionObserver for every element that animates in, instead
 * of one observer per element.
 */
type Callback = () => void
const callbacks = new WeakMap<Element, Callback>()
let observer: IntersectionObserver | null = null

function getObserver() {
  if (typeof IntersectionObserver === 'undefined') return null
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        callbacks.get(entry.target)?.()
        callbacks.delete(entry.target)
        observer?.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  )
  return observer
}

/** True once the element has scrolled into view (fires a single time). */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  // Starts false on the server and the client alike, so hydration matches.
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const io = getObserver()
    if (!io) {
      // Very old browsers: just show everything.
      const id = window.setTimeout(() => setInView(true))
      return () => window.clearTimeout(id)
    }
    callbacks.set(el, () => setInView(true))
    io.observe(el)
    return () => {
      callbacks.delete(el)
      io.unobserve(el)
    }
  }, [inView])

  return [ref, inView] as const
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
