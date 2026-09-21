// Collects the information any website can silently read about a visitor.
// Everything here is standard, permission-free browser API surface — it is
// gathered locally, rendered once in the Alt+K awareness demo, and never sent
// anywhere. The single outbound call is to a public IP-echo service, which is
// exactly the point being demonstrated: a page load is enough.

const UNKNOWN = 'unavailable'

// --- individual probes -------------------------------------------------

function browserInfo() {
  const ua = navigator.userAgent
  const brands = navigator.userAgentData?.brands
    ?.filter((b) => !/not.a.brand/i.test(b.brand))
    .map((b) => `${b.brand} ${b.version}`)

  if (brands?.length) return brands.join(', ')

  const match = ua.match(/(Edg|OPR|Chrome|Firefox|Safari)\/([\d.]+)/)
  if (!match) return UNKNOWN
  const names = { Edg: 'Edge', OPR: 'Opera' }
  return `${names[match[1]] ?? match[1]} ${match[2].split('.')[0]}`
}

function osInfo() {
  const platform = navigator.userAgentData?.platform
  if (platform) return platform

  const ua = navigator.userAgent
  const android = ua.match(/Android ([\d.]+)/)
  if (/Windows NT 10/.test(ua)) return 'Windows 10/11'
  if (/Windows/.test(ua)) return 'Windows'
  if (android) return `Android ${android[1]}`
  if (/iPhone|iPad/.test(ua)) return 'iOS'
  if (/Mac OS X/.test(ua)) return 'macOS'
  if (/Linux/.test(ua)) return 'Linux'
  return UNKNOWN
}

// effectiveType never reports "5g" — the spec caps that bucket at "4g" — so a
// fast cellular link gets described honestly rather than guessed at.
function connectionInfo() {
  const c =
    navigator.connection ?? navigator.mozConnection ?? navigator.webkitConnection
  if (!c)
    return {
      value: 'withheld by this browser',
      note: 'Safari and Firefox refuse this one — that is the browser doing its job',
    }

  const carrier = c.type === 'cellular' ? 'Mobile data' : c.type
  const bucket = c.effectiveType ? c.effectiveType.toUpperCase() : null
  const speed = c.downlink ? `~${c.downlink} Mbps` : null
  const latency = c.rtt ? `${c.rtt} ms round-trip` : null
  const fast = (c.downlink ?? 0) >= 10

  return {
    value: [carrier, bucket, speed, latency].filter(Boolean).join(' · ') || UNKNOWN,
    note:
      bucket === '4G' && fast
        ? '"4G" is the highest bucket browsers report — this speed is 4G+/5G class'
        : c.saveData
          ? 'Data-saver mode is on'
          : 'Reported without asking you',
  }
}

function gpuInfo() {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')
    if (!gl) return UNKNOWN
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    if (!ext) return gl.getParameter(gl.RENDERER) ?? UNKNOWN
    return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? UNKNOWN
  } catch {
    return UNKNOWN
  }
}

async function batteryInfo() {
  try {
    if (!navigator.getBattery) return null
    const b = await navigator.getBattery()
    return `${Math.round(b.level * 100)}% · ${b.charging ? 'charging' : 'on battery'}`
  } catch {
    return null
  }
}

async function storageInfo() {
  try {
    const { quota } = (await navigator.storage?.estimate?.()) ?? {}
    if (!quota) return null
    return `${(quota / 1024 ** 3).toFixed(1)} GB available to this site`
  } catch {
    return null
  }
}

// Device *labels* need permission; the count and the kind do not.
async function deviceInfo() {
  try {
    const devices = (await navigator.mediaDevices?.enumerateDevices?.()) ?? []
    if (!devices.length) return null
    const cams = devices.filter((d) => d.kind === 'videoinput').length
    const mics = devices.filter((d) => d.kind === 'audioinput').length
    return `${cams} camera(s), ${mics} microphone(s) detected`
  } catch {
    return null
  }
}

