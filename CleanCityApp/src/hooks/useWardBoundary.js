import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'

function parseBoundingBox(raw) {
  if (!Array.isArray(raw) || raw.length < 4) return null
  const south = Number(raw[0])
  const north = Number(raw[1])
  const west = Number(raw[2])
  const east = Number(raw[3])
  if (![south, north, west, east].every(Number.isFinite)) return null
  return [
    [south, west],
    [north, east],
  ]
}

function syntheticBoundsFromCenter(lat, lng, delta = 0.012) {
  return [
    [lat - delta, lng - delta],
    [lat + delta, lng + delta],
  ]
}

function polygonFromBounds(bounds) {
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

function parseBackendWardGeometry(payload) {
  if (!payload || typeof payload !== 'object') return { geoJson: null, bounds: null }

  const geoCandidate =
    payload.geoJson ||
    payload.geojson ||
    payload.boundaryGeoJson ||
    payload.boundary ||
    null

  let parsedGeo = null
  if (typeof geoCandidate === 'string') {
    try {
      parsedGeo = JSON.parse(geoCandidate)
    } catch {
      parsedGeo = null
    }
  } else if (geoCandidate && typeof geoCandidate === 'object') {
    parsedGeo = geoCandidate
  }

  const lat = Number(payload.lat ?? payload.latitude)
  const lng = Number(payload.lng ?? payload.longitude)
  const pointBounds = Number.isFinite(lat) && Number.isFinite(lng)
    ? syntheticBoundsFromCenter(lat, lng)
    : null

  const bboxBounds = parseBoundingBox(payload.boundingbox || payload.boundingBox)

  return {
    geoJson: parsedGeo,
    bounds: bboxBounds || pointBounds,
  }
}

async function loadFromBackendWard(backendWardId) {
  if (!backendWardId) return null

  const endpoints = [`/wards/${backendWardId}`, `/wards/detail/${backendWardId}`]
  for (const endpoint of endpoints) {
    try {
      const res = await api.get(endpoint)
      const { geoJson, bounds } = parseBackendWardGeometry(res.data)
      if (geoJson || bounds) return { geoJson, bounds }
    } catch {
      // try next endpoint
    }
  }

  return null
}

export function useWardBoundary(selectedWard) {
  const [geoJson, setGeoJson] = useState(null)
  const [bounds, setBounds] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const query = useMemo(() => {
    if (!selectedWard?.name) return ''
    const district = selectedWard.districtName ? `${selectedWard.districtName}, ` : ''
    return `${selectedWard.name}, ${district}Hà Nội, Việt Nam`
  }, [selectedWard])

  const queryCandidates = useMemo(() => {
    if (!selectedWard?.name) return []

    const rawName = selectedWard.name.trim()
    const strippedName = rawName.replace(/^(Phường|Xã|Thị trấn)\s+/i, '').trim()
    const district = selectedWard.districtName?.trim()

    const candidates = [
      `${rawName}, ${district ? `${district}, ` : ''}Hà Nội, Việt Nam`,
      `${strippedName}, ${district ? `${district}, ` : ''}Hà Nội, Việt Nam`,
      `${rawName}, Hà Nội, Việt Nam`,
      `${strippedName}, Hà Nội, Việt Nam`,
      `Phường ${strippedName}, ${district ? `${district}, ` : ''}Hanoi, Vietnam`,
      `Xã ${strippedName}, ${district ? `${district}, ` : ''}Hanoi, Vietnam`,
      `${strippedName}, ${district ? `${district}, ` : ''}Hanoi, Vietnam`,
      `${strippedName}, Hanoi, Vietnam`,
    ]

    return [...new Set(candidates.filter(Boolean))]
  }, [selectedWard])

  useEffect(() => {
    if (!query) {
      setGeoJson(null)
      setBounds(null)
      setError(null)
      return
    }

    // Fast path: geometry already attached to selected ward (from HanoiMoi merged dataset)
    if (selectedWard?.boundaryGeoJson || selectedWard?.boundaryBounds) {
      setGeoJson(selectedWard.boundaryGeoJson || polygonFromBounds(selectedWard.boundaryBounds))
      setBounds(selectedWard.boundaryBounds || null)
      setError(null)
      setLoading(false)
      return
    }

    let mounted = true

    const run = async () => {
      // Clear old highlight immediately to avoid lingering previous ward
      setGeoJson(null)
      setBounds(null)
      setLoading(true)
      setError(null)
      try {
        const backendWardId = selectedWard?.backendWardId
        if (backendWardId) {
          const backendGeometry = await loadFromBackendWard(backendWardId)
          if (backendGeometry?.geoJson || backendGeometry?.bounds) {
            if (!mounted) return
            setGeoJson(backendGeometry.geoJson || polygonFromBounds(backendGeometry.bounds))
            setBounds(backendGeometry.bounds)
            return
          }
        }

        let chosen = null

        for (const q of queryCandidates) {
          const url =
            'https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&limit=5&countrycodes=vn&q=' +
            encodeURIComponent(q)

          const res = await fetch(url, {
            headers: { 'Accept-Language': 'vi' },
          })
          if (!res.ok) continue

          const data = await res.json()
          if (!Array.isArray(data) || data.length === 0) continue

          // Prefer administrative polygon in Hanoi
          const preferred =
            data.find(
              (item) =>
                item?.geojson &&
                /Hà Nội|Ha Noi|Hanoi/i.test(item?.display_name || '')
            ) || data.find((item) => item?.geojson) || data[0]

          if (preferred) {
            chosen = preferred
            break
          }
        }

        if (!chosen) {
          // Final fallback: point geocoding without polygon
          for (const q of queryCandidates) {
            const url =
              'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=vn&q=' +
              encodeURIComponent(q)

            const res = await fetch(url, {
              headers: { 'Accept-Language': 'vi' },
            })
            if (!res.ok) continue

            const data = await res.json()
            const first = data?.[0]
            const lat = Number(first?.lat)
            const lng = Number(first?.lon)
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              chosen = {
                ...first,
                geojson: null,
                boundingbox: null,
                _pointFallback: true,
                _lat: lat,
                _lng: lng,
              }
              break
            }
          }
        }

        if (!chosen) {
          throw new Error('Không tìm thấy dữ liệu vị trí cho phường/xã đã chọn')
        }

        if (!mounted) return

        const nextBounds =
          parseBoundingBox(chosen.boundingbox) ||
          (chosen._pointFallback
            ? syntheticBoundsFromCenter(chosen._lat, chosen._lng)
            : null)
        setBounds(nextBounds)

        // If polygon unavailable, fallback to bbox rectangle polygon for highlighting.
        if (chosen.geojson) {
          setGeoJson(chosen.geojson)
        } else if (nextBounds) {
          const [[south, west], [north, east]] = nextBounds
          setGeoJson(polygonFromBounds(nextBounds))
          setError('Không có polygon chi tiết, đang tô theo khung ước lượng')
          return
        } else {
          throw new Error('Không tìm thấy ranh giới cho phường/xã đã chọn')
        }
      } catch (err) {
        if (!mounted) return
        setGeoJson(null)
        setBounds(null)
        setError(err.message ?? 'Không thể tải ranh giới phường/xã')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [query, queryCandidates])

  return { geoJson, bounds, loading, error }
}
