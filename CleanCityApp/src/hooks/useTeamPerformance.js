import { useState, useEffect } from 'react'
import { getTeamPerformance } from '../services/teamApi'

/**
 * Fetch team performance data from GET /teams/performance
 * @param {{ teamId?: number, wardId?: number, fromDate?: string, toDate?: string }} params
 */
export function useTeamPerformance(params = {}) {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getTeamPerformance(params)
      .then((res) => {
        if (cancelled) return
        // API trả về array trực tiếp hoặc bọc trong object
        const raw = Array.isArray(res.data)
          ? res.data
          : res.data?.items ?? res.data?.data ?? res.data?.value ?? []
        setTeams(raw)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('[useTeamPerformance] Lỗi gọi API /teams/performance:', err?.response?.status, err?.response?.data ?? err?.message)
        setError(err)
        setTeams([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.teamId, params.wardId, params.fromDate, params.toDate])

  return { teams, loading, error }
}
