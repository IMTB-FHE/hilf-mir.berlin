import {
  escapeHtml,
  getSafeBackPath,
  getSafeExternalUrl,
  getSafeHref,
} from './sanitizeUtils'

describe('escapeHtml', () => {
  test('escapes HTML control characters', () => {
    expect(escapeHtml(`<img src=x onerror="alert('x')">&`)).toBe(
      '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;'
    )
  })

  test('returns an empty string for nullish values', () => {
    expect(escapeHtml(undefined)).toBe('')
    expect(escapeHtml(null)).toBe('')
  })
})

describe('getSafeExternalUrl', () => {
  test('keeps http and https URLs', () => {
    expect(getSafeExternalUrl('https://www.example.org/a?b=c')).toBe(
      'https://www.example.org/a?b=c'
    )
    expect(getSafeExternalUrl(' http://example.org ')).toBe(
      'http://example.org'
    )
  })

  test('prepends https to hostnames without protocol', () => {
    expect(getSafeExternalUrl('www.example.org')).toBe(
      'https://www.example.org'
    )
    expect(getSafeExternalUrl('example.org/kontakt')).toBe(
      'https://example.org/kontakt'
    )
  })

  test('rejects script and other non-web protocols', () => {
    expect(getSafeExternalUrl('javascript:alert(1)')).toBeUndefined()
    expect(getSafeExternalUrl('JaVaScRiPt:alert(1)')).toBeUndefined()
    expect(getSafeExternalUrl('java\nscript:alert(1)')).toBeUndefined()
    expect(getSafeExternalUrl('data:text/html,<script>')).toBeUndefined()
    expect(getSafeExternalUrl('vbscript:msgbox')).toBeUndefined()
    expect(getSafeExternalUrl('mailto:info@example.org')).toBeUndefined()
  })

  test('rejects empty and non-string values', () => {
    expect(getSafeExternalUrl('')).toBeUndefined()
    expect(getSafeExternalUrl('   ')).toBeUndefined()
    expect(getSafeExternalUrl(null)).toBeUndefined()
    expect(getSafeExternalUrl('kein link')).toBeUndefined()
  })
})

describe('getSafeHref', () => {
  test('keeps internal paths, web, mail and phone links', () => {
    expect(getSafeHref('/info')).toBe('/info')
    expect(getSafeHref('#top')).toBe('#top')
    expect(getSafeHref('https://www.berlin.de/')).toBe('https://www.berlin.de/')
    expect(getSafeHref('mailto:info@example.org')).toBe(
      'mailto:info@example.org'
    )
    expect(getSafeHref('tel:+4930123')).toBe('tel:+4930123')
  })

  test('rejects script protocols and protocol-relative URLs', () => {
    expect(getSafeHref('javascript:alert(1)')).toBeUndefined()
    expect(getSafeHref('//evil.example')).toBeUndefined()
    expect(getSafeHref('/\\evil.example')).toBeUndefined()
  })
})

describe('getSafeBackPath', () => {
  test('accepts internal page paths', () => {
    expect(getSafeBackPath('/')).toBe('/')
    expect(getSafeBackPath('/map')).toBe('/map')
    expect(getSafeBackPath('/123')).toBe('/123')
    expect(getSafeBackPath('/sofortige-hilfe')).toBe('/sofortige-hilfe')
  })

  test('falls back for external, script or malformed values', () => {
    expect(getSafeBackPath('javascript:alert(1)//')).toBe('/')
    expect(getSafeBackPath('https://evil.example')).toBe('/')
    expect(getSafeBackPath('//evil.example')).toBe('/')
    expect(getSafeBackPath('/\\evil.example')).toBe('/')
    expect(getSafeBackPath(['/map', '/info'])).toBe('/')
    expect(getSafeBackPath(undefined, '/map')).toBe('/map')
  })
})
