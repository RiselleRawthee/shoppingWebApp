interface Props {
  message?: string
}

export function LoadingSpinner({ message = 'Loading...' }: Props) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-500 text-lg">{message}</div>
    </div>
  )
}
