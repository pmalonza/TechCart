import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddressBookView from './AddressBookView'

function makeAddress(overrides = {}) {
  return {
    id: 'addr-1',
    label: 'Home',
    street: '123 Main St',
    city: 'Springfield',
    postalCode: '12345',
    isDefault: true,
    ...overrides,
  }
}

describe('AddressBookView', () => {
  it('shows an empty state with no addresses', () => {
    render(<AddressBookView addresses={[]} onBack={vi.fn()} onAdd={vi.fn()} onRemove={vi.fn()} onSetDefault={vi.fn()} />)
    expect(screen.getByText("You haven't saved any addresses yet.")).toBeInTheDocument()
  })

  it('lists saved addresses with label and lines', () => {
    render(
      <AddressBookView addresses={[makeAddress()]} onBack={vi.fn()} onAdd={vi.fn()} onRemove={vi.fn()} onSetDefault={vi.fn()} />,
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('123 Main St, Springfield 12345')).toBeInTheDocument()
    expect(screen.getByText('Default')).toBeInTheDocument()
  })

  it('shows a Set as default button for a non-default address', async () => {
    const user = userEvent.setup()
    const onSetDefault = vi.fn()
    const address = makeAddress({ id: 'addr-2', isDefault: false })
    render(
      <AddressBookView addresses={[address]} onBack={vi.fn()} onAdd={vi.fn()} onRemove={vi.fn()} onSetDefault={onSetDefault} />,
    )

    await user.click(screen.getByRole('button', { name: 'Set as default' }))

    expect(onSetDefault).toHaveBeenCalledWith('addr-2')
  })

  it('calls onRemove with the address id', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(
      <AddressBookView addresses={[makeAddress()]} onBack={vi.fn()} onAdd={vi.fn()} onRemove={onRemove} onSetDefault={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Remove Home' }))

    expect(onRemove).toHaveBeenCalledWith('addr-1')
  })

  it('rejects adding an incomplete address', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<AddressBookView addresses={[]} onBack={vi.fn()} onAdd={onAdd} onRemove={vi.fn()} onSetDefault={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Add address' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a complete address.')
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('adds a complete address and clears the form', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<AddressBookView addresses={[]} onBack={vi.fn()} onAdd={onAdd} onRemove={vi.fn()} onSetDefault={vi.fn()} />)

    await user.type(screen.getByLabelText('Label (optional)'), 'Work')
    await user.type(screen.getByLabelText('Street address'), '456 Oak Ave')
    await user.type(screen.getByLabelText('City'), 'Shelbyville')
    await user.type(screen.getByLabelText('Postal code'), '67890')
    await user.click(screen.getByRole('button', { name: 'Add address' }))

    expect(onAdd).toHaveBeenCalledWith({
      label: 'Work',
      street: '456 Oak Ave',
      city: 'Shelbyville',
      postalCode: '67890',
    })
    expect(screen.getByLabelText('Street address')).toHaveValue('')
  })

  it('calls onBack when Back is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<AddressBookView addresses={[]} onBack={onBack} onAdd={vi.fn()} onRemove={vi.fn()} onSetDefault={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /Back/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
