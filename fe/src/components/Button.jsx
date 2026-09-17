export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variantClass =
    variant === 'outline'
      ? 'border-stone-300 bg-white text-stone-900 hover:bg-stone-100'
      : 'border-stone-900 bg-stone-900 text-white hover:bg-stone-700'

  return (
    <button
      type="button"
      className={`min-h-11 w-full border px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
