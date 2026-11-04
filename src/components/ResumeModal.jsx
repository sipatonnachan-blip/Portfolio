import { useEffect } from 'react'
import Icon from './Icon'

function printResume() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Christian Delapos — Resume</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', Arial, sans-serif; font-size: 11.5pt; color: #111; background: #fff; padding: 28px 36px; }
  h1 { font-size: 22pt; font-weight: 700; letter-spacing: -0.02em; }
  .title { font-size: 9pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #1e3a5f; margin-top: 4px; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 14px; margin-bottom: 16px; gap: 20px; }
  .contact { font-size: 9pt; color: #444; text-align: right; line-height: 1.7; }
  .section-title { font-size: 8pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #1e3a5f; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin: 14px 0 8px; }
  .role-hd { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .role-name { font-size: 11pt; font-weight: 700; }
  .role-date { font-size: 9pt; color: #666; font-style: italic; }
  .role-company { font-size: 10pt; font-weight: 600; color: #1e3a5f; margin: 2px 0 6px; }
  ul { list-style: none; display: flex; flex-direction: column; gap: 3px; margin-bottom: 12px; }
  li { display: flex; gap: 7px; font-size: 10pt; color: #333; line-height: 1.45; }
  li::before { content: '▸'; color: #1e3a5f; font-size: 8pt; margin-top: 2pt; flex-shrink: 0; }
  .skills { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 32px; }
  .skill-row { display: flex; gap: 6px; font-size: 10pt; }
  .skill-cat { font-weight: 700; min-width: 64px; flex-shrink: 0; color: #111; }
  .skill-val { color: #333; }
  p { font-size: 10.5pt; color: #333; line-height: 1.6; }
  @page { margin: 18mm 20mm; size: A4 portrait; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<header>
  <div>
    <h1>Christian Delapos</h1>
    <div class="title">Full-Stack Web Developer</div>
  </div>
  <div class="contact">
    +63 948 613 1385<br>
    delapos.christian2002@gmail.com<br>
    linkedin.com/in/christiandelapos<br>
    github.com/Xtian-Xtian<br>
    Davao City, Philippines
  </div>
</header>

<div class="section-title">Professional Summary</div>
<p>Full-stack developer with 1+ year of professional experience and a 5-year background in technology. At DSG Son's Group, I have architected and shipped two production web applications — owning the full stack from authenticated login to Nginx server configuration. Specialized in Laravel, React, MySQL, and Tailwind CSS, with hands-on production deployment experience on live servers.</p>

<div class="section-title">Work Experience</div>

<div class="role-hd"><span class="role-name">Full-Stack Developer</span><span class="role-date">July 2025 – Present</span></div>
<div class="role-company">DSG Son's Group, Inc. · Davao City</div>
<ul>
  <li>Architected and shipped 2 production web applications — full ownership from schema design to live Nginx server</li>
  <li>Engineered role-based authentication with session management and granular permission controls</li>
  <li>Delivered mobile-first, accessible UIs in Tailwind CSS; matched stakeholder specifications on first review</li>
  <li>Redesigned MySQL schemas to eliminate N+1 query patterns, reducing database load on key endpoints</li>
  <li>Configured and maintained production Nginx servers with SSL termination and zero-downtime deploys</li>
  <li>Built and deployed a multi-user Expense Tracker with authenticated accounts and monthly budget summaries, live on Render</li>
</ul>

<div class="role-hd"><span class="role-name">IT Intern</span><span class="role-date">April – May 2025</span></div>
<div class="role-company">Local Government Unit of Maragusan · Compostela Valley</div>
<ul>
  <li>Installed and configured hardware and software across government office workstations</li>
  <li>Resolved technical issues for office personnel under time pressure, minimising workflow disruption</li>
  <li>Identified process improvements that measurably reduced manual IT workload across departments</li>
</ul>

<div class="role-hd"><span class="role-name">IT Support Technician</span><span class="role-date">2021 – 2025</span></div>
<div class="role-company">Davao Oriental State University · IT Department</div>
<ul>
  <li>Maintained hardware and software across faculty and student workstations — installation, configuration, and fault resolution</li>
  <li>Diagnosed and resolved network, hardware, and software faults for an active department, developing systematic triage habits that now accelerate debugging in development</li>
  <li>Architected and deployed custom landing pages and interfaces; developed an Expense Tracker application from scratch</li>
</ul>

<div class="section-title">Education</div>
<div class="role-hd"><span class="role-name">Davao Oriental State University</span><span class="role-date">2021 – 2025</span></div>
<p style="margin-top:3px;color:#333;font-size:10pt">Bachelor of Science in Information Technology</p>

<div class="section-title">Technical Skills</div>
<div class="skills">
  <div class="skill-row"><span class="skill-cat">Backend</span><span class="skill-val">PHP, Laravel, Node.js, REST APIs, MVC, Authentication</span></div>
  <div class="skill-row"><span class="skill-cat">Frontend</span><span class="skill-val">React, JavaScript, HTML5, CSS3, Tailwind CSS, Vite</span></div>
  <div class="skill-row"><span class="skill-cat">Database</span><span class="skill-val">MySQL, Schema Design, Query Optimisation, phpMyAdmin</span></div>
  <div class="skill-row"><span class="skill-cat">DevOps</span><span class="skill-val">Nginx, Git, GitHub, Render, SSL Configuration</span></div>
  <div class="skill-row"><span class="skill-cat">Tools</span><span class="skill-val">Composer, npm, WordPress, AI-Augmented Development</span></div>
  <div class="skill-row"><span class="skill-cat">Support</span><span class="skill-val">Hardware/Software Troubleshooting, System Maintenance</span></div>
</div>

<script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return
  win.document.write(html)
  win.document.close()
}

const CONTACT = [
  { icon: 'call-outline',      label: '+63 948 613 1385' },
  { icon: 'mail-outline',      label: 'delapos.christian2002@gmail.com' },
  { icon: 'logo-linkedin',     label: 'linkedin.com/in/christiandelapos' },
  { icon: 'logo-github',       label: 'github.com/Xtian-Xtian' },
  { icon: 'location-outline',  label: 'Davao City, Philippines' },
]

const EXPERIENCE = [
  {
    title: 'Full-Stack Developer',
    company: "DSG Son's Group, Inc.",
    location: 'Davao City',
    date: 'July 2025 – Present',
    bullets: [
      'Architected and shipped 2 production web applications — full ownership from schema design to live Nginx server',
      'Engineered role-based authentication with session management and granular permission controls',
      'Delivered mobile-first, accessible UIs in Tailwind CSS; matched stakeholder specifications on first review',
      'Redesigned MySQL schemas to eliminate N+1 query patterns, reducing database load on key endpoints',
      'Configured and maintained production Nginx servers with SSL termination and zero-downtime deploys',
      'Built and deployed a multi-user Expense Tracker with authenticated accounts and monthly budget summaries, live on Render',
    ],
  },
  {
    title: 'IT Intern',
    company: 'Local Government Unit of Maragusan',
    location: 'Compostela Valley',
    date: 'April – May 2025',
    bullets: [
      'Installed and configured hardware and software across government office workstations',
      'Resolved technical issues for office personnel under time pressure, minimising workflow disruption',
      'Identified process improvements that measurably reduced manual IT workload across departments',
    ],
  },
  {
    title: 'IT Support Technician',
    company: 'Davao Oriental State University',
    location: 'IT Department',
    date: '2021 – 2025',
    bullets: [
      'Maintained hardware and software across faculty and student workstations — installation, configuration, and fault resolution',
      'Diagnosed and resolved network, hardware, and software faults for an active department, developing systematic triage habits that now accelerate debugging in development',
      'Architected and deployed custom landing pages and interfaces; developed an Expense Tracker application from scratch',
    ],
  },
]

const SKILLS = [
  { cat: 'Backend',   vals: 'PHP, Laravel, Node.js, REST APIs, MVC, Authentication' },
  { cat: 'Frontend',  vals: 'React, JavaScript, HTML5, CSS3, Tailwind CSS, Vite' },
  { cat: 'Database',  vals: 'MySQL, Schema Design, Query Optimisation, phpMyAdmin' },
  { cat: 'DevOps',    vals: 'Nginx, Git, GitHub, Render, SSL Configuration' },
  { cat: 'Tools',     vals: 'Composer, npm, WordPress, AI-Augmented Development' },
  { cat: 'Support',   vals: 'Hardware/Software Troubleshooting, System Maintenance' },
]

export default function ResumeModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Resume"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm transition-opacity duration-300 sm:px-6 ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* Panel */}
      <div
        className={`relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-bg-card shadow-2xl transition-transform duration-300 ${
          open ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* ── Toolbar ── */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
              <Icon name="document-text-outline" className="text-sm" />
            </span>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand">
              Resume · Christian Delapos
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={printResume}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 font-sans text-xs font-semibold text-bg-card shadow-sm transition-all hover:opacity-90 active:scale-95"
            >
              <Icon name="print-outline" className="text-sm" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close resume"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-card text-text shadow-sm transition-all hover:border-text-mid hover:bg-bg-alt"
            >
              <Icon name="close-outline" className="text-base" />
            </button>
          </div>
        </div>

        {/* ── Scrollable resume body ── */}
        <div className="resume-print overflow-y-auto p-6 sm:p-8">

          {/* Header */}
          <header className="mb-5 flex flex-col gap-4 border-b-2 border-text pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-sans text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                Christian Delapos
              </h1>
              <p className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-brand">
                Full-Stack Web Developer
              </p>
            </div>
            <ul className="flex flex-col gap-1 sm:items-end">
              {CONTACT.map((c) => (
                <li key={c.label} className="flex items-center gap-1.5 text-[11px] text-text-mid sm:flex-row-reverse">
                  <Icon name={c.icon} className="flex-shrink-0 text-[12px] text-brand" />
                  <span>{c.label}</span>
                </li>
              ))}
            </ul>
          </header>

          {/* Summary */}
          <section className="mb-5">
            <div className="resume-section-title">Professional Summary</div>
            <p className="text-[13px] leading-relaxed text-text-mid">
              Full-stack developer with 1+ year of professional experience and a 5-year background in technology.
              At DSG Son's Group, I have architected and shipped two production web applications — owning the full
              stack from authenticated login to Nginx server configuration. Specialized in Laravel, React, MySQL,
              and Tailwind CSS, with hands-on production deployment experience on live servers.
            </p>
          </section>

          {/* Experience */}
          <section className="mb-5">
            <div className="resume-section-title">Work Experience</div>
            <div className="space-y-5">
              {EXPERIENCE.map((role) => (
                <div key={role.title}>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                    <span className="font-sans text-[14px] font-bold text-text">{role.title}</span>
                    <span className="font-mono text-[11px] italic text-text-light">{role.date}</span>
                  </div>
                  <p className="mb-2 font-sans text-[12px] font-semibold text-brand">
                    {role.company} · {role.location}
                  </p>
                  <ul className="space-y-1">
                    {role.bullets.map((b) => (
                      <li key={b} className="flex gap-2 text-[12.5px] leading-relaxed text-text-mid">
                        <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="mb-5">
            <div className="resume-section-title">Education</div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
              <span className="font-sans text-[14px] font-bold text-text">Davao Oriental State University</span>
              <span className="font-mono text-[11px] italic text-text-light">2021 – 2025</span>
            </div>
            <p className="text-[12.5px] text-text-mid">Bachelor of Science in Information Technology</p>
          </section>

          {/* Skills */}
          <section>
            <div className="resume-section-title">Technical Skills</div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2">
              {SKILLS.map((s) => (
                <div key={s.cat} className="flex gap-2 text-[12px]">
                  <span className="w-16 flex-shrink-0 font-semibold text-text">{s.cat}</span>
                  <span className="text-text-mid">{s.vals}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      <style>{`
        .resume-section-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--brand);
          border-bottom: 1px solid var(--border);
          padding-bottom: 5px;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  )
}
