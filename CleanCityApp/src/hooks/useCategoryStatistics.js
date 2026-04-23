import { useState, useEffect } from 'react'
import { getCategoryStatistics } from '../services/reportService'

/**
 * Hook lấy thống kê báo cáo theo danh mục
 * @param {{ fromDate?: string, toDate?: string, wardId?: number, categoryId?: number, status?: number }} params
 * @returns {{ stats: Array<{ categoryId, categoryName, count, percentage }>, total: number, loading: boolean, error: string|null }}
 */
export function useCategoryStatistics(params = {}) {
  const [stats, setStats] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getCategoryStatistics(params)
        if (cancelled) return

        // Xử lý nhiều format response của BE:
        // - mảng trực tiếp: [...]
        // - { items: [...] }  (pagination wrapper)
        // - { data: [...] }   (.NET API wrapper)
        // - { data: { items: [...] } }
        const payload = res.data
        const raw = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.data?.items)
                ? payload.data.items
                : []

        const totalCount = raw.length > 0 ? (raw[0].total ?? raw.reduce((s, item) => s + (item.totalCount ?? item.count ?? 0), 0)) : 0

        const normalized = raw.map((item) => ({
          categoryId: item.categoryId ?? item.id,
          categoryName: item.categoryName ?? item.name ?? 'Khác',
          count: item.totalCount ?? item.count ?? 0,
          percentage: item.percentage != null ? Math.round(item.percentage) : 0,
        }))

        setStats(normalized)
        setTotal(totalCount)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Không thể tải thống kê')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.fromDate, params.toDate, params.wardId, params.categoryId, params.status])

  return { stats, total, loading, error }
}
