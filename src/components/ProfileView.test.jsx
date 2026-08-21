import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileView from './ProfileView'

describe('ProfileView', () => {
  const user1 = { name: 'Ada Lovelace', email: 'ada@gmail.com' }

  it('shows the current name and a read-only email', () => {
    render(<ProfileView user={user1} onBack={vi.fn()} onUpdateProfile={vi.fn()} />)

    expect(screen.getByLabelText('Name')).toHaveValue('Ada Lovelace')
    expect(screen.getByLabelText('Email')).toHaveValue('ada@gmail.com')
    expect(screen.getByLabelText('Email')).toBeDisabled()
  })

  it('calls onBack when Back is clicked', async () => {
    const userEv = userEvent.setup()
    const onBack = vi.fn()
    render(<ProfileView user={user1} onBack={onBack} onUpdateProfile={vi.fn()} />)

    await userEv.click(screen.getByRole('button', { name: /Back/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('saves an updated name and shows a confirmation', async () => {
    const userEv = userEvent.setup()
    const onUpdateProfile = vi.fn()
    render(<ProfileView user={user1} onBack={vi.fn()} onUpdateProfile={onUpdateProfile} />)

    const nameInput = screen.getByLabelText('Name')
    await userEv.clear(nameInput)
    await userEv.type(nameInput, 'Ada King')
    await userEv.click(screen.getByRole('button', { name: 'Save' }))

    expect(onUpdateProfile).toHaveBeenCalledWith({ name: 'Ada King' })
    expect(screen.getByRole('status')).toHaveTextContent('Profile updated.')
  })

  it('rejects a name with no letters without calling onUpdateProfile', async () => {
    const userEv = userEvent.setup()
    const onUpdateProfile = vi.fn()
    render(<ProfileView user={user1} onBack={vi.fn()} onUpdateProfile={onUpdateProfile} />)

    const nameInput = screen.getByLabelText('Name')
    await userEv.clear(nameInput)
    await userEv.type(nameInput, '123')
    await userEv.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter your name.')
    expect(onUpdateProfile).not.toHaveBeenCalled()
  })

  it('calls onViewAddresses when Manage addresses is clicked', async () => {
    const userEv = userEvent.setup()
    const onViewAddresses = vi.fn()
    render(
      <ProfileView
        user={user1}
        onBack={vi.fn()}
        onUpdateProfile={vi.fn()}
        onViewAddresses={onViewAddresses}
      />,
    )

    await userEv.click(screen.getByRole('button', { name: 'Manage addresses' }))

    expect(onViewAddresses).toHaveBeenCalledTimes(1)
  })
})
