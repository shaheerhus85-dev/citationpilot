const DEFAULT_API_BASE_URL = 'https://citationpilot-production.up.railway.app'
const API_SEGMENT = 'api'
const API_VERSION = 'v1'
const API_V1_PREFIX = `/${API_SEGMENT}/${API_VERSION}`

// Hard lock to production HTTPS origin to prevent mixed-content leakage from stale env/cache.
export const BASE_URL = DEFAULT_API_BASE_URL
export const API_V1_BASE_URL = `${BASE_URL}${API_V1_PREFIX}`

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
