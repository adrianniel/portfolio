import { About } from './components/About'
import { Certificates } from './components/Certificates'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Home } from './components/Home'
import { Sidebar } from './components/Sidebar'
import { Work } from './components/Work'
import { keyOf, sectionOf, useRoute } from './lib/router'

function App() {
  const route = useRoute()

  const view = {
    home: <Home />,
    about: <About />,
    work: <Work />,
    certificates: <Certificates />,
    contact: <Contact />,
  }[sectionOf(route)]

  return (
    <div className="grain min-h-dvh">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
        className="label sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-cream focus:p-2"
      >
        Skip to content
      </a>
      <div className="mx-auto max-w-[78rem] lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <Sidebar route={route} />
        <main id="main" tabIndex={-1} className="min-w-0 px-5 pt-10 pb-12 focus:outline-none sm:px-10 lg:px-16 lg:pt-20">
          <div key={keyOf(route)} className="view-in max-w-[46rem]">
            {view}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}

export default App
