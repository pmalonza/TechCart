import { screen, within } from '@testing-library/react'
import { MAX_ADDRESSES, type Address } from '../lib/addresses'
import { STORAGE_KEYS } from '../lib/storage'
import { registerAndLand, type UserSession } from '../test/auth'
import { renderApp } from '../test/utils'

interface Fields {
  fullName?: string
  phone?: string
  country?: string
  line1?: string
  line2?: string
  city?: string
  region?: string
  postalCode?: string
  label?: string
}

const NAIROBI: Fields = {
  fullName: 'Ada Lovelace',
  phone: '+254 700 000 000',
  country: 'KE',
  line1: '12 Baker Street',
  city: 'Nairobi',
  postalCode: '00100',
  label: 'Home',
}

/** Fills an address form. Country is chosen first because it changes which fields are required. */
async function fillAddress(user: UserSession, form: HTMLElement, fields: Fields) {
  const q = within(form)
  if (fields.country) await user.selectOptions(q.getByLabelText('Country'), fields.country)
  const typeInto = async (label: string | RegExp, value: string | undefined) => {
    if (value === undefined) return
    const box = q.getByLabelText(label)
    await user.clear(box)
    if (value !== '') await user.type(box, value) // user.type rejects an empty string
  }
  await typeInto('Full name', fields.fullName)
  await typeInto('Phone number', fields.phone)
  await typeInto('Street address', fields.line1)
  await typeInto(/^Apartment/, fields.line2)
  await typeInto('City or town', fields.city)
  await typeInto(/^State, province or region/, fields.region)
  await typeInto('Postal code', fields.postalCode)
  await typeInto(/^Label/, fields.label)
}

async function openAddresses(user: UserSession) {
  await user.click(screen.getByRole('link', { name: 'Addresses' }))
  await screen.findByRole('heading', { level: 2, name: 'Saved addresses' })
}

async function addAddress(user: UserSession, fields: Fields, makeDefault = false) {
  await user.click(screen.getByRole('button', { name: 'Add a new address' }))
  const form = screen.getByRole('form', { name: 'Save address' })
  await fillAddress(user, form, fields)
  if (makeDefault) await user.click(within(form).getByRole('checkbox', { name: 'Use as my default address' }))
  await user.click(within(form).getByRole('button', { name: 'Save address' }))
}

const cards = () => within(screen.getByRole('list', { name: 'Your addresses' })).getAllByRole('listitem')
const storedAddresses = (): Address[] => JSON.parse(window.localStorage.getItem(STORAGE_KEYS.users)!)[0].addresses

