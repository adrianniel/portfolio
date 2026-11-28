# portfolio

Personal portfolio of **Niel Adrian Garig**, full-stack developer from Bohol, Philippines.

**Live:** https://adrianniel.github.io/portfolio/

## What makes it different

- **One view at a time.** A sidebar (a menu on phones) moves between Home,
  About, Work, Certificates and Contact. Every view has its own link
  (`#/work`, `#/work/tumbli`), so back/forward and sharing work.
- **Work is an index.** Hovering a project shows a floating preview; each
  project opens on its own page.
- **Live presence.** The sidebar shows how many people are on the site right
  now, as little dot-matrix faces, and which section each of them is reading,
  like the "seen" heads in a group chat. Nobody is identified and nothing is
  stored: each open tab is a random id on a Supabase Realtime Presence channel.
- **Text comes into focus** word by word as it scrolls into view.
- **Images are built by a swarm of cursors** that reveal them tile by tile.
- Everything respects `prefers-reduced-motion`.

## Design

| Token | Value | Use |
| --- | --- | --- |
| Cream | `#f2ebdc` | Background |
| Ink | `#16130f` | Text, cursors, rules |
| Ember | `#a9441a` | Only the things that should be clicked |

Type: [Doto](https://fonts.google.com/specimen/Doto) for the name and numbers,
[Gloock](https://fonts.google.com/specimen/Gloock) for headings,
[Schibsted Grotesk](https://fonts.google.com/specimen/Schibsted+Grotesk) for text,
[Martian Mono](https://fonts.google.com/specimen/Martian+Mono) for labels. All self-hosted.

## Tech stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- A tiny hash router (`src/lib/router.ts`), no routing library
- No animation library: one shared `IntersectionObserver` and a canvas per image
- [Supabase Realtime](https://supabase.com/docs/guides/realtime/presence) for presence,
  loaded only after the page is idle (`src/lib/presence.ts`)
- Prerendered at build time (`scripts/prerender.mjs`) with inlined CSS and preloaded fonts
- Deployed to GitHub Pages by GitHub Actions on every push to `main`

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check, build and prerender
npm run preview  # preview the production build
npm run lint     # oxlint
```

### Images

Raw images go in `assets-raw/` (not committed). Run `npm run images` to create
AVIF/WebP versions in `public/img/` and update `src/data/images.ts`.

```
assets-raw/
  niel.jpeg                 portrait (turned into an ink/cream duotone)
  projects/<slug>.png       project previews (cropped to 16:10)
  certificates/<slug>.jpg   certificates
```

Content (projects, certificates, stack) lives in `src/data/content.ts`.

## License

[MIT](LICENSE)
