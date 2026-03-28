const DEFAULT_API_PROXY_BASE = '/backend'

function normalizeApiBasePath(raw: string) {
  const value = (raw || '').trim()
  if (!value) return DEFAULT_API_PROXY_BASE
  return value.endsWith('/') ? value.slice(0, -1) : value
}

// Frontend should call same-origin proxy path to avoid mixed-content/CORS issues.
export const API_BASE_URL = normalizeApiBasePath(process.env.NEXT_PUBLIC_API_BASE_PATH || DEFAULT_API_PROXY_BASE)
