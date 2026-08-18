// Client-side only: hashing a password in the browser and storing it in
// localStorage is still not real security (no server, no salt-per-user
// secret, trivially inspectable), but it at least avoids sitting plaintext
// passwords directly in localStorage for this demo/mock auth.
export async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
