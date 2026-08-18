import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HelpView from './HelpView'
import { HELP_TOPICS } from '../data/helpTopics'

describe('HelpView', () => {
  it('shows every help topic question and answer', () => {
    render(<HelpView onBack={vi.fn()} />)

    for (const topic of HELP_TOPICS) {
      expect(screen.getByText(topic.question)).toBeInTheDocument()
      expect(screen.getByText(topic.answer)).toBeInTheDocument()
    }
  })

  it('calls onBack when Back is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<HelpView onBack={onBack} />)

    await user.click(screen.getByRole('button', { name: /Back/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
