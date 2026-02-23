import { Link } from 'react-router-dom'

interface Props {
  to: string
  label?: string
}

export function BackLink({ to, label = '← Back' }: Props) {
  return (
    <Link to={to} className="text-blue-600 hover:underline text-sm mb-6 inline-block">
      {label}
    </Link>
  )
}
