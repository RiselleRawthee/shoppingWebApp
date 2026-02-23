import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<MemoryRouter><EmptyState title="No items found" /></MemoryRouter>)
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('renders optional emoji', () => {
    render(<MemoryRouter><EmptyState emoji="🛒" title="Cart is empty" /></MemoryRouter>)
    expect(screen.getByText('🛒')).toBeInTheDocument()
  })

  it('renders action link when provided', () => {
    render(
      <MemoryRouter>
        <EmptyState title="Not found" action={{ label: 'Go home', href: '/' }} />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: 'Go home' })).toBeInTheDocument()
  })

  it('does not render action link when not provided', () => {
    render(<MemoryRouter><EmptyState title="Not found" /></MemoryRouter>)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
