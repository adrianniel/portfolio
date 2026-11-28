import type { Section } from './router'

/*
 * Maya's brain. She perches on things marked with data-say (the line she
 * says there) and optional data-perch:
 *   "text"   stands on top of an actual letter near the end of the first line
 *   "center" stands on the middle of the element's top edge
 *   "start"  stands on the top edge, towards the left (default)
 *
 * She flies like a hummingbird: a quick dart, a hover in front of the perch
 * with a little bob, then a soft settle. Perched, she breathes, blinks, looks
 * around, preens, flicks her tail and now and then buzzes round to face the
 * other way. On a page switch she first hops onto the sidebar, so she is
 * never swept away with the old view. Plain DOM and requestAnimationFrame:
 * React never re-renders for her.
 */

type Point = { x: number; y: number }
type Spot = HTMLElement | Point

// Where her feet are inside the 40×40 sprite.
const FOOT_X = 18.5
const FOOT_Y = 31
const TOP_SAFE = 64

export const INTRO = "Hi, I'm Maya! I'll show you around. Follow me."

const ON_SWITCH: Record<Section, string> = {
  home: 'Back to the start!',
  about: 'About Niel, coming up.',
  work: 'To the work! The good part.',
  certificates: 'Certificates. He did his homework.',
  contact: 'Contact! Good choice.',
}

const POKES = [
  'Bzzz! That tickles.',
  'My wings beat about 50 times a second. Show-off, I know.',
  'Niel is in Bohol right now. Probably coding.',
  "Psst. The orange button is the one he's hoping you click.",
  'Try the Work page. I perch on every project.',
  'I can hover in one spot. Watch the next landing.',
]

type Act = 'blink' | 'look' | 'preen' | 'tail' | 'buzz' | 'turn'
const ACTS: [Act, number, number][] = [
  // [behavior, weight, duration in ms]
  ['blink', 5, 160],
  ['look', 4, 1400],
  ['tail', 3, 500],
  ['preen', 2, 1500],
  ['buzz', 1, 650],
  ['turn', 1, 700],
]
const ACT_CLASSES = ['act-blink', 'act-look', 'act-preen', 'act-tail', 'act-buzz', 'act-turn']

const isPoint = (s: Spot): s is Point => !(s instanceof HTMLElement)
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const easeInOut = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2)
const easeOut = (t: number) => 1 - (1 - t) ** 3
const isShown = (el: Element) => {
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0
}

// --- standing on real letters --------------------------------------------------

let ctx: CanvasRenderingContext2D | null = null
const glyphCache = new Map<string, { x: number; top: number } | null>()
const ascentCache = new Map<string, number>()

function fontOf(el: Element) {
  const cs = getComputedStyle(el)
  return {
    font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
    size: parseFloat(cs.fontSize),
    upper: cs.textTransform === 'uppercase',
  }
}

function canvas() {
  ctx ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  return ctx
}

/** The font's ascent: how far the baseline sits below the top of a text box. */
function ascentOf(font: string) {
  let a = ascentCache.get(font)
  const c = canvas()
  if (a === undefined && c) {
    c.font = font
    a = c.measureText('H').fontBoundingBoxAscent
    ascentCache.set(font, a)
  }
  return a ?? 0
}

/**
 * Draws one character and finds the top of its ink: how high it reaches above
 * the baseline, and where across the glyph that highest stroke is (the stem
 * of a "d", the bar of a "T", the dot-matrix top of Doto's "l").
 */
function glyphTop(font: string, size: number, ch: string) {
  const key = `${font}|${ch}`
  if (glyphCache.has(key)) return glyphCache.get(key)!
  const c = canvas()
  if (!c) return null
  const w = Math.ceil(size * 2)
  const h = Math.ceil(size * 2)
  const base = Math.round(size * 1.4)
  const pad = Math.round(size * 0.4)
  c.canvas.width = w
  c.canvas.height = h
  c.font = font
  c.textBaseline = 'alphabetic'
  c.fillStyle = '#000'
  c.fillText(ch, pad, base)
  const data = c.getImageData(0, 0, w, h).data

  let result: { x: number; top: number } | null = null
  for (let y = 0; y < h && !result; y++) {
    let best: [number, number] | null = null
    let runStart = -1
    for (let x = 0; x <= w; x++) {
      const ink = x < w && data[(y * w + x) * 4 + 3] > 140
      if (ink && runStart < 0) runStart = x
      if (!ink && runStart >= 0) {
        if (!best || x - runStart > best[1] - best[0]) best = [runStart, x]
        runStart = -1
      }
    }
    // Skip stray anti-aliased pixels; want a real stroke at least 2px wide.
    if (best && best[1] - best[0] >= 2) result = { x: (best[0] + best[1]) / 2 - pad, top: base - y }
  }
  glyphCache.set(key, result)
  return result
}

