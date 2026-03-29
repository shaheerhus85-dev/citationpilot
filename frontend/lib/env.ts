const DEFAULT_API_BASE_URL = 'https://citationpilot-production.up.railway.app'

function normalizeApiBaseUrl(raw: string) {
  const value = (raw || '').trim()
  if (!value) return DEFAULT_API_BASE_URL

  const withoutTrailing = value.endsWith('/') ? value.slice(0, -1) : value
  if (withoutTrailing.startsWith('http://')) {
    const withoutScheme = withoutTrailing.slice('http://'.length)
    const isLocalhost = withoutScheme.startsWith('localhost') || withoutScheme.startsWith('127.0.0.1')
    return isLocalhost ? withoutTrailing : `https://${withoutScheme}`
  }
  return withoutTrailing
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL
)

export function buildApiUrl(endpoint: string) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${API_BASE_URL}${path}`
}
