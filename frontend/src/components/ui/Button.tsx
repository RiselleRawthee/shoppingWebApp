interface Props {
  children: React.ReactNode
  variant?: 'primary' | 'danger' | 'ghost' | 'pill'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'text-red-500 hover:text-red-700 disabled:opacity-50',
  ghost: 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50',
  pill: 'rounded-full text-sm font-medium transition-colors',
}

export function Button({
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`py-2 px-4 rounded-xl font-semibold transition-colors ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}
