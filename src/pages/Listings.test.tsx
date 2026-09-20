import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageError, processImageFile } from '../lib/image'
import { MAX_LISTINGS_PER_USER, buildListing, emptyListingInput } from '../lib/listings'
import { STORAGE_KEYS } from '../lib/storage'
import { ADA, registerAndLand, type UserSession } from '../test/auth'
import { renderApp } from '../test/utils'
import type { Product } from '../types'

vi.mock('../lib/image', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/image')>()),
  processImageFile: vi.fn(),
}))

const IMAGE = 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
const IMAGE_2 = 'data:image/png;base64,iVBORw0KGgo='
const NAME = 'Trail Bluetooth Speaker'
const processImage = vi.mocked(processImageFile)

const photo = (name = 'speaker.png', type = 'image/png') => new File(['pixels'], name, { type })
const storedListings = (): Product[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.listings) ?? '[]')

async function type(user: UserSession, label: string, value: string) {
  const box = screen.getByLabelText(label)
  await user.clear(box)
  await user.type(box, value)
}

/** Registers, then opens the "Add a product" form through the account navigation. */
async function openNewListingForm() {
  const { user, view } = await registerAndLand()
  await user.click(screen.getByRole('link', { name: 'My listings' }))
  await user.click(await screen.findByRole('link', { name: 'Add a product' }))
  await screen.findByRole('form', { name: 'Add a product' })
  return { user, view }
}

async function fillValidListing(user: UserSession, overrides: { name?: string } = {}) {
  await type(user, 'Product name', overrides.name ?? NAME)
  await type(user, 'Brand', 'Trailhead')
  await user.selectOptions(screen.getByLabelText('Category'), 'audio')
  await type(user, 'Price (USD)', '59.99')
  await type(user, 'Quantity in stock', '4')
  await type(user, 'Description', 'A rugged waterproof speaker that lasts a whole weekend on one charge.')
}

async function publish(user: UserSession) {
  await user.click(screen.getByRole('button', { name: 'Publish product' }))
}

