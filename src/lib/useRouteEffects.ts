import { useEffect, useRef } from 'react'
import { projects } from '../data/content'
import { keyOf } from './router'
import type { Route } from './router'

const SITE = 'Niel Adrian'

function titleOf(route: Route) {
  switch (route.name) {
    case 'home':
      return `${SITE} Garig · Full-stack developer`
    case 'project':
      return `${projects.find((p) => p.slug === route.slug)?.name ?? 'Work'} · ${SITE}`
    default:
      return `${route.name[0].toUpperCase()}${route.name.slice(1)} · ${SITE}`
  }
}

/**
 * Housekeeping on every route change: the tab title, scrolling back to the
 * top, and moving focus to the new view so screen readers announce it.
 * Also reveals a deep-linked view that index.html hid until hydration.
 */
export function useRouteEffects(route: Route) {
  const key = keyOf(route)
  const first = useRef(true)

  useEffect(() => {
    document.title = titleOf(route)
    if (first.current) {
      first.current = false
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
      document.getElementById('main')?.focus({ preventScroll: true })
    }
    // The prerendered HTML is the home view; wait one frame so a deep link
    // (#/work) has swapped in before it becomes visible.
    const id = requestAnimationFrame(() => document.documentElement.classList.remove('deep-link'))
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key identifies the route
  }, [key])
}
