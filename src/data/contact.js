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

export const SOCIALS = [
  { name: 'Facebook', icon: 'logo-facebook', url: 'https://facebook.com/ChanDe02' },
  { name: 'LinkedIn', icon: 'logo-linkedin', url: 'https://linkedin.com' },
  { name: 'GitHub', icon: 'logo-github', url: 'https://github.com' },
]

export const CONTACT_OPTIONS = [
  {
    icon: 'mail-outline',
    label: 'Email',
    value: PROFILE.email,
    href: `mailto:${PROFILE.email}`,
    external: false,
  },
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
    value: 'Connect with me',
    href: 'https://linkedin.com',
    external: true,
  },
  {
    icon: 'logo-github',
    label: 'GitHub',
    value: 'Explore Repositories',
    href: 'https://github.com',
    external: true,
  },
  {
    icon: 'logo-facebook',
    label: 'Facebook',
    value: 'Connect on Social',
    href: 'https://facebook.com/ChanDe02',
    external: true,
  },
]
