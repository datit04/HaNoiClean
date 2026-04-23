import { useState, useEffect } from 'react'
import { getWeeklyStats } from '../services/reportService'

/**
 * Fetch weekly report stats and normalize for bar chart display.
 * @param {{ status?: number, wardId?: number, categoryId?: number }} params
 */
export function useWeeklyStats(params = {}) {
  const [bars, setBars] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ startOfWeek: '', endOfWeek: '', totalReports: 0 })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getWeeklyStats(params)
      .then((res) => {
        if (cancelled) return
        const data = res.data ?? {}
        const dailyStats = data.dailyStats ?? data.DailyStats ?? []
        const maxCount = Math.max(...dailyStats.map((d) => d.count ?? d.Count ?? 0), 1)

        setBars(
          dailyStats.map((d) => {
            const count = d.count ?? d.Count ?? 0
            return {
              label: d.dayOfWeek ?? d.DayOfWeek ?? '',
              // background bar: always 90% tall so days with 0 still show a track
              total: 90,
              // colored fill: proportional within background bar
              filled: Math.round((count / maxCount) * 100),
              tip: count,
            }
          })
        )
        setMeta({
          startOfWeek: data.startOfWeek ?? data.StartOfWeek ?? '',
          endOfWeek: data.endOfWeek ?? data.EndOfWeek ?? '',
          totalReports: data.totalReports ?? data.TotalReports ?? 0,
        })
      })
      .catch(() => {
        if (!cancelled) setBars([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.status, params.wardId, params.categoryId])

  return { bars, loading, meta }
}
