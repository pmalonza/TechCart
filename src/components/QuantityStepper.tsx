import { useEffect, useState } from 'react'
import { MinusIcon, PlusIcon } from './icons'

interface QuantityStepperProps {
  value: number
  max: number
  min?: number
  /** Names the product for assistive tech, e.g. "Nimbus Air 14". */
  label: string
  onChange: (next: number) => void
}

/** A -/+ quantity control with a typeable number box. Typed values apply on blur or Enter and are clamped to [min, max]. */
export default function QuantityStepper({ value, max, min = 1, label, onChange }: QuantityStepperProps) {
  const [text, setText] = useState(String(value))

  useEffect(() => {
    setText(String(value))
  }, [value])

  function commit() {
    const parsed = Number.parseInt(text, 10)
    if (Number.isNaN(parsed)) {
      setText(String(value))
      return
    }
    const clamped = Math.min(max, Math.max(min, parsed))
    setText(String(clamped))
    if (clamped !== value) onChange(clamped)
  }

  return (
    <div className="stepper" role="group" aria-label={`Quantity of ${label}`}>
      <button
        type="button"
        className="stepper-btn"
        aria-label={`Decrease quantity of ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <MinusIcon />
      </button>
      <input
        className="stepper-input"
        type="text"
        inputMode="numeric"
        aria-label={`Quantity of ${label}`}
        value={text}
        onChange={(event) => setText(event.target.value.replace(/[^0-9]/g, ''))}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit()
          }
        }}
      />
      <button
        type="button"
        className="stepper-btn"
        aria-label={`Increase quantity of ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <PlusIcon />
      </button>
    </div>
  )
}
