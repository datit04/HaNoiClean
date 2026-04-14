import { useEffect, useMemo, useRef, useState } from 'react'
import TopNav from '../../components/layout/TopNav'
import BottomNav from '../../components/layout/BottomNav'
import FilterPanel from './components/FilterPanel'
import MapCanvas from './components/MapCanvas'
import StatsBar from './components/StatsBar'
import MapLeaderboard from './components/MapLeaderboard'
import CreateReportModal from '../CanBo/components/CreateReportModal'
import { useMapMarkers } from '../../hooks/useMapMarkers'
import { useHanoiWards } from '../../hooks/useHanoiWards'
import { useWardBoundary } from '../../hooks/useWardBoundary'
import { getCategories } from '../../services/reportService'

function geoJsonFromBounds(bounds) {
  if (!bounds) return null
  const [[south, west], [north, east]] = bounds
  return {
    type: 'Polygon',
    coordinates: [
      [
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south],
      ],
    ],
  }
}

export default function BanDo() {
  const mapActionsRef = useRef(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState({
    wardId: '',
    categoryIds: [],
  })

  // Categories from backend
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  useEffect(() => {
    setCategoriesLoading(true)
    getCategories()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : []
        setCategories(list)
        // Default: all categories checked
        setFilters((f) => ({ ...f, categoryIds: list.map((c) => c.id) }))
      })
      .catch(() => {})
      .finally(() => setCategoriesLoading(false))
  }, [])
  const { wards, options: wardOptions, loading: wardsLoading, error: wardsError } = useHanoiWards()
  const selectedWard = wardOptions.find((w) => String(w.id) === filters.wardId) || null
  const hasEmbeddedBoundary = Boolean(selectedWard?.boundaryGeoJson || selectedWard?.boundaryBounds)
  const {
    geoJson: selectedWardGeoJson,
    bounds: selectedWardBounds,
    loading: wardBoundaryLoading,
    error: wardBoundaryError,
  } = useWardBoundary(filters.wardId && !hasEmbeddedBoundary ? selectedWard : null)

  const { markers: allMarkers, refetch: refetchMarkers } = useMapMarkers({
    wardId: selectedWard?.backendWardId ? Number(selectedWard.backendWardId) : undefined,
  })

  // Filter markers on FE by checked categories
  const markers = useMemo(() => {
    // Luôn loại bỏ các báo cáo bị từ chối khỏi bản đồ
    const visibleMarkers = allMarkers.filter((m) => m.statusKey !== 'rejected')
    // All checked or none checked => show all
    if (filters.categoryIds.length === 0 || filters.categoryIds.length === categories.length) return visibleMarkers
    return visibleMarkers.filter((m) => {
      const catId = m.categoryId ?? m.category?.id
      return catId && filters.categoryIds.includes(catId)
    })
  }, [allMarkers, filters.categoryIds, categories.length])

  const effectiveWardBounds = selectedWard?.boundaryBounds || selectedWardBounds
  const effectiveWardGeoJson =
    selectedWard?.boundaryGeoJson ||
    selectedWardGeoJson ||
    (filters.wardId ? geoJsonFromBounds(effectiveWardBounds) : null)

  const handleWardChange = (wardId) => setFilters((f) => ({ ...f, wardId }))
  const handleCategoryToggle = (id) =>
    setFilters((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((cid) => cid !== id)
        : [...f.categoryIds, id],
    }))

  const handleNewReport = () => {
    setShowCreateModal(true)
  }

  // Compute stats from real marker data
  const stats = useMemo(() => {
    const total = allMarkers.length
    const resolved = allMarkers.filter((m) => m.statusKey === 'done').length
    const resolvedPercent = total > 0 ? Math.round((resolved / total) * 100) : 0

    const wardCount = {}
    for (const m of allMarkers) {
      if (m.wardName && m.statusKey === 'done') {
        wardCount[m.wardName] = (wardCount[m.wardName] || 0) + 1
      }
    }
    let topWard = '—'
    let topCount = 0
    for (const [name, count] of Object.entries(wardCount)) {
      if (count > topCount) { topWard = name; topCount = count }
    }

    return { total, resolvedPercent, topWard }
  }, [allMarkers])

  return (
    <div className="overflow-hidden">
      <TopNav />

      <div className="flex h-[calc(100vh-72px)] overflow-hidden">
        <FilterPanel
          filters={filters}
          wardOptions={wardOptions}
          wardCount={wards.length}
          wardsLoading={wardsLoading}
          wardsError={wardsError}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onWardChange={handleWardChange}
          onCategoryToggle={handleCategoryToggle}
          onNewReport={handleNewReport}
        />

        {/* Map area */}
        <main className="ml-80 w-full relative bg-surface">
          <MapCanvas
            ref={mapActionsRef}
            markers={markers.length > 0 ? markers : undefined}
            selectedWardGeoJson={effectiveWardGeoJson}
            selectedWardBounds={effectiveWardBounds}
            selectedWardKey={filters.wardId}
          />

          {(wardBoundaryLoading || wardBoundaryError) && (
            <div className="absolute top-6 left-6 z-20 bg-white/85 backdrop-blur-md px-4 py-2 rounded-xl shadow text-xs">
              {wardBoundaryLoading ? 'Đang tải ranh giới phường/xã...' : wardBoundaryError}
            </div>
          )}

          {/* Map controls */}
          <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
            <div className="map-control p-1 flex flex-col">
              <button
                onClick={() => mapActionsRef.current?.zoomIn()}
                className="p-3 hover:bg-surface-container-highest rounded-lg transition-colors text-primary"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
              <div className="h-[1px] bg-outline-variant/20 mx-2" />
              <button
                onClick={() => mapActionsRef.current?.zoomOut()}
                className="p-3 hover:bg-surface-container-highest rounded-lg transition-colors text-primary"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>
            <button
              onClick={() => mapActionsRef.current?.flyToUser()}
              className="map-control p-3"
            >
              <span className="material-symbols-outlined">my_location</span>
            </button>
            <button
              onClick={() => mapActionsRef.current?.toggleTile()}
              className="map-control p-3"
            >
              <span className="material-symbols-outlined">layers</span>
            </button>
          </div>

          <MapLeaderboard />

          <StatsBar totalReports={stats.total} resolvedPercent={stats.resolvedPercent} topDistrict={stats.topWard} />
        </main>
      </div>

      {showCreateModal && (
        <CreateReportModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); refetchMarkers() }}
        />
      )}

      <BottomNav />
    </div>
  )
}
