import { render, screen } from '@testing-library/react'
import { ErrorAlert } from './ErrorAlert'

describe('ErrorAlert', () => {
  it('renders the error message', () => {
    render(<ErrorAlert message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('has alert role for accessibility', () => {
    render(<ErrorAlert message="Error" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
