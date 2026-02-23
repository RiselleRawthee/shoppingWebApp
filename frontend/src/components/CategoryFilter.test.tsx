import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryFilter } from './CategoryFilter'

const categories = [
  { label: 'All' },
  { label: 'Electronics' },
  { label: 'Furniture' },
]

describe('CategoryFilter', () => {
  it('renders all category buttons', () => {
    render(<CategoryFilter categories={categories} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Electronics' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Furniture' })).toBeInTheDocument()
  })

  it('calls onChange with category label when clicked', () => {
    const onChange = vi.fn()
    render(<CategoryFilter categories={categories} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Electronics' }))
    expect(onChange).toHaveBeenCalledWith('Electronics')
  })

  it('highlights the active category', () => {
    render(<CategoryFilter categories={categories} activeValue="Electronics" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Electronics' })).toHaveClass('bg-blue-600')
  })

  it('highlights All when no activeValue', () => {
    render(<CategoryFilter categories={categories} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'All' })).toHaveClass('bg-blue-600')
  })
})
