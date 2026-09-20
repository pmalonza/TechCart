import { BACK_TO_TOP_THRESHOLD, shouldShowBackToTop } from './scroll'

describe('shouldShowBackToTop', () => {
  it('stays hidden at the top and up to the threshold', () => {
    expect(shouldShowBackToTop(0)).toBe(false)
    expect(shouldShowBackToTop(BACK_TO_TOP_THRESHOLD)).toBe(false)
  })

  it('shows once the page is scrolled past the threshold', () => {
    expect(shouldShowBackToTop(BACK_TO_TOP_THRESHOLD + 1)).toBe(true)
    expect(shouldShowBackToTop(5000)).toBe(true)
  })

  it('treats a negative scroll position (elastic overscroll) as the top', () => {
    expect(shouldShowBackToTop(-40)).toBe(false)
  })
})
