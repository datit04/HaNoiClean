const HANOIMOI_MAP_DATA_URL = 'https://hnm.1cdn.vn/assets/hanoi-googlemap/mahoa_xa.json'

function decodeBase64Utf8(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder('utf-8').decode(bytes)
}

function normalizeText(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function parseNameAndDistrict(fullName) {
  // Typical format: "Phường Hoàn Kiếm" or "Xã ..."
  // Keep full label as name to avoid losing merged naming semantics.
  return {
    name: fullName || '',
    districtName: '',
  }
}

function geometryToBounds(geometry) {
  if (!geometry?.coordinates) return null

  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity

  const walk = (coords) => {
    if (!Array.isArray(coords)) return
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const lng = Number(coords[0])
      const lat = Number(coords[1])
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
        minLng = Math.min(minLng, lng)
        maxLng = Math.max(maxLng, lng)
      }
      return
    }
    for (const child of coords) walk(child)
  }

  walk(geometry.coordinates)

  if (![minLat, maxLat, minLng, maxLng].every(Number.isFinite)) return null
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ]
}

function featureCollectionToWard(fc) {
  const feature = fc?.features?.[0]
  const props = feature?.properties || {}
  const geometry = feature?.geometry || null
  const id = String(props.maxa || props.matinhxa || '')
  const fullName = props.ten_chi_tiet || ''
  const { name, districtName } = parseNameAndDistrict(fullName)

  if (!id || !name || !geometry) return null

  return {
    id: `hnm-${id}`,
    sourceId: id,
    backendWardId: null,
    name,
    districtName,
    boundaryGeoJson: geometry,
    boundaryBounds: geometryToBounds(geometry),
    source: 'hanoimoi',
    sortKey: normalizeText(name),
  }
}

export async function getHanoiMergedWardsFromHanoiMoi() {
  const res = await fetch(HANOIMOI_MAP_DATA_URL)
  if (!res.ok) throw new Error('Không lấy được dữ liệu bản đồ sáp nhập từ Hà Nội Mới')

  const payload = await res.json()
  const b64 = payload?.file?.data
  if (!b64) throw new Error('Dữ liệu bản đồ Hà Nội Mới không hợp lệ')

  const decoded = decodeBase64Utf8(b64)
  const parsed = JSON.parse(decoded)
  if (!Array.isArray(parsed)) throw new Error('Định dạng dữ liệu bản đồ Hà Nội Mới không hợp lệ')

  const rawWards = parsed
    .map(featureCollectionToWard)
    .filter(Boolean)

  // Source dataset currently contains duplicate features for a few ward codes.
  // Keep one record per sourceId to return the real unique merged set.
  const uniqueBySourceId = new Map()
  for (const ward of rawWards) {
    if (!uniqueBySourceId.has(ward.sourceId)) {
      uniqueBySourceId.set(ward.sourceId, ward)
    }
  }

  const wards = [...uniqueBySourceId.values()]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey, 'vi'))
    .map(({ sortKey, ...rest }) => rest)

  return wards
}
