const DEFAULT_API_BASE_URL = 'https://citationpilot-production.up.railway.app'
const API_V1_PREFIX = '/api/v1'

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
export const API_V1_BASE_URL = `${API_BASE_URL}${API_V1_PREFIX}`

export function toApiV1Path(endpoint: string) {
  const raw = (endpoint || '').trim()
  const path = raw.startsWith('/') ? raw : `/${raw}`
  if (path === '/api/v1' || path === '/api/v1/') return '/'
  if (path.startsWith('/api/v1/')) return path.slice('/api/v1'.length)
  if (path.startsWith('/api/')) return path.slice('/api'.length)
  return path
}

export function buildApiUrl(endpoint: string) {
  return `${API_V1_BASE_URL}${toApiV1Path(endpoint)}`
}