describe('adding a product', () => {
  // The browser filters by `accept` before the change event; turn that off so our own checks can be tested.
  const uploader = () => userEvent.setup({ applyAccept: false })

  beforeEach(() => {
    processImage.mockReset()
    processImage.mockResolvedValue(IMAGE)
  })

  it('is reachable from the account navigation and starts empty', async () => {
    const { user } = await registerAndLand()
    await user.click(screen.getByRole('link', { name: 'My listings' }))

    expect(await screen.findByRole('heading', { level: 3, name: 'No listings yet' })).toBeInTheDocument()
    expect(screen.getByText(/kept in this browser only/i)).toBeInTheDocument()
  })

  it('says listings are saved in this browser only', async () => {
    await openNewListingForm()
    expect(screen.getByRole('note')).toHaveTextContent(/saved in this browser only/i)
  })

  it('shows an error for every missing field and focuses the first', async () => {
    const { user } = await openNewListingForm()
    await user.clear(screen.getByLabelText('Quantity in stock'))
    await publish(user)

    expect(screen.getByText('Enter a product name of at least 3 characters.')).toBeInTheDocument()
    expect(screen.getByText('Enter the brand or maker.')).toBeInTheDocument()
    expect(screen.getByText('Choose a category.')).toBeInTheDocument()
    expect(screen.getByText('Enter a price like 49.99.')).toBeInTheDocument()
    expect(screen.getByText('Enter how many you have, as a whole number.')).toBeInTheDocument()
    expect(screen.getByText('Describe the product in at least 20 characters.')).toBeInTheDocument()
    expect(screen.getByLabelText('Product name')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Description')).toHaveAccessibleDescription('Describe the product in at least 20 characters.')
    await waitFor(() => expect(screen.getByLabelText('Product name')).toHaveFocus())
    expect(storedListings()).toEqual([])
  })

  it('rejects an original price that is not higher than the price', async () => {
    const { user } = await openNewListingForm()
    await fillValidListing(user)
    await type(user, 'Original price (optional)', '40')
    await publish(user)

    expect(screen.getByText('The original price must be higher than the selling price.')).toBeInTheDocument()
    expect(storedListings()).toEqual([])
  })

  it('publishes a product with an uploaded photo', async () => {
    const { user } = await openNewListingForm()
    await fillValidListing(user)
    await type(user, 'Original price (optional)', '79.99')
    await uploader().upload(screen.getByLabelText('Product photo (optional)'), photo())
    expect(await screen.findByRole('img', { name: 'Preview of the chosen photo' })).toHaveAttribute('src', IMAGE)
    await publish(user)

    const list = await screen.findByRole('list', { name: 'Your listings' })
    expect(within(list).getByRole('link', { name: NAME })).toBeInTheDocument()
    expect(within(list).getByText(/\$59\.99/)).toBeInTheDocument()
    expect(within(list).getByText(/4 in stock/)).toBeInTheDocument()
    expect(within(list).getByText('Using your photo')).toBeInTheDocument()
    expect(within(list).getByRole('img', { name: NAME })).toHaveAttribute('src', IMAGE)
    expect(screen.getByTestId('announcer')).toHaveTextContent(`${NAME} is now listed`)

    const [saved] = storedListings()
    expect(saved).toMatchObject({ name: NAME, priceCents: 5999, compareAtCents: 7999, stock: 4, image: IMAGE, category: 'audio' })
    expect(saved.sellerId).toEqual(expect.any(String))
  })

  it('publishes without a photo and uses the generated picture', async () => {
    const { user } = await openNewListingForm()
    await fillValidListing(user)
    await publish(user)

    const list = await screen.findByRole('list', { name: 'Your listings' })
    expect(within(list).getByText('Using the generated picture')).toBeInTheDocument()
    expect('image' in storedListings()[0]).toBe(false)
  })

  it('rejects an unsupported file type and does not process it', async () => {
    await openNewListingForm()
    await uploader().upload(screen.getByLabelText('Product photo (optional)'), photo('logo.svg', 'image/svg+xml'))

    expect(await screen.findByRole('alert')).toHaveTextContent('Choose a JPEG, PNG or WebP image.')
    expect(processImage).not.toHaveBeenCalled()
  })

  it('shows why a photo could not be processed and still lets the listing be published without it', async () => {
    processImage.mockRejectedValue(new ImageError('That image could not be read. The file may be damaged.'))
    const { user } = await openNewListingForm()
    await fillValidListing(user)
    await uploader().upload(screen.getByLabelText('Product photo (optional)'), photo())
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not be read/)

    await publish(user)
    await screen.findByRole('list', { name: 'Your listings' })
    expect('image' in storedListings()[0]).toBe(false)
  })

  it('does not lose the listing when the browser has no room for the photo', async () => {
    const original = Storage.prototype.setItem
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === STORAGE_KEYS.listings && value.includes('data:image')) throw new DOMException('full', 'QuotaExceededError')
      original.call(this, key, value)
    })
    try {
      const { user } = await openNewListingForm()
      await fillValidListing(user)
      await uploader().upload(screen.getByLabelText('Product photo (optional)'), photo())
      await screen.findByRole('img', { name: 'Preview of the chosen photo' })
      await publish(user)

      expect(await screen.findByRole('alert')).toHaveTextContent(/no room left/i)
      expect(screen.getByRole('form', { name: 'Add a product' })).toBeInTheDocument()
      expect(storedListings()).toEqual([])

      // The seller can carry on by dropping the photo.
      await user.click(screen.getByRole('button', { name: 'Remove photo' }))
      await publish(user)
      await screen.findByRole('list', { name: 'Your listings' })
      expect(storedListings()).toHaveLength(1)
    } finally {
      spy.mockRestore()
    }
  })

  it('shows the new product in the shop, with its photo, after a reload', async () => {
    const { user, view } = await openNewListingForm()
    await fillValidListing(user)
    await uploader().upload(screen.getByLabelText('Product photo (optional)'), photo())
    await screen.findByRole('img', { name: 'Preview of the chosen photo' })
    await publish(user)
    await screen.findByRole('list', { name: 'Your listings' })
    view.unmount()

    renderApp('/products?category=audio')
    const cardPhoto = await screen.findByRole('img', { name: NAME })
    expect(cardPhoto).toHaveAttribute('src', IMAGE)
    expect(screen.getByText(NAME)).toBeInTheDocument()
  })

  it('has a product page with the photo, a community badge and no fake reviews', async () => {
    const { user, view } = await openNewListingForm()
    await fillValidListing(user)
    await uploader().upload(screen.getByLabelText('Product photo (optional)'), photo())
    await screen.findByRole('img', { name: 'Preview of the chosen photo' })
    await publish(user)
    await screen.findByRole('list', { name: 'Your listings' })
    const [saved] = storedListings()
    view.unmount()

    renderApp(`/products/${saved.id}`)
    expect(await screen.findByRole('heading', { level: 1, name: NAME })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: NAME })).toHaveAttribute('src', IMAGE)
    expect(screen.getByText('Community listing')).toBeInTheDocument()
    expect(screen.getByText('No reviews yet')).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Purchase options' })).getByRole('button', { name: /add to cart/i })).toBeEnabled()
  })
})

