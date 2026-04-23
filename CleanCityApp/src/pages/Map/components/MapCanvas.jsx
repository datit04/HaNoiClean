import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useHanoiBoundary } from '../../../hooks/useHanoiBoundary'

const HANOI_CENTER = [21.0285, 105.8542]
// Approximate administrative bounding box of Hanoi
const FALLBACK_HANOI_BOUNDS = [
  [20.52, 105.28],
  [21.48, 106.05],
]

// Simplified Hanoi boundary polygon (for visual masking)
const HANOI_POLYGON = [
  [21.43, 105.55],
  [21.42, 105.77],
  [21.36, 105.95],
  [21.27, 106.02],
  [21.12, 106.03],
  [20.97, 105.99],
  [20.82, 105.91],
  [20.72, 105.77],
  [20.68, 105.60],
  [20.73, 105.44],
  [20.85, 105.33],
  [21.02, 105.29],
  [21.19, 105.30],
  [21.32, 105.37],
]

// World ring with Hanoi as a hole to dim the outside area.
const WORLD_RING = [
  [-85, -180],
  [-85, 180],
  [85, 180],
  [85, -180],
]

function statusColor(status) {
  if (status === 'done' || status === 'resolved') return '#206223'
  if (status === 'processing' || status === 'inprogress') return '#f59e0b'
  return '#ba1a1a'
}

function isNewStatus(status) {
  return status === 'submitted' || status === 'received' || status === 'new'
}

function createMarkerIcon(status, categoryIcon) {
  const color = statusColor(status)
  const showPing = isNewStatus(status)
  const icon = categoryIcon || 'report'

  const html = `
    <div class="map-marker">
      ${showPing ? `<div class="map-marker__ping" style="background:${color}"></div>` : ''}
      <div class="map-marker__body" style="background:${color}">
        <span class="material-symbols-outlined">${icon}</span>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

function MapBridge({ mapRef }) {
  const map = useMap()
  mapRef.current = map
  return null
}

function WardBoundaryZoom({ bounds }) {
  const map = useMap()

  useEffect(() => {
    if (!bounds) return
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 })
  }, [bounds, map])

  return null
}

const MapCanvas = forwardRef(function MapCanvas(
  { markers = [], selectedWardGeoJson = null, selectedWardBounds = null, selectedWardKey = '' },
  ref
) {
  const { ring: hanoiBoundaryRing, bounds: hanoiBounds } = useHanoiBoundary()
  const mapRef = useRef(null)
  const [tileSet, setTileSet] = useState('default')

  const activeBounds = hanoiBounds || FALLBACK_HANOI_BOUNDS
  const activeBoundaryRing = hanoiBoundaryRing || HANOI_POLYGON

  useImperativeHandle(ref, () => ({
    zoomIn() {
      mapRef.current?.zoomIn()
    },
    zoomOut() {
      mapRef.current?.zoomOut()
    },
    flyToHanoi() {
      mapRef.current?.fitBounds(activeBounds, { padding: [16, 16] })
    },
    flyToUser() {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition((position) => {
        mapRef.current?.flyTo([position.coords.latitude, position.coords.longitude], 15)
      })
    },
    toggleTile() {
      setTileSet((prev) => (prev === 'default' ? 'hot' : 'default'))
    },
  }))

  const tileUrl =
    tileSet === 'default'
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'

  const sanitizedMarkers = useMemo(
    () =>
      markers
        .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng))
        .map((m) => ({
          id: m.id,
          lat: Number(m.lat),
          lng: Number(m.lng),
          title: m.title || 'Báo cáo môi trường',
          location: m.location || m.address || 'Hà Nội',
          status: m.statusKey || m.status || 'submitted',
          category: m.category || 'Chưa phân loại',
          categoryIcon: m.categoryIcon || 'report',
        })),
    [markers]
  )

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={HANOI_CENTER}
        zoom={12}
        minZoom={10}
        maxZoom={17}
        maxBounds={activeBounds}
        maxBoundsViscosity={1.0}
        className="h-full w-full"
        zoomControl={false}
      >
        <MapBridge mapRef={mapRef} />
        <TileLayer
          url={tileUrl}
          attribution='&copy; OpenStreetMap contributors'
        />

        <WardBoundaryZoom bounds={selectedWardBounds} />

        {/* Keep only Hanoi visually active */}
        <Polygon
          positions={[WORLD_RING, activeBoundaryRing]}
          pathOptions={{
            stroke: false,
            fillColor: '#000000',
            fillOpacity: 0.62,
            interactive: false,
          }}
        />

        {/* Hanoi boundary line */}
        <Polygon
          positions={activeBoundaryRing}
          pathOptions={{
            color: '#7f1d1d',
            weight: 7,
            fillOpacity: 0,
            opacity: 0.6,
            interactive: false,
          }}
        />

        <Polygon
          positions={activeBoundaryRing}
          pathOptions={{
            color: '#ef4444',
            weight: 3,
            fillOpacity: 0,
            interactive: false,
          }}
        />

        {selectedWardGeoJson && (
          <GeoJSON
            key={`ward-highlight-${selectedWardKey || 'none'}`}
            data={selectedWardGeoJson}
            style={{
              color: '#065f46',
              weight: 4,
              fillColor: '#34d399',
              fillOpacity: 0.45,
            }}
          />
        )}

        {sanitizedMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createMarkerIcon(marker.status, marker.categoryIcon)}
          >
            <Popup>
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase text-tertiary">{marker.category}</div>
                <div className="font-bold text-sm">{marker.title}</div>
                <div className="text-xs text-on-surface-variant">{marker.location}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
})

export default MapCanvas
