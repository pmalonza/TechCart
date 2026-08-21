const NEWSLETTER_KEY = 'techcart:newsletter'

function loadSubscribers() {
  try {
    const raw = localStorage.getItem(NEWSLETTER_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSubscribers(subscribers) {
  localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(subscribers))
}

export function subscribeToNewsletter(email) {
  const normalized = email.trim().toLowerCase()
  const subscribers = loadSubscribers()
  if (subscribers.includes(normalized)) {
    return { ok: false, message: 'This email is already subscribed.' }
  }
  saveSubscribers([...subscribers, normalized])
  return { ok: true }
}

export function isNewsletterSubscriber(email) {
  return loadSubscribers().includes(email.trim().toLowerCase())
}
