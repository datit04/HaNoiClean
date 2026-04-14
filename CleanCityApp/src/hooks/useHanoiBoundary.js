import { useEffect, useState } from 'react'

const FALLBACK_BOUNDS = [
  [20.52, 105.28],
  [21.48, 106.05],
]

function toLatLngRing(coords) {
  return coords.map(([lng, lat]) => [lat, lng])
}

function parseBoundary(geojson) {
  if (!geojson) return null

  if (geojson.type === 'Polygon' && Array.isArray(geojson.coordinates?.[0])) {
    return toLatLngRing(geojson.coordinates[0])
  }

  if (geojson.type === 'MultiPolygon' && Array.isArray(geojson.coordinates)) {
    // Choose the largest exterior ring by number of points as a practical heuristic.
    const rings = geojson.coordinates
      .map((polygon) => polygon?.[0])
      .filter((ring) => Array.isArray(ring) && ring.length > 2)

    if (rings.length === 0) return null

    const largestRing = rings.reduce((best, current) =>
      current.length > best.length ? current : best
    )

    return toLatLngRing(largestRing)
  }

  return null
}

function parseBounds(boundingbox) {
  if (!Array.isArray(boundingbox) || boundingbox.length < 4) return FALLBACK_BOUNDS

  const south = Number(boundingbox[0])
  const north = Number(boundingbox[1])
  const west = Number(boundingbox[2])
  const east = Number(boundingbox[3])

  if (![south, north, west, east].every(Number.isFinite)) return FALLBACK_BOUNDS

  return [
    [south, west],
    [north, east],
  ]
}

export function useHanoiBoundary() {
  const [ring, setRing] = useState(null)
  const [bounds, setBounds] = useState(FALLBACK_BOUNDS)

  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        const url =
          'https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&limit=1&countrycodes=vn&q=' +
          encodeURIComponent('Hà Nội, Việt Nam')

        const res = await fetch(url, {
          headers: { 'Accept-Language': 'vi' },
        })
        if (!res.ok) return

        const data = await res.json()
        const first = data?.[0]
        const parsedRing = parseBoundary(first?.geojson)
        const parsedBounds = parseBounds(first?.boundingbox)

        if (!mounted) return
        if (parsedRing) setRing(parsedRing)
        setBounds(parsedBounds)
      } catch {
        // Keep fallback boundary silently.
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [])

  return { ring, bounds }
}
