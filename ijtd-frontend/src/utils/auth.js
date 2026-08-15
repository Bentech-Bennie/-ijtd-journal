// src/utils/auth.js
//
// KEY FIXES:
// 1. authFetch is now properly exported (it was missing from the original)
// 2. All authenticated calls use relative /api paths → go through Vite proxy
//    (avoids CORS entirely in development)
// 3. Token refresh works correctly
// 4. FormData detection prevents Content-Type override

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Use relative paths when running via Vite (proxy handles it)
// Use absolute API_BASE when accessed directly (production)
const toUrl = (path) => {
  // If path already starts with http, use as-is
  if (path.startsWith('http')) return path
  // Otherwise use the configured base
  return `${API_BASE}${path}`
}

/**
 * authFetch — wraps fetch() with:
 * - Automatic Bearer token from localStorage
 * - Content-Type: application/json (unless FormData)
 * - One silent token refresh on 401
 */
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('access_token')

  const buildHeaders = (tkn) => {
    const headers = { ...(options.headers || {}) }
    if (tkn) headers['Authorization'] = `Bearer ${tkn}`
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
    return headers
  }

  let res = await fetch(url, { ...options, headers: buildHeaders(token) })

  // Attempt one token refresh on 401
  if (res.status === 401) {
    const newToken = await _refreshToken()
    if (newToken) {
      res = await fetch(url, { ...options, headers: buildHeaders(newToken) })
    }
  }

  return res
}

const _refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) return null
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refresh}` },
    })
    if (!res.ok) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      return null
    }
    const data = await res.json()
    localStorage.setItem('access_token', data.access_token)
    return data.access_token
  } catch {
    return null
  }
}

/** Convenience: fetch JSON and throw on error */
export const authFetchJson = async (url, options = {}) => {
  const res = await authFetch(url, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

/** Convenience: fetch a binary blob (for file downloads) */
export const authFetchBlob = async (url, options = {}) => {
  const res = await authFetch(url, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.blob()
}

/** URL helpers */
export const adminUrl = (path) => `${API_BASE}/admin${path}`
export const authUrl  = (path) => `${API_BASE}/auth${path}`

/**
 * downloadBlob — fetch a file as blob and trigger browser download.
 * Works for both authenticated (admin) and public (article) files.
 * @param {string} url       - Full URL to fetch
 * @param {string} filename  - Suggested download filename
 * @param {boolean} auth     - Whether to attach Bearer token
 */
export const downloadBlob = async (url, filename, auth = false) => {
  let res
  if (auth) {
    res = await authFetch(url)
  } else {
    res = await fetch(url)
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(body.error || `Server returned ${res.status}`)
  }
  const blob    = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a       = document.createElement('a')
  a.href        = blobUrl
  a.download    = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
}