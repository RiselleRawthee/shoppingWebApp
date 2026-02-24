import { Link } from 'react-router-dom'

interface Action {
  label: string
  href: string
}

interface Props {
  emoji?: string
  title: string
  message?: string
  action?: Action
}

export function EmptyState({ emoji, title, message, action }: Props) {
  return (
    <div className="text-center py-12">
      {emoji && <div className="text-5xl mb-4">{emoji}</div>}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      {message && <p className="text-gray-500 mb-4">{message}</p>}
      {action && (
        <Link to={action.href} className="text-blue-600 hover:underline">
          {action.label}
        </Link>
      )}
    </div>
  )
}
