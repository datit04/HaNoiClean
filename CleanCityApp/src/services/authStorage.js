const TOKEN_STORAGE_KEYS = ['access_token', 'token', 'jwt']

export function readAuthToken() {
  for (const key of TOKEN_STORAGE_KEYS) {
    const value = localStorage.getItem(key)
    if (value) return value
  }

  return null
}

export function persistAuthToken(token) {
  if (!token) return

  TOKEN_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key)
  })

  localStorage.setItem('access_token', token)
}

export function clearAuthSession() {
  TOKEN_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key)
  })
}

export { TOKEN_STORAGE_KEYS }