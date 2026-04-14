import { useState, useEffect, useCallback } from 'react'
import { getMyReports, normalizeReport } from '../services/reportService'

/**
 * Fetch reports belonging to the currently logged-in user.
 * Maps BE integer enums to FE string keys used by ReportList / ProgressTracker.
 */
export function useMyReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMyReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMyReports()
      setReports((Array.isArray(res.data) ? res.data : []).map(normalizeReport))
    } catch (err) {
      setError(err.response?.data?.message ?? 'Không thể tải báo cáo')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMyReports()
  }, [fetchMyReports])

  return { reports, loading, error, refetch: fetchMyReports }
}