describe('address book', () => {
  it('starts empty', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    expect(screen.getByRole('heading', { name: 'No saved addresses yet' })).toBeInTheDocument()
  })

  it('needs an account', async () => {
    renderApp('/account/addresses')
    expect(await screen.findByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument()
  })

  it('saves a first address, shows it formatted, and makes it the default', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    await addAddress(user, NAIROBI)

    const [card] = cards()
    expect(within(card).getByRole('heading', { name: 'Home' })).toBeInTheDocument()
    expect(within(card).getByText('Default')).toBeInTheDocument()
    for (const line of ['Ada Lovelace', '12 Baker Street', 'Nairobi, 00100', 'Kenya', '+254 700 000 000']) {
      expect(within(card).getByText(line)).toBeInTheDocument()
    }
    expect(screen.getByTestId('announcer')).toHaveTextContent('Address added')
    expect(screen.queryByRole('form', { name: 'Save address' })).not.toBeInTheDocument()
  })

  it('offers the default checkbox only once there is an address to replace', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    await user.click(screen.getByRole('button', { name: 'Add a new address' }))
    expect(screen.queryByRole('checkbox', { name: 'Use as my default address' })).not.toBeInTheDocument()
  })

  it('normalises what you type before saving', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    await addAddress(user, { ...NAIROBI, country: 'GB', postalCode: 'sw1a 1aa', fullName: '  Ada  ', label: '' })
    expect(storedAddresses()[0]).toMatchObject({ postalCode: 'SW1A 1AA', fullName: 'Ada', country: 'GB' })
    expect(within(cards()[0]).getByRole('heading', { name: 'Address' })).toBeInTheDocument()
  })

  it('shows an error for every missing field and focuses the first', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    await user.click(screen.getByRole('button', { name: 'Add a new address' }))
    const form = screen.getByRole('form', { name: 'Save address' })
    await user.click(within(form).getByRole('button', { name: 'Save address' }))

    for (const message of [/recipient’s full name/i, /phone number the courier/i, /street address/i, /city or town/i, /state, province or region/i, /postal code/i]) {
      expect(within(form).getByText(message, { selector: '.error' })).toBeInTheDocument()
    }
    await vi.waitFor(() => expect(within(form).getByLabelText('Full name')).toHaveFocus())
    expect(within(form).getByLabelText('Full name')).toHaveAccessibleDescription(/recipient’s full name/i)
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.users)!)[0].addresses).toEqual([])
  })

  it('checks the postal code against the chosen country', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    await user.click(screen.getByRole('button', { name: 'Add a new address' }))
    const form = screen.getByRole('form', { name: 'Save address' })
    await fillAddress(user, form, { ...NAIROBI, country: 'US', region: 'CA', postalCode: '1234' })
    await user.click(within(form).getByRole('button', { name: 'Save address' }))
    expect(within(form).getByText(/valid postal code, like 94103/i)).toBeInTheDocument()
  })

  it('updates the region requirement and postal-code hint when the country changes', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    await user.click(screen.getByRole('button', { name: 'Add a new address' }))
    const form = within(screen.getByRole('form', { name: 'Save address' }))

    expect(form.getByLabelText('State, province or region')).toBeInTheDocument()
    expect(form.getByText('For example 94103')).toBeInTheDocument()

    await user.selectOptions(form.getByLabelText('Country'), 'KE')
    expect(form.getByLabelText('State, province or region (optional)')).toBeInTheDocument()
    expect(form.getByText('For example 00100')).toBeInTheDocument()
  })

  it('lets you add a second address and switch the default', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    await addAddress(user, NAIROBI)
    await addAddress(user, { ...NAIROBI, label: 'Office', line1: '1 Kimathi Street', city: 'Nairobi' })

    let [home, office] = cards()
    expect(within(home).getByText('Default')).toBeInTheDocument()
    expect(within(office).queryByText('Default')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Set Office as default' }))
    ;[home, office] = cards()
    expect(within(office).getByText('Default')).toBeInTheDocument()
    expect(within(home).queryByText('Default')).not.toBeInTheDocument()
    expect(storedAddresses().filter((a) => a.isDefault)).toHaveLength(1)
  })

  it('lets a new address take over as the default', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    await addAddress(user, NAIROBI)
    await addAddress(user, { ...NAIROBI, label: 'Office' }, true)
    expect(within(cards()[1]).getByText('Default')).toBeInTheDocument()
    expect(within(cards()[0]).queryByText('Default')).not.toBeInTheDocument()
  })

  it('edits an address in place', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    await addAddress(user, NAIROBI)

    await user.click(screen.getByRole('button', { name: 'Edit Home' }))
    const form = screen.getByRole('form', { name: 'Save changes' })
    expect(within(form).getByLabelText('City or town')).toHaveValue('Nairobi')
    expect(within(form).getByRole('checkbox', { name: 'This is your default address' })).toBeDisabled()
    await fillAddress(user, form, { city: 'Mombasa', postalCode: '80100' })
    await user.click(within(form).getByRole('button', { name: 'Save changes' }))

    expect(within(cards()[0]).getByText('Mombasa, 80100')).toBeInTheDocument()
    expect(cards()).toHaveLength(1)
    expect(screen.getByTestId('announcer')).toHaveTextContent('Address updated')
  })

  it('discards changes when you cancel an edit', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    await addAddress(user, NAIROBI)
    await user.click(screen.getByRole('button', { name: 'Edit Home' }))
    await fillAddress(user, screen.getByRole('form', { name: 'Save changes' }), { city: 'Somewhere else' })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(within(cards()[0]).getByText('Nairobi, 00100')).toBeInTheDocument()
  })

  it('asks for confirmation before deleting, and promotes another default if needed', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    await addAddress(user, NAIROBI)
    await addAddress(user, { ...NAIROBI, label: 'Office' })

    await user.click(screen.getByRole('button', { name: 'Delete Home' }))
    expect(cards()).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'Keep Home' }))
    expect(cards()).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Delete Home' }))
    await user.click(screen.getByRole('button', { name: 'Confirm delete Home' }))
    expect(cards()).toHaveLength(1)
    expect(within(cards()[0]).getByRole('heading', { name: 'Office' })).toBeInTheDocument()
    expect(within(cards()[0]).getByText('Default')).toBeInTheDocument()
  })

  it('shows the empty state again after deleting the last address', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    await addAddress(user, NAIROBI)
    await user.click(screen.getByRole('button', { name: 'Delete Home' }))
    await user.click(screen.getByRole('button', { name: 'Confirm delete Home' }))
    expect(screen.getByRole('heading', { name: 'No saved addresses yet' })).toBeInTheDocument()
  })

  it('stops at the address limit', async () => {
    const { user, view } = await registerAndLand()
    const users = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.users)!)
    users[0].addresses = Array.from({ length: MAX_ADDRESSES }, (_, i) => ({
      id: `a${i}`,
      label: `Place ${i}`,
      ...NAIROBI,
      isDefault: i === 0,
    }))
    window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users))
    view.unmount()

    renderApp('/account/addresses')
    await screen.findByRole('heading', { level: 2, name: 'Saved addresses' })
    expect(cards()).toHaveLength(MAX_ADDRESSES)
    expect(screen.getByRole('button', { name: 'Add a new address' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(/maximum/i)
    void user
  })

  it('remembers addresses across a reload', async () => {
    const { user, view } = await registerAndLand()
    await openAddresses(user)
    await addAddress(user, NAIROBI)
    view.unmount()

    renderApp('/account/addresses')
    await screen.findByRole('heading', { level: 2, name: 'Saved addresses' })
    expect(within(cards()[0]).getByText('12 Baker Street')).toBeInTheDocument()
  })

  it('erases saved addresses along with the account', async () => {
    const { user } = await registerAndLand()
    await openAddresses(user)
    await addAddress(user, NAIROBI)
    await user.click(screen.getByRole('link', { name: 'Password & security' }))
    await user.click(await screen.findByRole('button', { name: 'Delete my account' }))
    await user.type(screen.getByLabelText('Confirm with your password'), 'correct8horse')
    await user.click(screen.getByRole('button', { name: 'Permanently delete account' }))
    await screen.findByRole('heading', { level: 1, name: /gadgets you will actually use/i })

    expect(window.localStorage.getItem(STORAGE_KEYS.users)).not.toContain('Baker Street')
  })
})
