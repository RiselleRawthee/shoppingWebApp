interface Props {
  amount: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-4xl',
}

export function Price({ amount, size = 'md', className = '' }: Props) {
  return (
    <span className={`font-bold text-gray-900 ${sizeClasses[size]} ${className}`}>
      R{amount.toFixed(2)}
    </span>
  )
}
