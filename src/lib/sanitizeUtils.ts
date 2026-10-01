const SAFE_LINK_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:']
const WEB_PROTOCOLS = ['http:', 'https:']
const HOSTNAME_WITHOUT_PROTOCOL =
  /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(?=$|[/?#:])/i
const INTERNAL_PAGE_PATH = /^\/[a-z0-9-]*$/i

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/**
 * Escapes a plain text value so it can be interpolated into an HTML string
 * (e.g. for maplibre popups, which are rendered via innerHTML).
 */
export const escapeHtml = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char])

const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

/**
 * Returns the given website URL if it uses http(s). URLs without a protocol
 * that look like a hostname (e.g. "www.example.org") get "https://" prepended.
 * Anything else (javascript:, data:, vbscript:, …) is rejected.
 */
export const getSafeExternalUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const url = parseUrl(trimmed)
  if (url) return WEB_PROTOCOLS.includes(url.protocol) ? trimmed : undefined
  if (HOSTNAME_WITHOUT_PROTOCOL.test(trimmed)) return `https://${trimmed}`
  return undefined
}

/**
 * Returns the given link target if it is a same-origin path or uses one of
 * the protocols http, https, mailto or tel. Used for editorial link texts.
 */
export const getSafeHref = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (/^\/(?![/\\])/.test(trimmed) || trimmed.startsWith('#')) return trimmed
  const url = parseUrl(trimmed)
  if (url)
    return SAFE_LINK_PROTOCOLS.includes(url.protocol) ? trimmed : undefined
  return getSafeExternalUrl(trimmed)
}

/**
 * Validates the "back" query parameter. Only single-segment internal page
 * paths such as "/", "/map" or "/123" are accepted, everything else falls
 * back to the given default to prevent open redirects and javascript: links.
 */
export const getSafeBackPath = (value: unknown, fallback = '/'): string =>
  typeof value === 'string' && INTERNAL_PAGE_PATH.test(value) ? value : fallback
