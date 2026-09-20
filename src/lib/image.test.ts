import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_DATA_URL_CHARS,
  MAX_IMAGE_FILE_BYTES,
  fitWithin,
  isSafeImageDataUrl,
  validateImageFile,
} from './image'

describe('validateImageFile', () => {
  it('accepts JPEG, PNG and WebP within the size limit', () => {
    for (const type of ACCEPTED_IMAGE_TYPES) expect(validateImageFile({ type, size: 1024 })).toBeNull()
    expect(validateImageFile({ type: 'image/png', size: MAX_IMAGE_FILE_BYTES })).toBeNull()
  })

  it('rejects other types, including SVG, GIF and non-images', () => {
    for (const type of ['image/svg+xml', 'image/gif', 'application/pdf', 'text/html', '']) {
      expect(validateImageFile({ type, size: 1024 }), type).toMatch(/JPEG, PNG or WebP/)
    }
  })

  it('rejects empty and oversized files', () => {
    expect(validateImageFile({ type: 'image/png', size: 0 })).toMatch(/empty/)
    expect(validateImageFile({ type: 'image/png', size: MAX_IMAGE_FILE_BYTES + 1 })).toMatch(/larger than 5 MB/)
  })
})

describe('fitWithin', () => {
  it('scales the longest side down and keeps the aspect ratio', () => {
    expect(fitWithin(3000, 1500, 900)).toEqual({ width: 900, height: 450 })
    expect(fitWithin(1000, 4000, 900)).toEqual({ width: 225, height: 900 })
  })

  it('never scales up', () => {
    expect(fitWithin(400, 300, 900)).toEqual({ width: 400, height: 300 })
    expect(fitWithin(900, 900, 900)).toEqual({ width: 900, height: 900 })
  })

  it('never produces a zero-sized side for extreme aspect ratios', () => {
    expect(fitWithin(10_000, 1, 900)).toEqual({ width: 900, height: 1 })
  })
})

describe('isSafeImageDataUrl', () => {
  const tiny = 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='

  it('accepts small base64 image data URLs', () => {
    expect(isSafeImageDataUrl(tiny)).toBe(true)
    expect(isSafeImageDataUrl('data:image/png;base64,iVBORw0KGgo=')).toBe(true)
    expect(isSafeImageDataUrl('data:image/webp;base64,UklGRg==')).toBe(true)
  })

  it('rejects script, remote and SVG sources', () => {
    for (const bad of [
      'javascript:alert(1)',
      'https://example.com/a.jpg',
      'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
      'data:text/html;base64,PGgxPmhpPC9oMT4=',
      'data:image/jpeg;base64,abc" onerror="alert(1)',
      'data:image/jpeg,not-base64',
      '',
    ]) {
      expect(isSafeImageDataUrl(bad), bad).toBe(false)
    }
  })

  it('rejects non-strings and oversized values', () => {
    expect(isSafeImageDataUrl(undefined)).toBe(false)
    expect(isSafeImageDataUrl(42)).toBe(false)
    expect(isSafeImageDataUrl({})).toBe(false)
    expect(isSafeImageDataUrl(`data:image/jpeg;base64,${'A'.repeat(MAX_IMAGE_DATA_URL_CHARS)}`)).toBe(false)
  })
})
