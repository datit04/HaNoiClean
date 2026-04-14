import { useState, useEffect, useCallback } from 'react'
import { getReportProgress } from '../services/reportService'

/**
 * @param {number | null} reportId
 */
export function useReportProgress(reportId) {
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProgress = useCallback(async () => {
    if (!reportId) return
    setLoading(true)
    setError(null)
    try {
      const res = await getReportProgress(reportId)
      setProgress(res.data)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Không thể tải tiến độ')
    } finally {
      setLoading(false)
    }
  }, [reportId])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return { progress, loading, error, refetch: fetchProgress }
}
