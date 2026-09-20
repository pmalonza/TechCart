/** After a failed submit, moves focus to the first invalid field so keyboard and screen-reader users land on the problem. */
export function focusFirstError(form: HTMLFormElement | null) {
  window.requestAnimationFrame(() => {
    form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  })
}
