import { useSyncExternalStore } from 'react'

/**
 * A tiny hash router: one view at a time, shareable links (#/work/tumbli),
 * working back/forward buttons, and no server setup on GitHub Pages.
 * Hashes that do not start with "#/" (like #main) leave the route alone.
 */

export type Route =
  | { name: 'home' }
  | { name: 'about' }
  | { name: 'work' }
  | { name: 'project'; slug: string }
  | { name: 'certificates' }
  | { name: 'contact' }

export type RouteName = Route['name']

const HOME: Route = { name: 'home' }

function parse(hash: string): Route | null {
  if (!hash || hash === '#' || hash === '#/') return HOME
  if (!hash.startsWith('#/')) return null
  const [first, second] = hash.slice(2).split('/').map(decodeURIComponent)
  switch (first) {
    case 'about':
    case 'certificates':
    case 'contact':
      return { name: first }
    case 'work':
      return second ? { name: 'project', slug: second } : { name: 'work' }
    default:
      return HOME
  }
}

// Cached by hash so useSyncExternalStore gets a stable snapshot.
let lastHash: string | null = null
let current: Route = HOME

function getRoute(): Route {
  const hash = window.location.hash
  if (hash !== lastHash) {
    lastHash = hash
    current = parse(hash) ?? current
  }
  return current
}

function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}

/** The current route. The prerendered HTML is always the home view. */
export function useRoute(): Route {
  return useSyncExternalStore(subscribe, getRoute, () => HOME)
}

/** Builds a link to a route. */
export function to(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/'
    case 'project':
      return `#/work/${encodeURIComponent(route.slug)}`
    default:
      return `#/${route.name}`
  }
}

/** The top-level section a route belongs to (a project belongs to Work). */
export type Section = Exclude<RouteName, 'project'>
export const sectionOf = (route: Route): Section => (route.name === 'project' ? 'work' : route.name)

/** A stable key for a route, used to replay the view transition. */
export const keyOf = (route: Route) => (route.name === 'project' ? `project:${route.slug}` : route.name)
