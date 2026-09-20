/** Formats we accept. SVG is left out on purpose: it can carry scripts, and we re-encode everything to a plain raster anyway. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(',')

/** Largest file we will try to read. Photos straight off a phone are often 3-6 MB. */
export const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024
/** Longest side, in pixels, of the stored image. */
export const MAX_IMAGE_EDGE = 900
/**
 * Longest stored data URL, in characters. Photos live in localStorage, which
 * holds only a few MB in total, so each one has to stay small.
 */
export const MAX_IMAGE_DATA_URL_CHARS = 200_000

export const IMAGE_LIMIT_HINT = `JPEG, PNG or WebP, up to ${MAX_IMAGE_FILE_BYTES / (1024 * 1024)} MB. It is resized and kept in this browser only.`

/** A problem with an image that is worth showing to the person who picked it. */
export class ImageError extends Error {}

/** Returns a message if the file cannot be used as a product photo, or null if it looks fine. */
export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) return 'Choose a JPEG, PNG or WebP image.'
  if (file.size === 0) return 'That file is empty.'
  if (file.size > MAX_IMAGE_FILE_BYTES) return `That image is larger than ${MAX_IMAGE_FILE_BYTES / (1024 * 1024)} MB. Choose a smaller one.`
  return null
}

/** Scales (width, height) down to fit within `maxEdge` on the longest side, keeping the aspect ratio. Never scales up. */
export function fitWithin(width: number, height: number, maxEdge: number): { width: number; height: number } {
  const longest = Math.max(width, height)
  if (longest <= maxEdge) return { width, height }
  const scale = maxEdge / longest
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

const DATA_URL = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/

/**
 * Whether a value is a small base64 image data URL. Anything read back from
 * storage must pass this before it reaches an <img src>, so hand-edited data
 * cannot smuggle in a `javascript:` or remote URL.
 */
export function isSafeImageDataUrl(value: unknown): value is string {
  return typeof value === 'string' && value.length <= MAX_IMAGE_DATA_URL_CHARS && DATA_URL.test(value)
}

/**
 * Reads a chosen file, scales it down and re-encodes it as a JPEG data URL small
 * enough to keep in localStorage. Re-encoding through a canvas also strips EXIF
 * metadata such as GPS location. Transparent areas become white.
 */
export async function processImageFile(file: File): Promise<string> {
  const problem = validateImageFile(file)
  if (problem) throw new ImageError(problem)
  if (typeof createImageBitmap !== 'function') throw new ImageError('This browser cannot process images.')

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new ImageError('That image could not be read. The file may be damaged.')
  }

  try {
    let edge = MAX_IMAGE_EDGE
    for (let attempt = 0; attempt < 4; attempt++) {
      const { width, height } = fitWithin(bitmap.width, bitmap.height, edge)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new ImageError('This browser cannot process images.')
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
      context.drawImage(bitmap, 0, 0, width, height)

      for (const quality of [0.85, 0.7, 0.55]) {
        const url = canvas.toDataURL('image/jpeg', quality)
        if (isSafeImageDataUrl(url)) return url
      }
      edge = Math.round(edge * 0.75)
    }
    throw new ImageError('That image is too detailed to store here. Try a smaller or simpler photo.')
  } finally {
    bitmap.close()
  }
}
