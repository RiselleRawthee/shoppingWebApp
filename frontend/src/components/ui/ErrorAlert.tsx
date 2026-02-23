interface Props {
  message: string
}

export function ErrorAlert({ message }: Props) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
      {message}
    </div>
  )
}
