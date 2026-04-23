import { useState, useEffect, useCallback } from 'react'
import { getMapMarkers } from '../services/mapService'
import { getReports, normalizeReport, statusToKey } from '../services/reportService'

function normalizeMarker(item) {
  const lat = item.lat ?? item.latitude
  const lng = item.lng ?? item.longitude
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null

  return {
    id: item.id,
    lat: Number(lat),
    lng: Number(lng),
    title: item.title || item.description || item.category?.name,
    address: item.address,
    location: item.ward?.name
      ? `${item.ward.name}, Hà Nội`
      : item.address,
    category: item.category?.name,
    categoryId: item.categoryId ?? item.category?.id,
    categoryIcon: item.category?.icon || item.categoryIcon,
    statusKey: item.statusKey || statusToKey(item.status),
    wardName: item.ward?.name || '',
    imageUrl: item.imageUrl || item.image || null,
    imageAfterUrl: item.imageAfterUrl || item.imageAfter || null,
  }
}

/**
 * @param {{ wardId?: number, category?: string, status?: string }} initialFilters
 */
export function useMapMarkers(initialFilters = {}) {
  const [markers, setMarkers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)

  const fetchMarkers = useCallback(async () => {
    // Clear old markers immediately so ward fallback highlight does not keep previous area
    setMarkers([])
    setLoading(true)
    setError(null)
    try {
      // Ưu tiên endpoint map chuyên dụng, fallback sang reports khi BE chưa có /map/markers
      try {
        const res = await getMapMarkers(filters)
        const parsed = Array.isArray(res.data)
          ? res.data.map(normalizeMarker).filter(Boolean)
          : []
        if (parsed.length > 0) {
          setMarkers(parsed)
          return
        }
      } catch {
        // noop, fallback phía dưới
      }

      const reportsRes = await getReports({
        wardId: filters.wardId,
        categoryId: filters.categoryId,
        pageIndex: 1,
        pageSize: 1000,
      }, { skipAuthRedirect: true })
      const items = (reportsRes.data?.items || []).map(normalizeReport)
      const parsedFallback = items.map(normalizeMarker).filter(Boolean)
      setMarkers(parsedFallback)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Không thể tải dữ liệu bản đồ')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchMarkers()
  }, [fetchMarkers])

  return { markers, loading, error, filters, setFilters, refetch: fetchMarkers }
}
