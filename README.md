# Christian Delapos — Portfolio

Full-stack developer portfolio, built with **React** and **Tailwind CSS** (via Vite).

## Tech Stack

- **React 18** — component-driven UI
- **Tailwind CSS 3** — utility-first styling, theme colors driven by CSS variables for light/dark ("Eye Comfort") mode
- **Vite** — dev server and production bundler
- **Ionicons** (web component, loaded via CDN) — iconography

## Project Structure

```
src/
  components/    Sidebar, ImageModal (project screenshot lightbox)
  pages/         Home, TechStack, Projects, About, Experience, Contact
  data/          Content as plain data (nav items, projects, tech stack, experience, contact)
  hooks/         useTheme (persists light/dark preference to localStorage)
  App.jsx        Top-level layout + page switching (client-side, no router)
  index.css      Tailwind directives + CSS custom properties for theming
public/
  images/        All portfolio images/screenshots (served at /images/...)
```

Content lives in `src/data/*.js` — update those files to change copy, add projects, or edit experience entries without touching component markup.

## Getting Started

```bash
npm install
npm run dev      # start local dev server (http://localhost:5173)
npm run build    # production build -> dist/
npm run preview  # preview the production build locally
```

## Legacy Static Site

The original static HTML/CSS/JS version of this site is preserved under [`legacy-static/`](legacy-static/) for reference. It is not built or served by the current app.
