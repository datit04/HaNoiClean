import { useState, useEffect, useCallback } from 'react'
import { getReports, normalizeReport } from '../services/reportService'

/**
 * @param {{ wardId?: number, categoryId?: number, status?: number, priority?: number, pageIndex?: number, pageSize?: number }} initialFilters
 */
export function useReports(initialFilters = {}) {
  const [reports, setReports] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getReports(filters)
      // BE trả về { items: [], totalRecords: number }
      const { items = [], totalRecords: total = 0 } = res.data
      setReports(items.map(normalizeReport))
      setTotalRecords(total)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Không thể tải báo cáo')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return { reports, totalRecords, loading, error, filters, setFilters, refetch: fetchReports }
}
