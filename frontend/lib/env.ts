const DEFAULT_API_BASE_URL = 'https://citationpilot-production.up.railway.app'
const DEFAULT_API_BASE_PATH = '/backend'

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

function normalizeApiBasePath(raw: string) {
  const value = (raw || '').trim()
  if (!value) return DEFAULT_API_BASE_PATH
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash.slice(0, -1) : withLeadingSlash
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL
)
export const API_BASE_PATH = normalizeApiBasePath(process.env.NEXT_PUBLIC_API_BASE_PATH || DEFAULT_API_BASE_PATH)
export const API_ROOT = `${API_BASE_URL}${API_BASE_PATH}`

export function buildApiUrl(endpoint: string) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${API_ROOT}${path}`
}
