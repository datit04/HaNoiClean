import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, GeoJSON, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  createReport,
  getCategories,
  ReportPriority,
} from '../../services/reportService'
import { swalSuccess, swalError } from '../../utils/swal'
import { useWardBoundary } from '../../hooks/useWardBoundary'
import { useHanoiWards } from '../../hooks/useHanoiWards'
import { parseApiError } from '../../utils/apiError'

const HANOI_CENTER = [21.0285, 105.8542]

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

const pinIcon = L.divIcon({
  html: `<span class="material-symbols-outlined" style="font-size:36px;color:#00639a;font-variation-settings:'FILL' 1;">location_on</span>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
})

function LocationPicker({ position, onPick }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng])
    },
  })
  return position ? <Marker position={position} icon={pinIcon} /> : null
}

function FlyToBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (!bounds) return
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 })
  }, [bounds, map])
  return null
}

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

  // Wards â€” same source as BanDo map page
  const { wards, loading: wardsLoading } = useHanoiWards()
  const selectedWard = useMemo(
    () => wards.find((w) => String(w.id) === String(wardId)) || null,
    [wardId, wards],
  )

  // Ward boundary â€” same approach as BanDo index
  const hasEmbeddedBoundary = Boolean(selectedWard?.boundaryGeoJson || selectedWard?.boundaryBounds)
  const {
    geoJson: fetchedGeoJson,
    bounds: fetchedBounds,
    loading: boundaryLoading,
  } = useWardBoundary(wardId && !hasEmbeddedBoundary ? selectedWard : null)

  const wardBounds = selectedWard?.boundaryBounds || fetchedBounds
  const wardGeoJson = selectedWard?.boundaryGeoJson || fetchedGeoJson || (wardBounds ? geoJsonFromBounds(wardBounds) : null)

  const fileInputRef = useRef(null)

  // Load categories
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
  }, [])

  // When ward changes, reset pin
  const handleWardChange = useCallback(
    (id) => {
      setWardId(id)
      setPin(null)
    },
    [],
  )

  // Image handling
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('KÃ­ch thÆ°á»›c áº£nh tá»‘i Ä‘a lÃ  5MB')
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
    if (!wardId) return setError('Vui lÃ²ng chá»n phÆ°á»ng/xÃ£')
    if (!categoryId) return setError('Vui lÃ²ng chá»n danh má»¥c')
    if (!description.trim()) return setError('Vui lÃ²ng nháº­p mÃ´ táº£')
    if (!pin) return setError('Vui lÃ²ng ghim vá»‹ trÃ­ trÃªn báº£n Ä‘á»“')

    const resolvedWardId = Number(selectedWard?.backendWardId)
    if (!resolvedWardId) return setError('PhÆ°á»ng/xÃ£ nÃ y chÆ°a Ä‘Æ°á»£c liÃªn káº¿t vá»›i há»‡ thá»‘ng. Vui lÃ²ng chá»n phÆ°á»ng/xÃ£ khÃ¡c.')

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
      swalSuccess('Táº¡o bÃ¡o cÃ¡o thÃ nh cÃ´ng!')
      onSuccess?.()
    } catch (err) {
      const msg = parseApiError(err)
      if (msg) setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const priorityOptions = [
    { value: ReportPriority.Low, label: 'Tháº¥p' },
    { value: ReportPriority.Medium, label: 'Trung bÃ¬nh' },
    { value: ReportPriority.High, label: 'Cao' },
  ]

  return (
    <div className="modal-overlay bg-on-surface/20 backdrop-blur-md">
      <div className="bg-surface-container-lowest w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-outline-variant/10">
        {/* â”€â”€ LEFT: Media & Map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="w-full md:w-2/5 bg-surface-container p-6 space-y-6">
          {/* Image upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-3 font-headline">
              HÃ¬nh áº£nh bÃ¡o cÃ¡o
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
                <p className="text-sm font-medium text-on-surface-variant">KÃ©o tháº£ hoáº·c nháº¥n Ä‘á»ƒ táº£i áº£nh</p>
                <p className="text-[10px] text-outline mt-1">Há»— trá»£ JPG, PNG (Tá»‘i Ä‘a 5MB)</p>
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
              Vá»‹ trÃ­ thá»±c Ä‘á»‹a
            </label>
            {!wardId ? (
              <div className="h-48 w-full rounded-xl bg-surface-container-highest border border-outline-variant/20 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl text-outline">map</span>
                <p className="text-sm font-medium">Vui lÃ²ng chá»n PhÆ°á»ng/XÃ£ trÆ°á»›c</p>
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
                  <FlyToBounds bounds={wardBounds} />
                  <WardHighlight geoJson={wardGeoJson} wardKey={wardId} />
                  <LocationPicker position={pin} onPick={setPin} />
                </MapContainer>
                <div className="absolute top-2 left-2 z-[1000] bg-surface/90 backdrop-blur px-2 py-1 rounded-lg">
                  <span className="text-[10px] font-bold text-primary">
                    {boundaryLoading ? 'Äang táº£i ranh giá»›i...' : 'Nháº¥n vÃ o báº£n Ä‘á»“ Ä‘á»ƒ ghim vá»‹ trÃ­'}
                  </span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-outline">VÄ© Ä‘á»™ (Lat)</span>
                <input
                  readOnly
                  type="text"
                  value={pin ? pin[0].toFixed(6) : 'â€”'}
                  className="w-full text-xs font-medium bg-surface-container-low border-none rounded-lg focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-outline">Kinh Ä‘á»™ (Long)</span>
                <input
                  readOnly
                  type="text"
                  value={pin ? pin[1].toFixed(6) : 'â€”'}
                  className="w-full text-xs font-medium bg-surface-container-low border-none rounded-lg focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* â”€â”€ RIGHT: Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex-1 p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-primary font-headline tracking-tight">Táº¡o BÃ¡o cÃ¡o Má»›i</h2>
              <p className="text-sm text-outline">Khá»Ÿi táº¡o phiáº¿u ghi nháº­n váº¥n Ä‘á» mÃ´i trÆ°á»ng má»›i.</p>
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
              <label className="block text-sm font-bold text-on-surface-variant font-headline">
                PhÆ°á»ng / XÃ£ <span className="text-error">*</span>
              </label>
              <select
                value={wardId}
                onChange={(e) => handleWardChange(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl text-sm py-2.5 focus:ring-1 focus:ring-primary"
                disabled={wardsLoading}
              >
                <option value="">Chá»n phÆ°á»ng / xÃ£</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.districtName ? `${w.name} (${w.districtName})` : w.name}
                  </option>
                ))}
              </select>
              {wardsLoading && <p className="text-xs text-on-surface-variant">Äang táº£i phÆ°á»ng/xÃ£...</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface-variant font-headline">
                Danh má»¥c <span className="text-error">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl text-sm py-2.5 focus:ring-1 focus:ring-primary"
              >
                <option value="">Chá»n danh má»¥c</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="col-span-full space-y-2">
              <label className="block text-sm font-bold text-on-surface-variant font-headline">
                MÃ´ táº£ chi tiáº¿t <span className="text-error">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl text-sm p-4 h-24 focus:ring-1 focus:ring-primary placeholder:text-outline/50"
                placeholder="Nháº­p mÃ´ táº£ chi tiáº¿t vá» sá»± cá»‘ hoáº·c hÃ¬nh áº£nh quan sÃ¡t Ä‘Æ°á»£c..."
              />
            </div>

            {/* Priority */}
            <div className="col-span-full space-y-2">
              <label className="block text-sm font-bold text-on-surface-variant font-headline">Má»©c Ä‘á»™ Æ°u tiÃªn</label>
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

            {/* Status (locked) */}
            <div className="col-span-full space-y-2">
              <label className="block text-sm font-bold text-on-surface-variant font-headline">Tráº¡ng thÃ¡i</label>
              <div className="bg-surface-container-low px-4 py-2.5 rounded-xl flex items-center gap-2 opacity-60">
                <div className="w-2 h-2 rounded-full bg-tertiary" />
                <span className="text-sm font-medium">Chá» xá»­ lÃ½</span>
                <span className="material-symbols-outlined text-xs ml-auto">lock</span>
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
              Há»§y
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary px-8 py-2.5 text-sm font-black shadow-primary/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">{submitting ? 'hourglass_empty' : 'save'}</span>
              {submitting ? 'Äang lÆ°u...' : 'LÆ°u BÃ¡o cÃ¡o'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

