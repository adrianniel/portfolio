import { useRef, useState } from 'react'
import { certificates } from '../data/content'
import type { Certificate } from '../data/content'
import { images } from '../data/images'
import { fallbackSrc, srcSet } from '../lib/img'
import { useViewer } from '../lib/viewer'
import { View } from './View'
import { to } from '../lib/router'
import { SwarmImage } from './SwarmImage'

export function Certificates() {
  const { say } = useViewer()
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState<Certificate | null>(null)

  const show = (cert: Certificate) => {
    setOpen(cert)
    dialog.current?.showModal()
  }
  const close = () => dialog.current?.close()

  return (
    <View number="03" kicker="Certificates" title={say('Receipts, in case you need them, {name}.')} next={{ label: 'Contact', href: to({ name: 'contact' }) }}>
      <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
        {certificates.map((cert) => (
          <li key={cert.verify}>
            <button
              type="button"
              onClick={() => show(cert)}
              className="group block w-full text-left"
              aria-label={`View certificate: ${cert.title}, ${cert.issuer}`}
            >
              <SwarmImage
                image={cert.image}
                alt=""
                sizes="(min-width: 640px) 23rem, calc(100vw - 2.5rem)"
                duration={1500}
                className="rounded-[3px] ring-1 ring-ink/15 transition-shadow duration-500 group-hover:ring-ink/40"
              />
              <span className="label mt-4 flex justify-between">
                <span>{cert.issuer}</span>
                <span>{cert.date}</span>
              </span>
              <span className="mt-2 block text-lg leading-snug">{cert.title}</span>
              <span className="mt-1 block text-sm text-ink-soft">{cert.detail}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        aria-label={open ? `${open.title} certificate` : 'Certificate'}
        className="m-auto w-[min(64rem,calc(100vw-2rem))] max-w-none bg-transparent p-0 backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="bg-cream p-3 sm:p-4">
            <picture>
              <source type="image/avif" srcSet={srcSet(open.image, 'avif')} sizes="64rem" />
              <source type="image/webp" srcSet={srcSet(open.image, 'webp')} sizes="64rem" />
              <img
                src={fallbackSrc(open.image)}
                alt={`${open.title} certificate from ${open.issuer}, issued ${open.date}, awarded to Niel Adrian Garig`}
                width={images[open.image].width}
                height={images[open.image].height}
                className="block h-auto max-h-[78vh] w-full object-contain"
              />
            </picture>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
              <p className="label">
                {open.issuer} · {open.date}
              </p>
              <div className="flex items-center gap-5">
                <a
                  href={open.verify}
                  target="_blank"
                  rel="noopener"
                  className="text-sm underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                >
                  Verify <span aria-hidden="true">↗</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
                <button type="button" onClick={close} className="label hover:text-ink" autoFocus>
                  Close ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </View>
  )
}