const SKIP = /[\s.,:;!?'"’“”()\-–—·…]/

/** A point on top of a letter near the end of the element's first line. */
function letterPerch(el: HTMLElement): Point | null {
  const { font, size, upper } = fontOf(el)
  const chars: { ch: string; rect: DOMRect }[] = []
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    for (let i = 0; i < node.length; i++) {
      if (SKIP.test(node.data[i])) continue
      range.setStart(node, i)
      range.setEnd(node, i + 1)
      const rect = range.getBoundingClientRect()
      // Measure the glyph as drawn: labels are uppercased by CSS.
      if (rect.width > 0) chars.push({ ch: upper ? node.data[i].toUpperCase() : node.data[i], rect })
    }
  }
  if (!chars.length) return null

  const firstTop = Math.min(...chars.map((c) => c.rect.top))
  const line = chars.filter((c) => c.rect.top < firstTop + size * 0.5)
  // From the end of the line, prefer a tall letter among the last few.
  const measured = line
    .slice(-6)
    .reverse()
    .flatMap((c) => {
      const g = glyphTop(font, size, c.ch)
      return g ? [{ c, g }] : []
    })
  if (!measured.length) return null
  const tallest = Math.max(...measured.map((m) => m.g.top))
  const pick = measured.find((m) => m.g.top >= tallest * 0.92) ?? measured[0]

  const baseline = pick.c.rect.top + ascentOf(font)
  return { x: pick.c.rect.left + pick.g.x, y: baseline - pick.g.top }
}

// -------------------------------------------------------------------------------

export class GuideController {
  private pos: Point
  private spot: Spot | null = null
  private section: Section | null = null
  private seen = new Set<Element>()
  private face = 1
  private flight = 0
  private scrollFrame = 0
  private settleTimer = 0
  private nextTimer = 0
  private hideTimer = 0
  private startTimer = 0
  private idleTimer = 0
  private actTimer = 0
  private readonly reduce: boolean
  private readonly bird: HTMLElement
  private readonly bubble: HTMLElement

  constructor(bird: HTMLElement, bubble: HTMLElement) {
    this.bird = bird
    this.bubble = bubble
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Waits just off the right edge until the first flight.
    this.pos = { x: window.innerWidth + 50, y: 160 }
    this.setFace(-1)
    this.place(this.pos)
    window.addEventListener('scroll', this.onScroll, { passive: true })
    window.addEventListener('resize', this.onScroll)
  }

