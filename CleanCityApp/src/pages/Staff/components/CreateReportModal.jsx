import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, GeoJSON, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  createReport,
  getCategories,
  ReportPriority,
} from '../../../services/reportService'
import { swalSuccess, swalError } from '../../../utils/swal'
import { useWardBoundary } from '../../../hooks/useWardBoundary'
import { useHanoiWards } from '../../../hooks/useHanoiWards'
import { parseApiError } from '../../../utils/apiError'

const HANOI_CENTER = [21.0285, 105.8542]

// Ray-casting point-in-polygon (GeoJSON coords = [lng, lat])
function pointInGeoJson(lat, lng, geoJson) {
  if (!geoJson) return false
  const testRing = (ring) => {
    let inside = false
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i]
      const [xj, yj] = ring[j]
      if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)
        inside = !inside
    }
    return inside
  }
  if (geoJson.type === 'Polygon') return testRing(geoJson.coordinates[0])
  if (geoJson.type === 'MultiPolygon') return geoJson.coordinates.some((p) => testRing(p[0]))
  return false
}

function geoJsonFromBounds(bounds) {
  if (!bounds) return null
  const [[south, west], [north, east]] = bounds
  return {
    type: 'Polygon',
    coordinates: [[
      [west, south], [east, south], [east, north], [west, north], [west, south],
    ]],
  }
}

function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

function FlyToBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (!bounds) return
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 })
  }, [bounds, map])
  return null
}

function FlyToLocation({ location }) {
  const map = useMap()
  useEffect(() => {
    if (!location) return
    map.flyTo([location.lat, location.lng], 17, { duration: 1 })
  }, [location, map])
  return null
}

