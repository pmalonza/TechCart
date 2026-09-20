import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { AnnouncerProvider } from '../context/AnnouncerContext'
import { ImageError, MAX_IMAGE_FILE_BYTES, processImageFile } from '../lib/image'
import ImageUploader from './ImageUploader'

vi.mock('../lib/image', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/image')>()),
  processImageFile: vi.fn(),
}))

const IMAGE = 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
const processImage = vi.mocked(processImageFile)

function Harness({ onChange }: { onChange?: (image: string | undefined) => void }) {
  const [image, setImage] = useState<string | undefined>()
  return (
    <AnnouncerProvider>
      <ImageUploader
        label="Product photo"
        value={image}
        hint="A hint"
        onChange={(next) => {
          setImage(next)
          onChange?.(next)
        }}
      />
    </AnnouncerProvider>
  )
}

const photo = (name = 'shot.png', type = 'image/png') => new File(['pixels'], name, { type })

describe('ImageUploader', () => {
  // The browser filters by `accept` before the change event; turn that off so we can test our own checks.
  const setup = () => userEvent.setup({ applyAccept: false })

  beforeEach(() => {
    processImage.mockReset()
  })

  it('offers a labelled file input that only accepts JPEG, PNG and WebP', () => {
    render(<Harness />)
    const input = screen.getByLabelText('Product photo')
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')
    expect(input).toHaveAccessibleDescription('A hint')
    expect(screen.getByText(/drag a photo here/i)).toBeInTheDocument()
  })

  it('shows a preview and reports the processed photo', async () => {
    processImage.mockResolvedValue(IMAGE)
    const onChange = vi.fn()
    const user = setup()
    render(<Harness onChange={onChange} />)

    await user.upload(screen.getByLabelText('Product photo'), photo())

    const preview = await screen.findByRole('img', { name: 'Preview of the chosen photo' })
    expect(preview).toHaveAttribute('src', IMAGE)
    expect(onChange).toHaveBeenCalledWith(IMAGE)
    expect(screen.getByTestId('announcer')).toHaveTextContent('Photo added')
  })

  it('rejects unsupported types without processing them', async () => {
    const user = setup()
    render(<Harness />)

    await user.upload(screen.getByLabelText('Product photo'), photo('logo.svg', 'image/svg+xml'))

    expect(await screen.findByRole('alert')).toHaveTextContent('Choose a JPEG, PNG or WebP image.')
    expect(screen.getByLabelText('Product photo')).toHaveAttribute('aria-invalid', 'true')
    expect(processImage).not.toHaveBeenCalled()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('rejects files over the size limit without processing them', async () => {
    const user = setup()
    render(<Harness />)
    const big = photo()
    Object.defineProperty(big, 'size', { value: MAX_IMAGE_FILE_BYTES + 1 })

    await user.upload(screen.getByLabelText('Product photo'), big)

    expect(await screen.findByRole('alert')).toHaveTextContent(/larger than 5 MB/)
    expect(processImage).not.toHaveBeenCalled()
  })

  it('shows the reason when a photo cannot be processed', async () => {
    processImage.mockRejectedValue(new ImageError('That image could not be read. The file may be damaged.'))
    const user = setup()
    render(<Harness />)

    await user.upload(screen.getByLabelText('Product photo'), photo())

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be read')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('falls back to a generic message for unexpected failures', async () => {
    processImage.mockRejectedValue(new Error('boom'))
    const user = setup()
    render(<Harness />)

    await user.upload(screen.getByLabelText('Product photo'), photo())

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be used')
    expect(screen.getByRole('alert')).not.toHaveTextContent('boom')
  })

  it('clears an earlier error after a good photo', async () => {
    processImage.mockResolvedValue(IMAGE)
    const user = setup()
    render(<Harness />)

    await user.upload(screen.getByLabelText('Product photo'), photo('a.gif', 'image/gif'))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    await user.upload(screen.getByLabelText('Product photo'), photo())

    await screen.findByRole('img', { name: 'Preview of the chosen photo' })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('removes the photo and returns focus to the picker', async () => {
    processImage.mockResolvedValue(IMAGE)
    const onChange = vi.fn()
    const user = setup()
    render(<Harness onChange={onChange} />)
    await user.upload(screen.getByLabelText('Product photo'), photo())
    await screen.findByRole('img', { name: 'Preview of the chosen photo' })

    await user.click(screen.getByRole('button', { name: 'Remove photo' }))

    expect(onChange).toHaveBeenLastCalledWith(undefined)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Product photo')).toHaveFocus()
    expect(screen.getByTestId('announcer')).toHaveTextContent('Photo removed')
  })

  it('accepts a photo dropped on the area', async () => {
    processImage.mockResolvedValue(IMAGE)
    render(<Harness />)
    const zone = screen.getByText(/drag a photo here/i).parentElement!
    const file = photo()

    fireEvent.dragOver(zone)
    expect(zone).toHaveClass('dragging')
    fireEvent.drop(zone, { dataTransfer: { files: [file] } })

    expect(await screen.findByRole('img', { name: 'Preview of the chosen photo' })).toHaveAttribute('src', IMAGE)
    expect(zone).not.toHaveClass('dragging')
  })

  it('ignores a slow earlier photo when a newer one was chosen', async () => {
    let releaseFirst!: (value: string) => void
    processImage.mockImplementationOnce(() => new Promise<string>((resolve) => (releaseFirst = resolve)))
    processImage.mockResolvedValueOnce('data:image/png;base64,iVBORw0KGgo=')
    const onChange = vi.fn()
    const user = setup()
    const { container } = render(<Harness onChange={onChange} />)

    // The input is disabled while busy, so the second pick arrives through a drop.
    await user.upload(screen.getByLabelText('Product photo'), photo('first.png'))
    fireEvent.drop(container.querySelector('.dropzone')!, { dataTransfer: { files: [photo('second.png')] } })
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('data:image/png;base64,iVBORw0KGgo='))

    releaseFirst(IMAGE)
    await Promise.resolve()
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
