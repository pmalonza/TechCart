import { useEffect, useState } from 'react'

const SCROLL_THRESHOLD = 300

export default function ScrollTopBottomButton() {
  const [atTop, setAtTop] = useState(true)

  useEffect(() => {
    function handleScroll() {
      setAtTop(window.scrollY < SCROLL_THRESHOLD)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleClick() {
    if (atTop) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <button
      type="button"
      className="scroll-toggle-button"
      onClick={handleClick}
      aria-label={atTop ? 'Scroll to bottom' : 'Scroll to top'}
    >
      {atTop ? '↓' : '↑'}
    </button>
  )
}
