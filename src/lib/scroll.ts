/** How far down the page (in pixels) someone must scroll before the back-to-top button appears. */
export const BACK_TO_TOP_THRESHOLD = 300

/** The button shows only once the page is scrolled past the threshold, so it never sits over a page that is already at the top. */
export function shouldShowBackToTop(scrollY: number): boolean {
  return scrollY > BACK_TO_TOP_THRESHOLD
}
