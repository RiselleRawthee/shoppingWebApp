interface Props {
  label: string
  variant?: 'category' | 'success' | 'danger'
}

const variantClasses = {
  category: 'text-blue-600',
  success: 'text-green-600',
  danger: 'text-red-500',
}

export function Badge({ label, variant = 'category' }: Props) {
  return (
    <span className={`text-xs font-medium uppercase tracking-wide ${variantClasses[variant]}`}>
      {label}
    </span>
  )
}
