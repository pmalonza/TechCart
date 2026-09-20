import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useAnnounce } from '../context/AnnouncerContext'
import { ACCEPT_ATTRIBUTE, ImageError, processImageFile, validateImageFile } from '../lib/image'

interface ImageUploaderProps {
  /** Visible label for the drop area, e.g. "Product photo". */
  label: string
  /** The current photo as a data URL, if any. */
  value?: string
  /** Called with the processed photo, or undefined when it is removed. */
  onChange: (image: string | undefined) => void
  /** An error from the parent (for example a full browser store) to show under the picker. */
  error?: string
  hint?: string
}

/**
 * A photo picker: choose a file or drop one on the area. The photo is checked,
 * scaled down and re-encoded in the browser before it is handed to `onChange`;
 * nothing is uploaded to a server.
 */
export default function ImageUploader({ label, value, onChange, error, hint }: ImageUploaderProps) {
  const inputId = useId()
  const messageId = `${inputId}-message`
  const inputRef = useRef<HTMLInputElement>(null)
  const announce = useAnnounce()
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  // Only the most recent pick may apply its result, and nothing applies after unmount.
  const request = useRef(0)
  useEffect(
    () => () => {
      request.current += 1
    },
    [],
  )

  async function pick(file: File | undefined) {
    if (!file) return
    const current = ++request.current
    const invalid = validateImageFile(file)
    if (invalid) {
      setProblem(invalid)
      announce(invalid)
      return
    }
    setProblem(null)
    setBusy(true)
    try {
      const image = await processImageFile(file)
      if (current !== request.current) return
      onChange(image)
      announce('Photo added')
    } catch (caught) {
      if (current !== request.current) return
      const message = caught instanceof ImageError ? caught.message : 'That image could not be used. Try a different one.'
      setProblem(message)
      announce(message)
    } finally {
      if (current === request.current) setBusy(false)
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    void pick(event.target.files?.[0])
    event.target.value = '' // picking the same file again should still fire a change
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    void pick(event.dataTransfer.files[0])
  }

  function handleRemove() {
    request.current += 1
    setBusy(false)
    setProblem(null)
    onChange(undefined)
    announce('Photo removed')
    inputRef.current?.focus()
  }

  const shownError = problem ?? error
  const describedBy = [hint ? `${inputId}-hint` : null, shownError ? messageId : null].filter(Boolean).join(' ')

  return (
    <div className="field uploader">
      <label htmlFor={inputId}>{label}</label>

      <div
        className={`dropzone${dragging ? ' dragging' : ''}${shownError ? ' has-error' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {value ? (
          <img className="uploader-preview" src={value} alt="Preview of the chosen photo" />
        ) : (
          <p className="dropzone-empty">Drag a photo here, or choose a file.</p>
        )}
        <input
          ref={inputRef}
          id={inputId}
          className="uploader-input"
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          onChange={handleChange}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={describedBy || undefined}
          disabled={busy}
        />
        {value && (
          <button type="button" className="btn btn-sm btn-danger" onClick={handleRemove}>
            Remove photo
          </button>
        )}
      </div>

      {busy && (
        <span className="hint" role="status">
          Preparing your photo&hellip;
        </span>
      )}
      {hint && (
        <span id={`${inputId}-hint`} className="hint">
          {hint}
        </span>
      )}
      {shownError && (
        <span id={messageId} className="error" role="alert">
          {shownError}
        </span>
      )}
    </div>
  )
}