describe('managing listings', () => {
  const uploader = () => userEvent.setup({ applyAccept: false })

  beforeEach(() => {
    processImage.mockReset()
    processImage.mockResolvedValue(IMAGE)
  })

  /** Registers and publishes one listing without a photo, leaving the app on My listings. */
  async function withOneListing() {
    const { user, view } = await openNewListingForm()
    await fillValidListing(user)
    await publish(user)
    await screen.findByRole('list', { name: 'Your listings' })
    return { user, view }
  }

  it('adds a photo to an existing listing, then replaces it, then removes it', async () => {
    const { user } = await withOneListing()

    await user.click(screen.getByRole('button', { name: `Add a photo for ${NAME}` }))
    await uploader().upload(screen.getByLabelText(`Photo for ${NAME}`), photo())
    expect(await screen.findByText('Using your photo')).toBeInTheDocument()
    expect(storedListings()[0].image).toBe(IMAGE)

    processImage.mockResolvedValue(IMAGE_2)
    await uploader().upload(screen.getByLabelText(`Photo for ${NAME}`), photo('other.png'))
    await waitFor(() => expect(storedListings()[0].image).toBe(IMAGE_2))
    const list = screen.getByRole('list', { name: 'Your listings' })
    expect(within(list).getAllByRole('img', { name: NAME })[0]).toHaveAttribute('src', IMAGE_2)

    await user.click(screen.getByRole('button', { name: 'Remove photo' }))
    expect(await screen.findByText('Using the generated picture')).toBeInTheDocument()
    expect('image' in storedListings()[0]).toBe(false)
    expect(screen.queryByLabelText(`Photo for ${NAME}`)).not.toBeInTheDocument()
  })

  it('shows an error and keeps the old photo when the browser cannot store the new one', async () => {
    const { user } = await withOneListing()
    await user.click(screen.getByRole('button', { name: `Add a photo for ${NAME}` }))

    const original = Storage.prototype.setItem
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === STORAGE_KEYS.listings && value.includes('data:image')) throw new DOMException('full', 'QuotaExceededError')
      original.call(this, key, value)
    })
    try {
      await uploader().upload(screen.getByLabelText(`Photo for ${NAME}`), photo())
      expect(await screen.findByText(/no room left/i)).toBeInTheDocument()
      expect(screen.getByText('Using the generated picture')).toBeInTheDocument()
      expect('image' in storedListings()[0]).toBe(false)
    } finally {
      spy.mockRestore()
    }
  })

  it('deletes a listing only after confirming, and its page is then gone', async () => {
    const { user, view } = await withOneListing()
    const [saved] = storedListings()

    await user.click(screen.getByRole('button', { name: `Delete ${NAME}` }))
    await user.click(screen.getByRole('button', { name: 'Keep it' }))
    expect(storedListings()).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: `Delete ${NAME}` }))
    await user.click(screen.getByRole('button', { name: `Yes, delete ${NAME}` }))

    expect(await screen.findByRole('heading', { level: 3, name: 'No listings yet' })).toBeInTheDocument()
    expect(screen.getByTestId('announcer')).toHaveTextContent(`${NAME} was removed`)
    expect(storedListings()).toEqual([])
    view.unmount()

    renderApp(`/products/${saved.id}`)
    expect(await screen.findByRole('heading', { level: 1, name: 'Product not found' })).toBeInTheDocument()
  })

  it("does not show one seller's listings in another account's list", async () => {
    const { view } = await withOneListing()
    view.unmount()
    localStorage.removeItem(STORAGE_KEYS.session)

    const { user } = await registerAndLand({ name: 'Bob Builder', email: 'bob@example.com', password: 'correct8horse' })
    await user.click(screen.getByRole('link', { name: 'My listings' }))

    expect(await screen.findByRole('heading', { level: 3, name: 'No listings yet' })).toBeInTheDocument()
    expect(storedListings()).toHaveLength(1)
  })

  it('stops at the listing limit', async () => {
    const { view } = await registerAndLand()
    const sellerId = JSON.parse(localStorage.getItem(STORAGE_KEYS.session)!) as string
    const seeded = Array.from({ length: MAX_LISTINGS_PER_USER }, (_, index) =>
      buildListing(
        { ...emptyListingInput(), name: `Seeded item ${index}`, brand: 'Seed', category: 'audio', price: '10', description: 'A seeded product for the limit test.' },
        sellerId,
        `listing-seed-${index}`,
      ),
    )
    localStorage.setItem(STORAGE_KEYS.listings, JSON.stringify(seeded))
    view.unmount()

    renderApp('/account/listings')
    expect(await screen.findByRole('status')).toHaveTextContent(/maximum/i)
    expect(screen.getByRole('button', { name: 'Add a product' })).toBeDisabled()
    expect(screen.queryByRole('link', { name: 'Add a product' })).not.toBeInTheDocument()
  })

  it('removes a seller’s listings when their account is deleted', async () => {
    const { user } = await withOneListing()
    expect(storedListings()).toHaveLength(1)

    await user.click(screen.getByRole('link', { name: 'Password & security' }))
    await user.click(await screen.findByRole('button', { name: 'Delete my account' }))
    await user.type(screen.getByLabelText('Confirm with your password'), ADA.password)
    await user.click(screen.getByRole('button', { name: 'Permanently delete account' }))

    await screen.findByRole('heading', { level: 1, name: /gadgets you will actually use/i })
    await waitFor(() => expect(storedListings()).toEqual([]))
  })
})
