import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PolicyView from './PolicyView'
import { RETURN_POLICY } from '../data/policies'

describe('PolicyView', () => {
  it('shows the title and every section', () => {
    render(<PolicyView policy={RETURN_POLICY} onBack={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Return Policy' })).toBeInTheDocument()
    for (const section of RETURN_POLICY.sections) {
      expect(screen.getByRole('heading', { name: section.heading })).toBeInTheDocument()
      expect(screen.getByText(section.body)).toBeInTheDocument()
    }
  })

  it('calls onBack when Back is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<PolicyView policy={RETURN_POLICY} onBack={onBack} />)

    await user.click(screen.getByRole('button', { name: /Back/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
