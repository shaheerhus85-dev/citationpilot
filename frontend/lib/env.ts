const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://citationpilot-production.up.railway.app'

export const API_BASE_URL = API_BASE.replace(/\/+$/, '')
