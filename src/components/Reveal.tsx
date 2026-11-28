import { Children, isValidElement } from 'react'
import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useInView } from '../lib/useInView'

type Props = {
  as?: ElementType
  children: ReactNode
  className?: string
  /** Extra delay before the first word, in ms. */
  delay?: number
  /** Gap between words, in ms. */
  stagger?: number
  id?: string
}

/**
 * Text that comes into focus word by word as it scrolls into view.
 * Plain strings are split into words; elements (links, <em>) move as one word.
 */
export function Reveal({ as: Tag = 'p', children, className = '', delay = 0, stagger = 22, id }: Props) {
  const [ref, inView] = useInView<HTMLElement>()
  let i = 0

  const word = (content: ReactNode, key: string) => {
    const style = { '--d': `${delay + Math.min(i++, 48) * stagger}ms` } as CSSProperties
    return (
      <span key={key} className="reveal-word" style={style}>
        {content}
      </span>
    )
  }

  const parts: ReactNode[] = []
  Children.toArray(children).forEach((child, c) => {
    if (typeof child === 'string' || typeof child === 'number') {
      String(child)
        .split(/(\s+)/)
        .forEach((piece, p) => {
          if (!piece) return
          parts.push(/^\s+$/.test(piece) ? ' ' : word(piece, `${c}-${p}`))
        })
    } else if (isValidElement(child)) {
      parts.push(word(child, `${c}`))
    }
  })

  return (
    <Tag ref={ref} id={id} className={`reveal ${inView ? 'is-in' : ''} ${className}`}>
      {parts}
    </Tag>
  )
}
