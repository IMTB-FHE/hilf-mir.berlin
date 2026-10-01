const isDev = process.env.NODE_ENV !== 'production'

const getOrigin = (url) => {
  try {
    return new URL(url).origin
  } catch (error) {
    return null
  }
}

const mapOrigins = [
  'https://api.maptiler.com',
  getOrigin(process.env.NEXT_PUBLIC_MAPTILER_STYLE_URL),
]
const matomoOrigin = getOrigin(process.env.NEXT_PUBLIC_MATOMO_URL)
const unique = (sources) => [...new Set(sources.filter(Boolean))].join(' ')

const contentSecurityPolicy = [
  `default-src 'self'`,
  `script-src 'self'${isDev ? ` 'unsafe-eval'` : ''}`,
  // next/image and maplibre set inline styles
  `style-src 'self' 'unsafe-inline'`,
  `img-src ${unique([
    `'self'`,
    'data:',
    'blob:',
    ...mapOrigins,
    matomoOrigin,
  ])}`,
  // swiper embeds its icon font as data: URI
  `font-src 'self' data:`,
  `connect-src ${unique([`'self'`, ...mapOrigins, isDev && 'ws:'])}`,
  // maplibre runs its web workers from blob: URLs
  `worker-src 'self' blob:`,
  `child-src 'self' blob:`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(self), camera=(), microphone=(), payment=(), usb=()',
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // swcMinify: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

module.exports = nextConfig
