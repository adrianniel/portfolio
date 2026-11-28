// Makes dist/index.html paint without waiting on other files:
//  1. puts the server-rendered page into #root (no wait for JavaScript),
//  2. inlines the stylesheet (no render-blocking request),
//  3. preloads the two fonts used above the fold.
// Runs after `vite build` and `vite build --ssr`.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const dist = path.resolve('dist')
const ssrDir = path.resolve('dist-ssr')
const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)

const file = path.join(dist, 'index.html')
const html = await readFile(file, 'utf8')
const marker = '<div id="root"></div>'
if (!html.includes(marker)) throw new Error('prerender: #root placeholder not found')

let out = html.replace(marker, `<div id="root">${render()}</div>`)

const link = out.match(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/)
if (link) {
  // Font URLs in the CSS are relative to assets/; make them relative to the page.
  const css = (await readFile(path.join(dist, link[1]), 'utf8')).replaceAll('url(./', 'url(./assets/')
  const aboveFold = /url\(\.\/(assets\/(?:gloock-latin-400|schibsted-grotesk-latin-wght-normal)[^)]+\.woff2)\)/g
  const preloads = [...new Set([...css.matchAll(aboveFold)].map((m) => m[1]))]
    .map((href) => `<link rel="preload" href="./${href}" as="font" type="font/woff2" crossorigin>`)
    .join('\n    ')
  // A function replacement, so "$" in the CSS is never read as a pattern.
  out = out.replace(link[0], () => `${preloads}\n    <style>${css}</style>`)
}

await writeFile(file, out)
await rm(ssrDir, { recursive: true, force: true })
console.log('prerendered dist/index.html')
