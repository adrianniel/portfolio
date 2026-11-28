import { useSyncExternalStore } from 'react'

/*
 * Day and night. The choice lives on <html class="dark"> (set before first
 * paint by a tiny script in index.html) and in localStorage. Switching uses a
 * View Transition: the new theme grows out of the button in a circle.
 */

const KEY = 'theme'
const COLORS = { light: '#f2ebdc', dark: '#14120e' }
const listeners = new Set<() => void>()

const isDark = () => document.documentElement.classList.contains('dark')

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** True at night. Always false in the prerendered HTML. */
export function useDark() {
  return useSyncExternalStore(subscribe, isDark, () => false)
}

function apply(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? COLORS.dark : COLORS.light)
  try {
    localStorage.setItem(KEY, dark ? 'dark' : 'light')
  } catch {
    /* storage can be blocked; the switch still works for this visit */
  }
  listeners.forEach((l) => l())
}

/** Flips day and night, revealing the new theme from `origin` (the button). */
export function toggleTheme(origin?: { x: number; y: number }) {
  const next = !isDark()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!origin || reduce || !document.startViewTransition) {
    apply(next)
    return
  }
  const { x, y } = origin
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const transition = document.startViewTransition(() => apply(next))
  transition.ready
    .then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 800, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      ),
    )
    .catch(() => undefined)
}
