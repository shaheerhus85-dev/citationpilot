export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(value?: string | Date | null) {
  if (!value) return 'N/A'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString()
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function truncate(text: string, length = 80) {
  if (!text) return ''
  if (text.length <= length) return text
  return `${text.slice(0, Math.max(0, length - 3))}...`
}

export function parseError(error: unknown) {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const maybeError = error as {
      message?: string
      response?: { data?: { detail?: string; message?: string } }
    }
    return (
      maybeError.response?.data?.detail ||
      maybeError.response?.data?.message ||
      maybeError.message ||
      'Something went wrong'
    )
  }
  return 'Something went wrong'
}
