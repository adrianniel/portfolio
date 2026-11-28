import { images } from '../data/images'
// Paths are relative ("img/…") so the page works at any base, e.g. /portfolio/.
import type { ImageKey } from '../data/images'

/** Builds a srcset for one format of a generated image. */
export function srcSet(key: ImageKey, ext: 'avif' | 'webp') {
  const img = images[key]
  return img.widths.map((w) => `${img.base}-${w}.${ext} ${w}w`).join(', ')
}

/** The largest WebP, used as the plain <img src> fallback. */
export function fallbackSrc(key: ImageKey) {
  const img = images[key]
  return `${img.base}-${img.widths[img.widths.length - 1]}.webp`
}

/** One file at (or just above) a target width, for small fixed-size uses. */
export function sized(key: ImageKey, width: number, ext: 'avif' | 'webp' = 'webp') {
  const img = images[key]
  const w = img.widths.find((x) => x >= width) ?? img.widths[img.widths.length - 1]
  return `${img.base}-${w}.${ext}`
}
