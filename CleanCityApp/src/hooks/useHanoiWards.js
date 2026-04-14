import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { getHanoiMergedWardsFromHanoiMoi } from '../services/hanoiBoundaryService'

function normalizeWard(item) {
  return {
    id: Number(item.id ?? item.code ?? item.wardId),
    name: item.name ?? item.wardName ?? '',
    districtName: item.districtName ?? item.district?.name ?? '',
    code: item.code ?? null,
  }
}

function dedupeAndSort(wards) {
  const map = new Map()
  for (const ward of wards) {
    const normalized = normalizeWard(ward)
    if (!normalized.id || !normalized.name) continue
    if (!map.has(normalized.id)) map.set(normalized.id, normalized)
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}

async function loadFromBackend() {
  // Expected shape: [] or { items: [], totalRecords: number }
  // Try single shot first
  const firstRes = await api.get('/wards', { params: { cityCode: '01', pageIndex: 1, pageSize: 500 } })
  const firstRaw = Array.isArray(firstRes.data) ? firstRes.data : firstRes.data?.items ?? []

  // If backend returns plain array, use it directly.
  if (Array.isArray(firstRes.data)) {
    return dedupeAndSort(firstRaw)
  }

  const totalRecords = Number(firstRes.data?.totalRecords ?? firstRaw.length)
  if (!Number.isFinite(totalRecords) || totalRecords <= firstRaw.length) {
    return dedupeAndSort(firstRaw)
  }

  // Paginate all remaining pages to avoid missing wards.
  const all = [...firstRaw]
  const pageSize = 500
  const totalPages = Math.ceil(totalRecords / pageSize)
  for (let pageIndex = 2; pageIndex <= totalPages; pageIndex += 1) {
    const pageRes = await api.get('/wards', { params: { cityCode: '01', pageIndex, pageSize } })
    const pageItems = Array.isArray(pageRes.data) ? pageRes.data : pageRes.data?.items ?? []
    all.push(...pageItems)
  }

  return dedupeAndSort(all)
}

async function loadFromPublicApi() {
  // Public administrative API for Vietnam (Hanoi code = 01)
  const response = await fetch('https://provinces.open-api.vn/api/p/01?depth=3')
  if (!response.ok) throw new Error('Không lấy được dữ liệu phường/xã từ public API')

  const data = await response.json()
  const wards = (data?.districts ?? []).flatMap((district) =>
    (district?.wards ?? []).map((ward) => ({
      id: ward.code,
      name: ward.name,
      districtName: district.name,
    }))
  )

  return dedupeAndSort(wards)
}

export function useHanoiWards() {
  const [wards, setWards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        // Source of truth: dataset used by hanoimoi.vn merged map
        try {
          const latestMerged = await getHanoiMergedWardsFromHanoiMoi()
          if (latestMerged.length > 0) {
            if (!mounted) return
            // Match hanoimoi wards with backend wards by code to get backendWardId
            let backendMap = new Map()
            try {
              const backendList = await loadFromBackend()
              for (const bw of backendList) {
                if (bw.code) backendMap.set(String(bw.code), bw.id)
              }
            } catch {
              // backend unavailable, continue without mapping
            }
            setWards(
              latestMerged.map((w) => ({
                ...w,
                backendWardId: backendMap.get(w.sourceId) ?? null,
              }))
            )
            return
          }
        } catch {
          // fallback below
        }

        // Keep one authoritative source to avoid mismatch after administrative merge.
        // If backend is up, use backend list only (expected latest merged dataset).
        try {
          const backendList = await loadFromBackend()
          if (!mounted) return
          setWards(
            backendList.map((w) => ({
              ...w,
              id: w.id,
              backendWardId: w.id,
              source: 'backend',
            }))
          )
          return
        } catch {
          // fallback below
        }

        const publicList = await loadFromPublicApi()
        if (!mounted) return
        setWards(
          publicList.map((w) => ({
            ...w,
            id: `pub-${w.id}`,
            backendWardId: null,
            source: 'public',
          }))
        )
      } catch (err) {
        if (!mounted) return
        setError(err.message ?? 'Không thể tải danh sách phường/xã Hà Nội')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [])

  const options = useMemo(
    () => [
      { id: '', name: 'Tất cả phường/xã', districtName: '' },
      ...wards,
    ],
    [wards]
  )

  return { wards, options, loading, error }
}
