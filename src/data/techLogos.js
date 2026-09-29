import {
  SiLaravel,
  SiPhp,
  SiMysql,
  SiFirebase,
  SiNodedotjs,
  SiTailwindcss,
  SiJavascript,
  SiReact,
  SiVuedotjs,
  SiHtml5,
  SiCss,
  SiVite,
  SiGit,
  SiGithub,
  SiNginx,
  SiRender,
  SiComposer,
  SiNpm,
  SiPhpmyadmin,
} from 'react-icons/si'
import { TECH_STACK_CATEGORIES } from './techStack'

// Brand logo + colour per skill. A null colour inherits the text colour so
// monochrome logos stay visible in both themes. Skills without a logo
// (concepts like "REST APIs") are left out of logo displays.
export const TECH_LOGOS = {
  Laravel: [SiLaravel, '#FF2D20'],
  PHP: [SiPhp, '#777BB4'],
  MySQL: [SiMysql, '#4479A1'],
  Firebase: [SiFirebase, '#FFCA28'],
  'Node.js': [SiNodedotjs, '#5FA04E'],
  'Tailwind CSS': [SiTailwindcss, '#06B6D4'],
  JavaScript: [SiJavascript, '#F7DF1E'],
  React: [SiReact, '#61DAFB'],
  'Vue.js': [SiVuedotjs, '#4FC08D'],
  HTML5: [SiHtml5, '#E34F26'],
  CSS3: [SiCss, '#663399'],
  Vite: [SiVite, '#646CFF'],
  Git: [SiGit, '#F05032'],
  GitHub: [SiGithub, null],
  Nginx: [SiNginx, '#009639'],
  Render: [SiRender, null],
  Composer: [SiComposer, '#885630'],
  npm: [SiNpm, '#CB3837'],
  phpMyAdmin: [SiPhpmyadmin, '#6C78AF'],
}

// Every skill in the stack that has a logo, in stack order.
export const LOGO_SKILLS = TECH_STACK_CATEGORIES.flatMap((cat) => cat.skills).filter(
  (skill) => TECH_LOGOS[skill]
)
