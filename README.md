# portfolio

Personal portfolio of **Niel Adrian Garig**, full-stack developer from Bohol, Philippines.

**Live:** https://adrianniel.github.io/portfolio/

## What makes it different

- **It greets the reader by name.** Send a personal link such as
  `https://adrianniel.github.io/portfolio/?to=Maria` and the whole tour is written
  for Maria: "Good evening, Maria." in the hero, her name on the section titles,
  project notes, the contact button and the email subject. Visitors without a
  link can type their name. The greeting follows the visitor's own clock.
  The name stays in the visitor's browser (localStorage) and is never sent anywhere.
- **Text comes into focus** word by word as it scrolls into view.
- **Images are built by a swarm of cursors** that reveal them tile by tile.
  One of the cursors carries the visitor's name.
- Everything respects `prefers-reduced-motion`.

## Design

| Token | Value | Use |
| --- | --- | --- |
| Cream | `#f2ebdc` | Background |
| Ink | `#16130f` | Text, cursors, rules |
| Ember | `#a9441a` | Only the things that should be clicked |

Type: [Gloock](https://fonts.google.com/specimen/Gloock) for display,
[Schibsted Grotesk](https://fonts.google.com/specimen/Schibsted+Grotesk) for text,
[Martian Mono](https://fonts.google.com/specimen/Martian+Mono) for labels. All self-hosted.

## Tech stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- No animation library: one shared `IntersectionObserver` and a canvas per image
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
