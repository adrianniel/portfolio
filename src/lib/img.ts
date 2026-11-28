import { images } from '../data/images'
import type { ImageKey } from '../data/images'

/** Builds a srcset for one format of a generated image. */
export function srcSet(key: ImageKey, ext: 'avif' | 'webp') {
  const img = images[key]
  return img.widths.map((w) => `${import.meta.env.BASE_URL}${img.base}-${w}.${ext} ${w}w`).join(', ')
}

/** The largest WebP, used as the plain <img src> fallback. */
export function fallbackSrc(key: ImageKey) {
  const img = images[key]
  return `${import.meta.env.BASE_URL}${img.base}-${img.widths[img.widths.length - 1]}.webp`
}