const userDotIcon = L.divIcon({
  html: `<div style="
    width:16px;height:16px;
    background:#2563eb;
    border:3px solid #fff;
    border-radius:50%;
    box-shadow:0 0 0 2px #2563eb55;
  "></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function WardHighlight({ geoJson, wardKey }) {
  if (!geoJson) return null
  return (
    <GeoJSON
      key={`ward-${wardKey}`}
      data={geoJson}
      style={{
        color: '#065f46',
        weight: 3,
        fillColor: '#34d399',
        fillOpacity: 0.35,
      }}
    />
  )
}

export default function CreateReportModal({ onClose, onSuccess }) {
  const [categories, setCategories] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [wardId, setWardId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(ReportPriority.Medium)
  const [pin, setPin] = useState(null) // [lat, lng]
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // GPS auto-location
  const [gpsEnabled, setGpsEnabled] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState('')
  const [userGpsLocation, setUserGpsLocation] = useState(null) // { lat, lng, accuracy }

  // Wards — same source as BanDo map page
  const { wards, loading: wardsLoading } = useHanoiWards()
  const selectedWard = useMemo(
    () => wards.find((w) => String(w.id) === String(wardId)) || null,
    [wardId, wards],
  )

  // Ward boundary — same approach as BanDo index
  const hasEmbeddedBoundary = Boolean(selectedWard?.boundaryGeoJson || selectedWard?.boundaryBounds)
  const {
    geoJson: fetchedGeoJson,
    bounds: fetchedBounds,
    loading: boundaryLoading,
  } = useWardBoundary(wardId && !hasEmbeddedBoundary ? selectedWard : null)

  const wardBounds = selectedWard?.boundaryBounds || fetchedBounds
  const wardGeoJson = selectedWard?.boundaryGeoJson || fetchedGeoJson || (wardBounds ? geoJsonFromBounds(wardBounds) : null)

  const fileInputRef = useRef(null)
  const hasFetchedOnMount = useRef(false)

  // Load categories
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
  }, [])

  // Core GPS fetch — shared by toggle and auto-mount
  const fetchGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Trình duyệt không hỗ trợ định vị')
      return
    }
    setGpsLoading(true)
    setGpsError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords
        setUserGpsLocation({ lat, lng, accuracy })
        setPin([lat, lng])

        // Primary: point-in-polygon against embedded HanoiMoi boundaries (correct post-merger wards)
        const matched = wards.find((w) => w.boundaryGeoJson && pointInGeoJson(lat, lng, w.boundaryGeoJson))
        if (matched) {
          setWardId(String(matched.id))
          setGpsEnabled(true)
          setGpsLoading(false)
          return
        }

        // Fallback: Nominatim reverse geocode name-matching
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=vi`,
            { headers: { 'Accept-Language': 'vi' } },
          )
          const data = await res.json()
          const addr = data.address || {}
          const wardCandidate = addr.suburb || addr.quarter || addr.village || addr.town || ''
          const normalize = (s) =>
            s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/phuong|xa|thi tran/gi, '').trim()
          const normCandidate = normalize(wardCandidate)
          const fallback =
            wards.find((w) => normalize(w.name) === normCandidate) ||
            wards.find((w) => normalize(w.name).includes(normCandidate) || normCandidate.includes(normalize(w.name)))
          if (fallback) {
            setWardId(String(fallback.id))
          } else {
            setGpsError('Không tìm thấy phường/xã. Vui lòng chọn thủ công.')
          }
        } catch {
          setGpsError('Không thể xác định phường/xã từ vị trí này')
        }
        setGpsEnabled(true)
        setGpsLoading(false)
      },
      (err) => {
        setGpsLoading(false)
        setGpsEnabled(false)
        if (err.code === 1) setGpsError('Bạn đã từ chối quyền truy cập vị trí')
        else setGpsError('Không lấy được vị trí hiện tại')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [wards])

  // Auto-fetch GPS once when wards finish loading
  useEffect(() => {
    if (wards.length > 0 && !hasFetchedOnMount.current) {
      hasFetchedOnMount.current = true
      fetchGpsLocation()
    }
  }, [wards, fetchGpsLocation])

  // When ward changes, reset pin
  const handleWardChange = useCallback(
    (id) => {
      setWardId(id)
      setPin(null)
      if (gpsEnabled) {
        setGpsEnabled(false)
        setUserGpsLocation(null)
      }
    },
    [gpsEnabled],
  )

  const handleToggleGps = useCallback(() => {
    if (gpsEnabled) {
      setGpsEnabled(false)
      setGpsError('')
      setUserGpsLocation(null)
    } else {
      fetchGpsLocation()
    }
  }, [gpsEnabled, fetchGpsLocation])

  // Image handling
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh tối đa là 5MB')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!wardId) return setError('Vui lòng chọn phường/xã')
    if (!categoryId) return setError('Vui lòng chọn danh mục')
    if (!description.trim()) return setError('Vui lòng nhập mô tả')
    if (!pin) return setError('Vui lòng ghim vị trí trên bản đồ')

    const resolvedWardId = Number(selectedWard?.backendWardId)
    if (!resolvedWardId) return setError('Phường/xã này chưa được liên kết với hệ thống. Vui lòng chọn phường/xã khác.')

    setSubmitting(true)
    setError('')
    try {
      await createReport({
        description: description.trim(),
        image: imageFile,
        latitude: pin[0],
        longitude: pin[1],
        wardId: resolvedWardId,
        categoryId: Number(categoryId),
        priority,
      })
      swalSuccess('Tạo báo cáo thành công!')
      onSuccess?.()
    } catch (err) {
      const msg = parseApiError(err)
      if (msg) setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const priorityOptions = [
    { value: ReportPriority.Low, label: 'Thấp' },
    { value: ReportPriority.Medium, label: 'Trung bình' },
    { value: ReportPriority.High, label: 'Cao' },
  ]

  return (
    <div className="modal-overlay bg-on-surface/20 backdrop-blur-md">
      <div className="bg-surface-container-lowest w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-outline-variant/10">
        {/* ── LEFT: Media & Map ────────────────────────── */}
        <div className="w-full md:w-2/5 bg-surface-container p-6 space-y-6">
          {/* Image upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-3 font-headline">
              Hình ảnh báo cáo
            </label>
            {imagePreview ? (
              <div className="relative aspect-square w-full rounded-xl overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-error text-on-error p-1.5 rounded-full shadow-lg hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square w-full rounded-xl bg-surface-container-highest border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-center p-4 group cursor-pointer hover:border-primary transition-all"
              >
                <span className="material-symbols-outlined text-4xl text-primary/40 group-hover:text-primary mb-2">
                  cloud_upload
                </span>
                <p className="text-sm font-medium text-on-surface-variant">Kéo thả hoặc nhấn để tải ảnh</p>
                <p className="text-[10px] text-outline mt-1">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          {/* Map pin */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-3 font-headline">
              Vị trí thực địa
            </label>
            {!wardId ? (
              <div className="h-48 w-full rounded-xl bg-surface-container-highest border border-outline-variant/20 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl text-outline">map</span>
                <p className="text-sm font-medium">Vui lòng chọn Phường/Xã trước</p>
              </div>
            ) : (
              <div className="h-48 w-full rounded-xl overflow-hidden relative border border-outline-variant/20">
                <MapContainer
                  center={HANOI_CENTER}
                  zoom={14}
                  className="h-full w-full"
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                  />
                  {userGpsLocation
                    ? <FlyToLocation location={userGpsLocation} />
                    : <FlyToBounds bounds={wardBounds} />}
                  <WardHighlight geoJson={wardGeoJson} wardKey={wardId} />
                  {pin && (
                    <Marker
                      position={pin}
                      icon={userDotIcon}
                      zIndexOffset={500}
                    />
                  )}
                  <LocationPicker onPick={setPin} />
                </MapContainer>
                <div className="absolute top-2 left-2 z-[1000] bg-surface/90 backdrop-blur px-2 py-1 rounded-lg">
                  <span className="text-[10px] font-bold text-primary">
                    {boundaryLoading
                      ? 'Đang tải ranh giới...'
                      : gpsEnabled && pin
                      ? 'Vị trí của bạn · Nhấn bản đồ để điều chỉnh'
                      : 'Nhấn vào bản đồ để ghim vị trí'}
                  </span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-outline">Vĩ độ (Lat)</span>
                <input
                  readOnly
                  type="text"
                  value={pin ? pin[0].toFixed(6) : '—'}
                  className="w-full text-xs font-medium bg-surface-container-low border-none rounded-lg focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-outline">Kinh độ (Long)</span>
                <input
                  readOnly
                  type="text"
                  value={pin ? pin[1].toFixed(6) : '—'}
                  className="w-full text-xs font-medium bg-surface-container-low border-none rounded-lg focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form ──────────────────────────────── */}
        <div className="flex-1 p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-primary font-headline tracking-tight">Tạo Báo cáo Mới</h2>
              <p className="text-sm text-outline">Khởi tạo phiếu ghi nhận vấn đề môi trường mới.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ward */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface-variant font-headline shrink-0">
                Phường / Xã <span className="text-error">*</span>
              </label>
              <select
                value={wardId}
                onChange={(e) => handleWardChange(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl text-sm py-2.5 focus:ring-1 focus:ring-primary"
                disabled={wardsLoading || gpsLoading}
              >
                <option value="">Chọn phường / xã</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.districtName ? `${w.name} (${w.districtName})` : w.name}
                  </option>
                ))}
              </select>
              {!gpsError && wardsLoading && <p className="text-xs text-on-surface-variant">Đang tải phường/xã...</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface-variant font-headline">
                Danh mục <span className="text-error">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl text-sm py-2.5 focus:ring-1 focus:ring-primary"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* GPS toggle row */}
            <div className="col-span-full">
              <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{
                      color: gpsEnabled ? '#22c55e' : '#ef4444',
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    my_location
                  </span>
                  <div>
                    <p className="text-sm font-bold text-on-surface-variant">
                      {gpsLoading ? 'Đang định vị...' : 'Sử dụng vị trí của bạn'}
                    </p>
                    {gpsError ? (
                      <p className="text-xs text-error">{gpsError}</p>
                    ) : gpsEnabled && wardId ? (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Đã xác định phường/xã từ GPS
                      </p>
                    ) : (
                      <p className="text-xs text-outline">Tự động chọn phường/xã và ghim vị trí</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {gpsLoading && (
                    <span className="material-symbols-outlined text-base text-outline animate-spin">sync</span>
                  )}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={gpsEnabled}
                    onClick={handleToggleGps}
                    disabled={gpsLoading || wardsLoading}
                    title={gpsEnabled ? 'Tắt GPS' : 'Bật GPS'}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                      gpsEnabled ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
                        gpsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="col-span-full space-y-2">
              <label className="block text-sm font-bold text-on-surface-variant font-headline">
                Mô tả chi tiết <span className="text-error">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl text-sm p-4 h-24 focus:ring-1 focus:ring-primary placeholder:text-outline/50"
                placeholder="Nhập mô tả chi tiết về sự cố hoặc hình ảnh quan sát được..."
              />
            </div>

            {/* Priority */}
            <div className="col-span-full space-y-2">
              <label className="block text-sm font-bold text-on-surface-variant font-headline">Mức độ ưu tiên</label>
              <div className="flex gap-3">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      priority === opt.value
                        ? 'bg-primary-container text-on-primary-container shadow-sm font-black'
                        : 'border border-outline-variant/30 hover:bg-surface-container'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-outline-variant/10">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-bold text-outline hover:text-on-surface transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary px-8 py-2.5 text-sm font-black shadow-primary/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">{submitting ? 'hourglass_empty' : 'save'}</span>
              {submitting ? 'Đang lưu...' : 'Lưu Báo cáo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
