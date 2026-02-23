import { EmptyState } from '../components/ui/EmptyState'

export function NotFoundPage() {
  return (
    <EmptyState
      emoji="🔍"
      title="Page not found"
      message="The page you're looking for doesn't exist."
      action={{ label: '← Back to products', href: '/' }}
    />
  )
}
