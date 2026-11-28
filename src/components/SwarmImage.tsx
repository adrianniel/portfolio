import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { images } from '../data/images'
import type { ImageKey } from '../data/images'
import { fallbackSrc, srcSet } from '../lib/img'
import { prefersReducedMotion, useInView } from '../lib/useInView'

type Props = {
  image: ImageKey
  alt: string
  /** The `sizes` attribute for responsive images. */
  sizes: string
  className?: string
  imgClassName?: string
  /** Load eagerly with high priority (above the fold). */
  priority?: boolean
  /** Total build time in ms. */
  duration?: number
  /** CSS aspect-ratio override, e.g. "4 / 5". Defaults to the image's own. */
  aspect?: string
}

const CREAM = '#f2ebdc'
const CREAM_DEEP = '#e9e0cc'
const INK = '#16130f'
const HELPERS = ['niel', 'react', 'rust', 'prisma', 'vite', 'nest', 'expo', 'tailwind']

type Tile = { x: number; y: number; w: number; h: number; cx: number; cy: number; hitAt: number }
type Cursor = {
  label: string
  x: number
  y: number
  fromX: number
  fromY: number
  toX: number
  toY: number
  start: number
  travel: number
  tile: Tile | null
  leaving: boolean
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const FADE = 260

/**
 * An image that a swarm of cursors builds tile by tile when it scrolls into
 * view. The real <img> is always in the DOM; the canvas only covers it while
 * the swarm works, and is skipped entirely with reduced motion.
 */
export function SwarmImage({
  image,
  alt,
  sizes,
  className = '',
  imgClassName = '',
  priority = false,
  duration = 2000,
  aspect,
}: Props) {
  const asset = images[image]
  const [ref, inView] = useInView<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [done, setDone] = useState(false)

  // Cover the image before the first paint so it never flashes in early.
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || done) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    if (!ctx || !rect.width) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = CREAM_DEEP
    ctx.fillRect(0, 0, rect.width, rect.height)
  }, [done])

  useEffect(() => {
    if (!inView || done || prefersReducedMotion()) return
    const canvas = canvasRef.current
    const img = imgRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !img || !ctx) return

    let raf = 0
    let cancelled = false

    const run = () => {
      if (cancelled) return
      const W = canvas.clientWidth
      const H = canvas.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Grid of tiles, about 56px each.
      const cols = Math.max(5, Math.min(14, Math.round(W / 56)))
      const size = W / cols
      const rows = Math.max(1, Math.round(H / size))
      const th = H / rows
      const tiles: Tile[] = []
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          tiles.push({
            x: c * size,
            y: r * th,
            w: size,
            h: th,
            cx: c * size + size / 2,
            cy: r * th + th / 2,
            hitAt: Infinity,
          })

      // Sweep from a random corner, with jitter so it feels hand-made.
      const ox = Math.random() < 0.5 ? 0 : W
      const oy = Math.random() < 0.5 ? 0 : H
      const queue = tiles
        .map((t) => ({ t, k: Math.hypot(t.cx - ox, t.cy - oy) + Math.random() * size * 2.5 }))
        .sort((a, b) => a.k - b.k)
        .map((e) => e.t)

      const count = Math.max(4, Math.min(9, Math.round(tiles.length / 10)))
      const travel = Math.max(70, (duration / Math.ceil(tiles.length / count)) * 0.9)
      const now = performance.now()
      const edge = () => {
        const side = Math.floor(Math.random() * 4)
        const r = Math.random()
        return side === 0 ? [r * W, -24] : side === 1 ? [W + 24, r * H] : side === 2 ? [r * W, H + 24] : [-24, r * H]
      }
      const cursors: Cursor[] = Array.from({ length: count }, (_, i) => {
        const [x, y] = edge()
        return {
          label: HELPERS[i % HELPERS.length],
          x,
          y,
          fromX: x,
          fromY: y,
          toX: x,
          toY: y,
          start: now + i * 40,
          travel,
          tile: null,
          leaving: false,
        }
      })

      // Each cursor takes the nearest of the next few tiles in the sweep.
      const assign = (c: Cursor, t: number) => {
        c.fromX = c.x
        c.fromY = c.y
        c.start = t
        if (!queue.length) {
          const [x, y] = edge()
          c.toX = x
          c.toY = y
          c.tile = null
          c.leaving = true
          c.travel = 420
          return
        }
        const nearby = queue.slice(0, 6)
        let best = 0
        let bestD = Infinity
        nearby.forEach((tile, i) => {
          const d = Math.hypot(tile.cx - c.x, tile.cy - c.y)
          if (d < bestD) {
            bestD = d
            best = i
          }
        })
        const [tile] = queue.splice(best, 1)
        c.tile = tile
        c.toX = tile.cx + (Math.random() - 0.5) * size * 0.4
        c.toY = tile.cy + (Math.random() - 0.5) * th * 0.4
        c.travel = c.leaving ? 420 : travel * (0.8 + Math.random() * 0.4)
      }
      cursors.forEach((c) => assign(c, c.start))

      const drawCursor = (c: Cursor) => {
        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, 15)
        ctx.lineTo(4, 11.4)
        ctx.lineTo(7, 17.6)
        ctx.lineTo(9.6, 16.4)
        ctx.lineTo(6.7, 10.4)
        ctx.lineTo(11.6, 10.4)
        ctx.closePath()
        ctx.fillStyle = INK
        ctx.strokeStyle = CREAM
        ctx.lineWidth = 1.25
        ctx.lineJoin = 'round'
        ctx.fill()
        ctx.stroke()
        ctx.font = '500 10px "Martian Mono Variable", ui-monospace, monospace'
        const text = c.label
        const tw = ctx.measureText(text).width
        ctx.fillStyle = INK
        ctx.beginPath()
        ctx.roundRect(10, 17, tw + 12, 17, 3)
        ctx.fill()
        ctx.fillStyle = CREAM
        ctx.fillText(text, 16, 29)
        ctx.restore()
      }

      const frame = () => {
        if (cancelled) return
        // One clock for everything (rAF timestamps can lag performance.now).
        const t = performance.now()
        ctx.clearRect(0, 0, W, H)

        let covered = 0
        for (const tile of tiles) {
          const a = tile.hitAt === Infinity ? 1 : 1 - Math.min(1, (t - tile.hitAt) / FADE)
          if (a <= 0) continue
          covered++
          ctx.globalAlpha = a
          ctx.fillStyle = CREAM_DEEP
          ctx.fillRect(tile.x - 0.5, tile.y - 0.5, tile.w + 1, tile.h + 1)
          ctx.strokeStyle = 'rgba(22, 19, 15, 0.09)'
          ctx.lineWidth = 1
          ctx.strokeRect(tile.x + 0.5, tile.y + 0.5, tile.w - 1, tile.h - 1)
          // A click ring right after a tile is hit.
          if (tile.hitAt !== Infinity) {
            const p = Math.min(1, (t - tile.hitAt) / FADE)
            ctx.globalAlpha = 1 - p
            ctx.strokeStyle = INK
            ctx.beginPath()
            ctx.arc(tile.cx, tile.cy, 4 + p * 14, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
        ctx.globalAlpha = 1

        let active = 0
        for (const c of cursors) {
          const p = Math.max(0, Math.min(1, (t - c.start) / c.travel))
          const e = easeInOut(p)
          c.x = c.fromX + (c.toX - c.fromX) * e
          c.y = c.fromY + (c.toY - c.fromY) * e
          if (p >= 1) {
            if (c.tile) {
              c.tile.hitAt = t
              c.tile = null
              assign(c, t + 30)
            } else if (!c.leaving) {
              assign(c, t)
            }
          }
          if (!(c.leaving && p >= 1)) active++
          drawCursor(c)
        }

        if (covered === 0 && active === 0) {
          setDone(true)
          return
        }
        raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }

    // Wait for the pixels (and the label font) before building.
    Promise.all([img.decode().catch(() => undefined), document.fonts?.ready]).then(run)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [inView, done, duration])

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: aspect ?? `${asset.width} / ${asset.height}` }}
    >
      <picture>
        <source type="image/avif" srcSet={srcSet(image, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(image, 'webp')} sizes={sizes} />
        <img
          ref={imgRef}
          src={fallbackSrc(image)}
          alt={alt}
          width={asset.width}
          height={asset.height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          className={`block h-full w-full object-cover ${imgClassName}`}
        />
      </picture>
      {!done && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full motion-reduce:hidden"
        />
      )}
    </div>
  )
}
