const DEFAULT_API_BASE = 'https://citationpilot-production.up.railway.app'

function normalizeApiBase(raw: string) {
  let value = (raw || '').trim().replace(/\/+$/, '')
  if (!value) value = DEFAULT_API_BASE

  // Guard against mixed-content issues if an old HTTP URL is configured.
  if (value.startsWith('http://citationpilot-production.up.railway.app')) {
    value = value.replace('http://', 'https://')
  }

  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && value.startsWith('http://')) {
    value = value.replace('http://', 'https://')
  }

  return value
}

export const API_BASE_URL = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE)
