interface Category {
  label: string
  value?: string
}

interface Props {
  categories: Category[]
  activeValue?: string
  onChange: (value: string) => void
}

export function CategoryFilter({ categories, activeValue, onChange }: Props) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {categories.map((cat) => (
        <button
          key={cat.label}
          onClick={() => onChange(cat.label)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            (cat.label === 'All' && !activeValue) || cat.value === activeValue || cat.label === activeValue
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
