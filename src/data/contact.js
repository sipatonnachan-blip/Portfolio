export const PROFILE = {
  name: 'Christian Delapos',
  title: 'Full-Stack Web Developer',
  location: 'Davao City, Philippines',
  avatar: '/images/avatar-5.jpg',
  avatarHover: '/images/avatar-shy.jpg',
  avatarNight: '/images/avatar-night.jpg',
  avatarNightHover: '/images/avatar-night-shy.jpg',
  email: 'delapos.christian2002@gmail.com',
  phone: '+639486131385',
  phoneDisplay: '+63 948 613 1385',
}

export const GITHUB_URL = 'https://github.com/Xtian-Xtian/Xtian-Xtian'
export const LINKEDIN_URL = 'https://www.linkedin.com/in/christiandelapos'

export const SOCIALS = [
  { name: 'GitHub', icon: 'logo-github', url: GITHUB_URL },
  { name: 'LinkedIn', icon: 'logo-linkedin', url: LINKEDIN_URL },
]

// Email is not repeated here; the copy-to-clipboard panel above the grid on
// the Contact page already leads with it.
export const CONTACT_OPTIONS = [
  {
    icon: 'call-outline',
    label: 'Phone',
    value: PROFILE.phoneDisplay,
    href: `tel:${PROFILE.phone}`,
    external: false,
  },
  {
    icon: 'logo-linkedin',
    label: 'LinkedIn',
    value: 'christiandelapos',
    href: LINKEDIN_URL,
    external: true,
  },
  {
    icon: 'logo-github',
    label: 'GitHub',
    value: 'Xtian-Xtian',
    href: GITHUB_URL,
    external: true,
  },
]
