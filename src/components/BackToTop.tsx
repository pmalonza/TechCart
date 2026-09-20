import { useEffect, useState } from 'react'
import { shouldShowBackToTop } from '../lib/scroll'
import { ArrowUpIcon } from './icons'

/** Id of the focusable marker at the very top of the page, where focus lands after scrolling up. */
export const PAGE_TOP_ID = 'page-top'

/**
 * A floating button that appears once the page is scrolled down and takes you
 * back to the top. Scrolling follows the page's `scroll-behavior` (smooth,
 * or instant for people who prefer reduced motion). Focus moves to the top of
 * the page as well, so keyboard and screen-reader users do not lose their place
 * when the button disappears.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      setVisible(shouldShowBackToTop(window.scrollY))
    }
    function handleScroll() {
      if (frame === 0) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  if (!visible) return null

  function handleClick() {
    window.scrollTo({ top: 0 })
    document.getElementById(PAGE_TOP_ID)?.focus({ preventScroll: true })
  }

  return (
    <button type="button" className="back-to-top" aria-label="Back to top" onClick={handleClick}>
      <ArrowUpIcon className="back-to-top-icon" />
    </button>
  )
}
