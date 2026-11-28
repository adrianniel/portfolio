import type { ImageKey } from './images'

export const profile = {
  name: 'Niel Adrian Garig',
  shortName: 'Niel',
  role: 'Full-stack developer',
  location: 'Bohol, Philippines',
  timeZone: 'Asia/Manila',
  lab: 'MAKASA Laboratory',
  status: 'Now building iQueue',
  email: 'adrianniel.garig@gmail.com',
  github: 'https://github.com/adrianniel',
  githubHandle: 'adrianniel',
}

export const stack: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['TypeScript', 'JavaScript', 'SQL', 'C++', 'PHP', 'Rust'] },
  { group: 'Web', items: ['React', 'Next.js', 'Tailwind CSS', 'Vite'] },
  { group: 'Mobile & desktop', items: ['Expo', 'React Native', 'Tauri'] },
  { group: 'Backend', items: ['Node.js', 'Express', 'NestJS', 'Prisma'] },
  { group: 'Data', items: ['MySQL', 'MariaDB'] },
  { group: 'Testing', items: ['Vitest', 'Jest', 'Supertest'] },
]

export type Project = {
  slug: string
  name: string
  year: string
  status: 'Live' | 'In progress'
  kind: string
  /** One line for the hover preview in the work index. */
  short: string
  summary: string
  /** A short personal line about the project. */
  note: string
  /** What Maya, the guide bird, says about it. */
  guide: string
  stack: string[]
  image: ImageKey
  links: { label: string; href: string }[]
}

export const projects: Project[] = [
  {
    slug: 'tumbli',
    name: 'Tumbli',
    year: '2026',
    status: 'Live',
    kind: 'Windows app',
    short: 'A floating water buddy that reminds you to drink and take breaks.',
    summary:
      'A floating water buddy for Windows. A little bottle with a face docks at the edge of the screen, fills up as you drink, and reminds you to take a break.',
    note: 'It sits at the edge of your screen and reminds you to drink water while you work.',
    guide: 'Tumbli is a water buddy. Like me, but a bottle!',
    stack: ['Tauri 2', 'Rust', 'React', 'TypeScript', 'Vite'],
    image: 'projects/tumbli',
    links: [
      { label: 'Microsoft Store', href: 'https://apps.microsoft.com/detail/9N6798TPR3KX' },
      { label: 'Source', href: 'https://github.com/adrianniel/Tumbli' },
    ],
  },
  {
    slug: 'iqueue',
    name: 'iQueue',
    year: '2026',
    status: 'In progress',
    kind: 'Mobile + web',
    short: 'Campus queues without the standing in line: app, portal and live board.',
    summary:
      'Queue management for campus offices: a student mobile app, an admin portal and a live display board, so nobody has to stand in line to wait.',
    note: 'What I am building right now. Real students, real lines, real deadlines.',
    guide: 'iQueue: so nobody has to stand in line.',
    stack: ['Expo', 'React Native', 'Next.js', 'Express', 'Prisma', 'MariaDB'],
    image: 'projects/iqueue',
    links: [],
  },
  {
    slug: 'lisa',
    name: 'L.I.S.A.',
    year: '2025',
    status: 'Live',
    kind: 'Web system',
    short: "Irrigation surveys on a map, with reports and analysis for Bohol's farmers.",
    summary:
      'Local Irrigation System Assessment for BISU Bilar. Farmer surveys plotted on a map, reports for the irrigation office, and AI-assisted analysis.',
    note: 'Built for farmers in Bohol. My favorite kind of user.',
    guide: 'L.I.S.A. helps farmers right here in Bohol.',
    stack: ['React', 'Express', 'OpenLayers', 'MySQL'],
    image: 'projects/lisa',
    links: [{ label: 'Visit site', href: 'https://lisa.bisubilar.org/' }],
  },
  {
    slug: 'dagohoy',
    name: 'Dagohoy Pharmacy',
    year: '2026',
    status: 'Live',
    kind: 'Point of sale',
    short: 'Sales, stock, batches and expiry dates for a real pharmacy counter.',
    summary:
      'Point-of-sale and inventory workspace for a pharmacy: barcode encoding, batch and expiry tracking, suppliers, and role-based screens for owners, admins and cashiers.',
    note: 'Used behind a real counter every day.',
    guide: 'This one runs a real pharmacy counter.',
    stack: ['React', 'TypeScript', 'Vite', 'NestJS', 'MySQL'],
    image: 'projects/dagohoy',
    links: [
      { label: 'Visit site', href: 'https://dagohoypharmacy.boncales.com/' },
      { label: 'Source', href: 'https://github.com/adrianniel/Dagohoy-Pharmacy-Web' },
    ],
  },
]

export type Certificate = {
  title: string
  issuer: string
  detail: string
  date: string
  image: ImageKey
  verify: string
}

export const certificates: Certificate[] = [
  {
    title: 'Information Management',
    issuer: 'CodeChum',
    detail: 'MySQL · score 1127 / 1130',
    date: 'Feb 2026',
    image: 'certificates/codechum-information-management',
    verify: 'https://app.codechum.com/certificates/22149',
  },
  {
    title: 'C++ Data Structures',
    issuer: 'CodeChum',
    detail: 'Data Structures and Algorithms · score 1050 / 1100',
    date: 'Sep 2025',
    image: 'certificates/codechum-cpp-data-structures',
    verify: 'https://app.codechum.com/certificates/13318',
  },
  {
    title: 'Responsive Web Design',
    issuer: 'freeCodeCamp',
    detail: 'Developer certification · about 300 hours',
    date: 'Jul 2025',
    image: 'certificates/fcc-responsive-web-design',
    verify: 'https://freecodecamp.org/certification/adrianniel/responsive-web-design',
  },
  {
    title: 'Java Object-Oriented Programming',
    issuer: 'CodeChum',
    detail: 'CS 122 · score 1937 / 1965',
    date: 'May 2025',
    image: 'certificates/codechum-java-oop',
    verify: 'https://app.codechum.com/certificates/11473',
  },
]
