interface Props {
  src: string
  alt: string
  size?: 'thumbnail' | 'card' | 'detail'
  hoverZoom?: boolean
}

const sizeClasses = {
  thumbnail: 'w-20 h-20',
  card: 'aspect-square',
  detail: 'w-full h-full',
}

export function ProductImage({ src, alt, size = 'card', hoverZoom = false }: Props) {
  return (
    <div className={`bg-gray-50 overflow-hidden rounded-lg ${size === 'thumbnail' ? sizeClasses.thumbnail : ''}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${hoverZoom ? 'group-hover:scale-105 transition-transform duration-300' : ''} ${size === 'detail' ? 'rounded-xl' : ''}`}
      />
    </div>
  )
}
