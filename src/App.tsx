import { Header } from './components/Header'
import { Hero } from './components/Hero'

function App() {
  return (
    <div className="grain min-h-dvh">
      <a href="#main" className="label sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-cream focus:p-2">
        Skip to content
      </a>
      <Header />
      <main id="main" className="mx-auto max-w-[52rem] px-5 pb-32 sm:px-8">
        <Hero />
      </main>
    </div>
  )
}

export default App