  destroy() {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.onScroll)
    cancelAnimationFrame(this.flight)
    cancelAnimationFrame(this.scrollFrame)
    for (const t of [this.settleTimer, this.nextTimer, this.hideTimer, this.startTimer, this.idleTimer, this.actTimer])
      clearTimeout(t)
  }

  /** Called on first load and on every route change. */
  routeChanged(section: Section) {
    const first = this.section === null
    this.section = section
    this.seen.clear()
    clearTimeout(this.nextTimer)
    clearTimeout(this.startTimer)

    if (first) {
      this.startTimer = window.setTimeout(() => this.tour(INTRO), 1200)
      return
    }
    const nav = this.navSpot()
    // Hop onto the sidebar while the view changes, then go explore it.
    if (nav) this.fly(nav, ON_SWITCH[section], 1000)
    else this.fly({ x: window.innerWidth - 40, y: TOP_SAFE + 44 }, ON_SWITCH[section], 900)
  }

  /** A click on Maya: a buzz of the wings and a random line. */
  poke() {
    if (this.flight) return
    this.act('buzz', 650)
    this.say(POKES[Math.floor(Math.random() * POKES.length)])
    this.scheduleNext(9000)
  }

  // --- choosing where to go --------------------------------------------------------

  private navSpot(): HTMLElement | null {
    const label = document.querySelector<HTMLElement>('aside a[aria-current="page"] [data-guide-nav]')
    return label && isShown(label) ? label : null
  }

  /** Perches on screen right now: the open view first, then the sidebar. */
  private candidates(): HTMLElement[] {
    const inView = [...document.querySelectorAll<HTMLElement>('#view [data-say]')]
    const aside = [...document.querySelectorAll<HTMLElement>('aside [data-say]')]
    return [...inView, ...aside].filter((el) => isShown(el) && this.visible(this.anchor(el)))
  }

  /** Flies to the next thing worth seeing, or rests if she has said it all. */
  private tour(line?: string) {
    const next = this.candidates().find((el) => !this.seen.has(el) && el !== this.spot)
    if (next) {
      this.seen.add(next)
      this.fly(next, line ?? next.dataset.say ?? '')
      return
    }
    if (this.spot && this.visible(this.anchor(this.spot))) {
      this.scheduleNext(9000)
      return
    }
    // Nothing on screen to sit on: wait in the corner.
    this.fly({ x: window.innerWidth - 44, y: window.innerHeight - 14 }, '', 9000)
  }

  private scheduleNext(ms: number) {
    clearTimeout(this.nextTimer)
    this.nextTimer = window.setTimeout(() => this.tour(), ms)
  }

  // --- geometry --------------------------------------------------------------------

  private anchor(spot: Spot): Point {
    if (isPoint(spot)) return { x: Math.min(spot.x, window.innerWidth - 30), y: Math.min(spot.y, window.innerHeight - 8) }
    const mode = spot.dataset.perch ?? 'start'
    if (mode === 'text') {
      const p = letterPerch(spot)
      if (p) return { x: clamp(p.x, 20, window.innerWidth - 24), y: p.y }
    }
    const r = spot.getBoundingClientRect()
    if (mode === 'center') return { x: r.left + r.width / 2, y: r.top }
    return { x: r.left + Math.min(r.width * 0.7, 150), y: r.top }
  }

  private visible(p: Point) {
    const inSidebar = p.x < 280 && window.innerWidth >= 1024
    const top = inSidebar ? 40 : TOP_SAFE + 24
    return p.y > top && p.y < window.innerHeight - 6 && p.x > 10 && p.x < window.innerWidth - 10
  }

  // --- moving ------------------------------------------------------------------------

  private place(p: Point) {
    this.pos = p
    this.bird.style.transform = `translate3d(${p.x - FOOT_X}px, ${p.y - FOOT_Y}px, 0)`
    if (this.bubble.classList.contains('is-shown')) this.placeBubble()
  }

  private setFace(face: number) {
    this.face = face
    this.bird.style.setProperty('--face', String(face))
  }

  private setTilt(deg: number) {
    this.bird.style.setProperty('--tilt', `${deg}deg`)
  }

  /**
   * Hummingbird flight: lift off, dart (with a mid-air pause on long trips),
   * hover in front of the perch with a little bob, then settle onto it.
   */
  private fly(spot: Spot, line: string, then = 8500) {
    cancelAnimationFrame(this.flight)
    this.flight = 0
    this.spot = spot
    this.hideBubble()
    this.stopIdle()
    clearTimeout(this.nextTimer)

    const from = { ...this.pos }
    const first = this.anchor(spot)
    const dist = Math.hypot(first.x - from.x, first.y - from.y)

    if (this.reduce || dist < 4) {
      this.place(first)
      this.land(line, then)
      return
    }

    const face = first.x >= from.x ? 1 : -1
    this.setFace(face)
    this.bird.classList.remove('is-landing')
    this.bird.classList.add('is-flying')

    const T_LIFT = 140
    const T_DART = clamp(dist * 0.55, 240, 820)
    const T_HOVER = 420 + Math.random() * 280
    const T_SETTLE = 260
    const pauseMid = dist > 520
    const wobble = (Math.random() - 0.5) * 50

    // Hover a little before and above the perch, facing it.
    const hoverOf = (to: Point) => ({ x: to.x - face * 12, y: to.y - 18 })
    const lifted = { x: from.x, y: from.y - 9 }
    const start = performance.now()

    const step = () => {
      const t = performance.now() - start
      const to = this.anchor(spot) // keeps up if the page scrolls mid-flight
      const hover = hoverOf(to)
      const bob = { x: Math.sin(t / 130) * 1.2, y: Math.sin(t / 85) * 1.8 }

      if (t < T_LIFT) {
        this.setTilt(-6)
        this.place({ x: from.x, y: from.y - 9 * easeOut(t / T_LIFT) })
      } else if (t < T_LIFT + T_DART) {
        const raw = (t - T_LIFT) / T_DART
        let e: number
        let paused = false
        if (pauseMid) {
          // Long trips stop halfway for a breath in the air.
          if (raw < 0.42) e = easeInOut(raw / 0.42) / 2
          else if (raw < 0.58) {
            e = 0.5
            paused = true
          } else e = 0.5 + easeInOut((raw - 0.58) / 0.42) / 2
        } else e = easeInOut(raw)
        // A shallow arc, not a lob: hummingbirds fly fairly straight.
        const arc = Math.sin(Math.PI * e) * (Math.min(40, dist * 0.08) + wobble * 0.3)
        this.setTilt(paused ? -6 : 22)
        this.place({
          x: lifted.x + (hover.x - lifted.x) * e + (paused ? bob.x : 0),
          y: lifted.y + (hover.y - lifted.y) * e - arc + (paused ? bob.y : 0),
        })
      } else if (t < T_LIFT + T_DART + T_HOVER) {
        this.setTilt(-8)
        this.place({ x: hover.x + bob.x, y: hover.y + bob.y })
      } else if (t < T_LIFT + T_DART + T_HOVER + T_SETTLE) {
        const p = easeOut((t - T_LIFT - T_DART - T_HOVER) / T_SETTLE)
        this.setTilt(-8 * (1 - p))
        this.place({ x: hover.x + (to.x - hover.x) * p, y: hover.y + (to.y - hover.y) * p })
      } else {
        this.flight = 0
        this.place(to)
        this.land(line, then)
        return
      }
      this.flight = requestAnimationFrame(step)
    }
    this.flight = requestAnimationFrame(step)
  }

  private land(line: string, then: number) {
    this.bird.classList.remove('is-flying', 'is-landing')
    this.setTilt(0)
    void this.bird.offsetWidth
    this.bird.classList.add('is-landing')
    // Once down, turn to look at the page rather than off its edge.
    this.setFace(this.pos.x < window.innerWidth * 0.55 ? 1 : -1)
    this.say(line)
    this.scheduleNext(then)
    this.startIdle()
    // Text may still be sliding into place (view and word reveals): re-check.
    window.setTimeout(() => this.refresh(), 450)
    window.setTimeout(() => this.refresh(), 1100)
  }

  /** Snaps back onto the perch if it moved under her feet. */
  private refresh() {
    if (!this.flight && this.spot) this.place(this.anchor(this.spot))
  }

  // --- life while perched ------------------------------------------------------------

  private startIdle() {
    clearTimeout(this.idleTimer)
    this.idleTimer = window.setTimeout(() => {
      if (this.flight) return
      this.refresh()
      const total = ACTS.reduce((n, [, w]) => n + w, 0)
      let roll = Math.random() * total
      const [name, , ms] = ACTS.find(([, w]) => (roll -= w) < 0) ?? ACTS[0]
      if (!this.reduce || name === 'blink') this.act(name, ms)
      this.startIdle()
    }, 1100 + Math.random() * 2400)
  }

  private stopIdle() {
    clearTimeout(this.idleTimer)
    clearTimeout(this.actTimer)
    this.bird.classList.remove(...ACT_CLASSES)
  }

  private act(name: Act, ms: number) {
    clearTimeout(this.actTimer)
    this.bird.classList.remove(...ACT_CLASSES)
    void this.bird.offsetWidth
    if (name === 'turn') {
      // A little buzz up, a turn in the air, and back down on the same spot.
      this.bird.classList.add('act-buzz')
      this.actTimer = window.setTimeout(() => {
        this.setFace(-this.face)
        this.actTimer = window.setTimeout(() => this.bird.classList.remove('act-buzz'), ms / 2)
      }, ms / 2)
      return
    }
    this.bird.classList.add(`act-${name}`)
    this.actTimer = window.setTimeout(() => this.bird.classList.remove(`act-${name}`), ms)
  }

  // --- talking -------------------------------------------------------------------

  private say(line: string) {
    clearTimeout(this.hideTimer)
    if (!line) {
      this.hideBubble()
      return
    }
    this.bubble.textContent = line
    this.bubble.classList.add('is-shown')
    this.placeBubble()
    this.hideTimer = window.setTimeout(() => this.hideBubble(), 3800 + line.length * 30)
  }

  private hideBubble() {
    this.bubble.classList.remove('is-shown')
  }

  private placeBubble() {
    const w = this.bubble.offsetWidth
    const h = this.bubble.offsetHeight
    const left = clamp(this.pos.x - 24, 8, window.innerWidth - w - 8)
    const top = Math.max(8, this.pos.y - FOOT_Y - h - 2)
    this.bubble.style.transform = `translate3d(${left}px, ${top}px, 0)`
    this.bubble.style.setProperty('--tail', `${clamp(this.pos.x - left - 5, 8, w - 18)}px`)
  }

  // --- scrolling -----------------------------------------------------------------

  private onScroll = () => {
    if (!this.scrollFrame) {
      this.scrollFrame = requestAnimationFrame(() => {
        this.scrollFrame = 0
        if (!this.flight && this.spot) this.place(this.anchor(this.spot))
      })
    }
    clearTimeout(this.settleTimer)
    this.settleTimer = window.setTimeout(this.settled, 400)
  }

  /** After scrolling stops: follow the reader if her perch left the screen. */
  private settled = () => {
    if (this.flight || !this.spot || this.section === null) return
    const offscreen = !this.visible(this.anchor(this.spot))
    const fresh = this.candidates().some((el) => !this.seen.has(el))
    const talking = this.bubble.classList.contains('is-shown')
    if (offscreen || (fresh && !talking)) this.tour()
  }
}
