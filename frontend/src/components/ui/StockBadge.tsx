interface Props {
  stock: number
}

export function StockBadge({ stock }: Props) {
  return (
    <span className={`text-xs ${stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
      {stock > 0 ? `${stock} in stock` : 'Out of stock'}
    </span>
  )
}
