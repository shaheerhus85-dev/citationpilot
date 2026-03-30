const DEFAULT_API_BASE_URL = 'https://citationpilot-production.up.railway.app'
const API_SEGMENT = 'api'
const API_VERSION = 'v1'
const API_V1_PREFIX = `/${API_SEGMENT}/${API_VERSION}`

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
  const apiRoot = `/${API_SEGMENT}`
  const apiV1Root = `/${API_SEGMENT}/${API_VERSION}`
  if (path === apiV1Root || path === `${apiV1Root}/`) return '/'
  if (path.startsWith(`${apiV1Root}/`)) return path.slice(apiV1Root.length)
  if (path.startsWith(`${apiRoot}/`)) return path.slice(apiRoot.length)
  return path
}
