/**
 * Parse API error response into a human-readable string.
 * @param {unknown} err - Axios error object
 * @param {string} fallback - Fallback message if error cannot be parsed
 * @returns {string|null} - Error message, or null if error should be silently ignored (e.g. 403)
 */
export function parseApiError(err, fallback = 'Không thể xử lý yêu cầu') {
  if (err?.response?.status === 403) return null
  const data = err?.response?.data
  if (!data) return err?.message || fallback
  if (typeof data === 'string') return data
  if (typeof data.message === 'string') return data.message
  if (typeof data.title === 'string') return data.title
  if (data.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).flat().filter(Boolean).join(' | ') || fallback
  }
  return fallback
}
