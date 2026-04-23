import { useState, useEffect } from 'react'
import { getTopWards } from '../services/reportService'

/**
 * Fetch top wards by report count.
 * @param {{ top?: number, fromDate?: string, toDate?: string }} params
 */
export function useTopWards(params = { top: 5 }) {
  const [wards, setWards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getTopWards(params)
      .then((res) => {
        if (cancelled) return
        const raw = Array.isArray(res.data)
          ? res.data
          : res.data?.items ?? res.data?.data ?? []
        setWards(
          raw.map((item) => ({
            wardId: item.wardId,
            wardName: item.wardName ?? item.name ?? 'Không rõ',
            totalReports: item.totalReports ?? item.count ?? 0,
          }))
        )
      })
      .catch(() => {
        if (!cancelled) setWards([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.top, params.fromDate, params.toDate])

  return { wards, loading }
}
