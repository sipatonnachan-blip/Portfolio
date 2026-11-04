// Drives both the Home showcase deck and the Projects page. `badge` is the
// headline pill on the deck card; tag chips are derived from `tech`.
export const FEATURED_PROJECTS = [
  {
    title: 'Photo Booth',
    badge: 'INTERACTIVE APP',
    description: 'A live photo booth — capture, filter and frame photos right in the browser',
    tech: 'React • Canvas API • getUserMedia • CSS Filters',
    image: null,
    link: null,
    interactive: true,
  },
  {
    title: 'Neon Strike',
    badge: 'C++ DESKTOP GAME',
    description: 'A single-file Win32 + GDI+ 2D side-scrolling shooter — procedural stickman animation, three weapons, four enemy types, parallax neon skyline, and wave-based progression. Compiles from one .cpp with no external assets.',
    tech: 'C++ • Win32 • GDI+ • MinGW / MSVC',
    image: '/images/neon-strike.svg',
    link: '/game/neon-strike/NeonStrike.exe',
  },
  {
    title: 'Monthly Tracker',
    badge: '#1 FINANCE APP',
    description: 'Multi-user expense tracker with authenticated accounts, categorised transaction history, and monthly budget summaries — Laravel backend, MySQL, deployed live on Render.',
    tech: 'Laravel • MySQL • Tailwind • Render',
    image: '/images/case 1.png',
    link: 'https://monthly-tracker-mdjt.onrender.com/',
  },
  {
    title: 'ScheduLink',
    badge: '#1 SCHEDULING SUITE',
    description: 'Scheduling suite with conflict-detection logic and role-separated views for organizers and attendees — Laravel and React frontend served via production Nginx.',
    tech: 'Laravel • React • MySQL • Nginx',
    image: '/images/dashboard-schedulink.png',
    link: null,
  },
  {
    title: 'Weevil Suite',
    badge: '#1 GEOSPATIAL HUB',
    description: 'Geospatial research platform for weevil taxonomy — interactive mapping, specimen repository, and taxonomic key across five interconnected modules on a single Nginx server.',
    tech: 'Laravel • JavaScript • MySQL • Nginx',
    image: '/images/pro (1).png',
    link: null,
  },
]

export const ALL_PROJECTS = [
  { title: 'ROP Dashboard', category: 'Admin Panel', image: '/images/dashboard-rop.png' },
  { title: 'Batch Request', category: 'System', image: '/images/batch request.png' },
  { title: 'Weevil Dashboard', category: 'Analytics', image: '/images/pro (2).png' },
  { title: 'Weevil Login', category: 'Auth System', image: '/images/pro (3).png' },
  { title: 'Weevil Taxonomic Key', category: 'Data Tool', image: '/images/pro (4).png' },
  { title: 'Weevil Landing Page', category: 'Marketing', image: '/images/pro (5).png' },
  { title: 'Weevil Repository', category: 'Data Hub', image: '/images/pro (6).png' },
  { title: 'Suast Dashboard', category: 'Management', image: '/images/pro (8).png' },
]

// Public repos on github.com/Xtian-Xtian, most recently pushed first. The
// profile README repo and the old portfolio are left out. `title` is the
// display name; `repo` is the actual repository name.
export const GITHUB_REPOS = [
  { title: 'Finance', repo: '-Finance', language: 'TypeScript' },
  { title: 'CashFlow', repo: 'CashFlow', language: 'Blade' },
  { title: 'ROP', repo: 'ROP', language: null },
  { title: 'ScheduLink', repo: 'schedulink', language: 'PHP' },
  { title: 'Grad Message', repo: 'Grad-Message', language: 'HTML' },
  { title: 'TeachEval Admin', repo: 'Teacheval-admin', language: 'JavaScript' },
  { title: 'TeachEval', repo: 'Teacheval', language: 'JavaScript', homepage: 'https://teacheval.vercel.app' },
  { title: 'Pweevils', repo: 'Pweevils', language: 'JavaScript' },
  { title: 'Tourist', repo: 'Tourist', language: 'JavaScript' },
  { title: 'Capstone', repo: 'Capstone', language: 'JavaScript' },
  { title: 'API Activity', repo: 'API-activity', language: null },
  { title: 'Login', repo: 'Login', language: null },
]