// The only network request in the demo. Falls back through public echo
// services, then gives up quietly rather than blocking the reveal.
async function networkIdentity() {
  const timeout = (ms) => AbortSignal.timeout?.(ms)

  try {
    const res = await fetch('https://ipwho.is/', { signal: timeout(4000) })
    const d = await res.json()
    if (d?.success !== false && d?.ip) {
      return {
        ip: d.ip,
        location: [d.city, d.region, d.country].filter(Boolean).join(', '),
        isp: d.connection?.isp ?? d.connection?.org ?? null,
        asn: d.connection?.asn ? `AS${d.connection.asn}` : null,
      }
    }
  } catch {
    /* fall through to the simpler service */
  }

  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: timeout(4000),
    })
    const d = await res.json()
    if (d?.ip) return { ip: d.ip }
  } catch {
    /* no network identity available */
  }

  return null
}

// --- public API --------------------------------------------------------

// Resolves to rows of { label, value, note }, ordered the way the demo
// reveals them: instant local reads first, then the network lookup.
export async function collectExposedData() {
  const rows = []
  // A probe that came back empty or unreadable is left out entirely — the
  // point of the reveal is what the browser *did* hand over.
  const push = (label, value, note) => {
    if (value && value !== UNKNOWN) rows.push({ label, value, note })
  }

  const conn = connectionInfo()
  const offsetHours = -new Date().getTimezoneOffset() / 60

  push('Browser', browserInfo(), 'Version and engine, down to the build')
  push('Operating system', osInfo(), 'Plus device class and architecture')
  push('Connection', conn.value, conn.note)
  push(
    'Screen',
    `${window.screen.width} × ${window.screen.height} · ${window.devicePixelRatio}x · ${window.screen.colorDepth}-bit`,
    `Window currently ${window.innerWidth} × ${window.innerHeight}`
  )
  push('Graphics card', gpuInfo(), 'Readable through WebGL, no prompt needed')
  push(
    'Hardware',
    [
      navigator.hardwareConcurrency
        ? `${navigator.hardwareConcurrency} CPU threads`
        : null,
      navigator.deviceMemory ? `${navigator.deviceMemory} GB RAM (approx.)` : null,
      navigator.maxTouchPoints ? `${navigator.maxTouchPoints} touch points` : null,
    ]
      .filter(Boolean)
      .join(' · '),
    'Enough to tell your machine apart from the next one'
  )
  push(
    'Time zone',
    `${Intl.DateTimeFormat().resolvedOptions().timeZone} (UTC${offsetHours >= 0 ? '+' : ''}${offsetHours})`,
    'Narrows down where you are before any IP lookup'
  )
  push(
    'Languages',
    (navigator.languages ?? [navigator.language]).join(', '),
    'Often hints at your country and first language'
  )
  push(
    'Privacy settings',
    [
      `cookies ${navigator.cookieEnabled ? 'enabled' : 'blocked'}`,
      navigator.doNotTrack === '1' ? 'Do Not Track on' : 'Do Not Track off',
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'prefers dark'
        : 'prefers light',
    ].join(' · '),
    'Even your preferences are part of the fingerprint'
  )
  push(
    'This session',
    `${history.length} page(s) in tab history${
      document.referrer ? ` · arrived from ${new URL(document.referrer).hostname}` : ''
    }`,
    'Where you came from travels with you'
  )

  const [battery, storage, devices] = await Promise.all([
    batteryInfo(),
    storageInfo(),
    deviceInfo(),
  ])

  push('Battery', battery, 'A precise-enough value to re-identify you later')
  push('Disk', storage, 'How much of your drive a site may claim')
  push('Peripherals', devices, 'Counted without touching a permission prompt')

  const net = await networkIdentity()
  if (net) {
    push('Public IP address', net.ip, 'Sent with every single request you make')
    push(
      'Approximate location',
      net.location,
      'Derived from that IP alone — no GPS, no permission'
    )
    push('Internet provider', net.isp, net.asn ? `Network ${net.asn}` : undefined)
  } else {
    push(
      'Public IP address',
      'lookup blocked',
      'A tracker blocker or offline network stopped this one — good.'
    )
  }

  return rows
}
