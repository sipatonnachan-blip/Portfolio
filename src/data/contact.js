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

export const GITHUB_URL = 'https://github.com/sipatonnachan-blip'
export const FACEBOOK_URL = 'https://facebook.com/ChanDe02'

// Only real, working profiles belong here — a bare https://linkedin.com link
// went nowhere. Add LinkedIn back with the actual profile URL when there is one.
export const SOCIALS = [
  { name: 'GitHub', icon: 'logo-github', url: GITHUB_URL },
  { name: 'Facebook', icon: 'logo-facebook', url: FACEBOOK_URL },
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
    icon: 'logo-github',
    label: 'GitHub',
    value: 'sipatonnachan-blip',
    href: GITHUB_URL,
    external: true,
  },
  {
    icon: 'logo-facebook',
    label: 'Facebook',
    value: 'ChanDe02',
    href: FACEBOOK_URL,
    external: true,
  },
]
