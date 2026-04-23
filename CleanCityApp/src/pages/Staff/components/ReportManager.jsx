import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DispatchModal from './DispatchModal'
import SelectionBar from '../../../components/common/SelectionBar'
import Pagination from '../../../components/common/Pagination'
import {
  getReports,
  getCategories,
  getWards,
  normalizeReport,
  ReportStatus,
  getReportStats,
  deleteReport,
} from '../../../services/reportService'
import { swalSuccess, swalError, swalConfirm, swalConfirmDelete, swalLoading, swalClose } from '../../../utils/swal'

const PAGE_SIZE = 8

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: '0', label: 'Mới gửi' },
  { value: '1', label: 'Đã tiếp nhận' },
  { value: '2', label: 'Đang xử lý' },
  { value: '3', label: 'Hoàn thành' },
  { value: '4', label: 'Từ chối' },
]

const STATUS_BADGE = {
  submitted: { label: 'Mới gửi', cls: 'bg-blue-100 text-blue-700' },
  received: { label: 'Tiếp nhận', cls: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Đang xử lý', cls: 'bg-orange-100 text-orange-700' },
  done: { label: 'Hoàn thành', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Từ chối', cls: 'bg-red-100 text-red-700' },
}

export default function ReportManager() {
  const [reports, setReports] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [statsAll, setStatsAll] = useState({ total: 0, inProgress: 0, completed: 0, rejected: 0 })
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [wards, setWards] = useState([])
  const [page, setPage] = useState(1)
  const [dispatchReport, setDispatchReport] = useState(null)

  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterWard, setFilterWard] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  // Load categories & wards for filters
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
    getWards()
      .then((res) => {
        const data = res.data
        setWards(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [])
      })
      .catch(() => {})
    // Lấy thống kê tổng hợp toàn bộ báo cáo
    getReportStats()
      .then((res) => setStatsAll(res.data))
      .catch(() => setStatsAll({ total: 0, inProgress: 0, completed: 0, rejected: 0 }))
  }, [])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const params = { pageIndex: page, pageSize: PAGE_SIZE }
      if (filterStatus) params.status = Number(filterStatus)
      if (filterCategory) params.categoryId = Number(filterCategory)
      if (filterWard) params.wardId = Number(filterWard)
      const res = await getReports(params)
      const { items = [], totalRecords: total = 0 } = res.data
      setReports(items.map(normalizeReport))
      setTotalRecords(total)
    } catch {
      setReports([])
      setTotalRecords(0)
      swalError('Không thể tải danh sách báo cáo')
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus, filterCategory, filterWard])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))

  // Stats computed from totalRecords + current filtered data
  const stats = useMemo(() => {
    const countByStatus = { submitted: 0, received: 0, processing: 0, done: 0, rejected: 0 }
    reports.forEach((r) => {
      if (countByStatus[r.statusKey] !== undefined) countByStatus[r.statusKey]++
    })
    return countByStatus
  }, [reports])

  const handleResetFilters = () => {
    setFilterStatus('')
    setFilterCategory('')
    setFilterWard('')
    setPage(1)
  }

  const handleDispatchSuccess = () => {
    setDispatchReport(null)
    fetchReports()
  }

  const handleDeleteReport = async (report) => {
    if (!(await swalConfirmDelete(`báo cáo`))) return
    try {
      await deleteReport(report.id)
      swalSuccess('Đã xoá báo cáo!')
      fetchReports()
    } catch (err) {
      if (err.response?.status !== 403) swalError('Không thể xoá báo cáo')
    }
  }

  // ── Multi-select ──────────────────────────────────────
  const toggleSelect = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const toggleSelectAll = () => {
    if (selectedIds.length === reports.length) setSelectedIds([])
    else setSelectedIds(reports.map((r) => r.id))
  }

  const handleBulkDelete = async () => {
    if (!(await swalConfirm(`Xoá ${selectedIds.length} báo cáo đã chọn?`, 'Hành động này không thể hoàn tác.'))) return
    swalLoading('Đang xoá...')
    let ok = 0, fail = 0
    for (const id of selectedIds) {
      try { await deleteReport(id); ok++ } catch { fail++ }
    }
    swalClose()
    setSelectedIds([])
    fetchReports()
    if (fail) swalError(`Xoá thất bại ${fail}/${ok + fail} báo cáo`)
    else swalSuccess(`Đã xoá ${ok} báo cáo!`)
  }

  const statCards = [
    {
      label: 'Tổng báo cáo',
      value: totalRecords,
      icon: 'description',
      color: 'bg-blue-500',
      bg: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      label: 'Chờ xử lý',
      value: stats.submitted + stats.received,
      icon: 'pending_actions',
      color: 'bg-yellow-500',
      bg: 'bg-yellow-50',
      textColor: 'text-yellow-700',
    },
    {
      label: 'Đang xử lý',
      value: stats.processing,
      icon: 'engineering',
      color: 'bg-orange-500',
      bg: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      label: 'Hoàn thành',
      value: stats.done,
      icon: 'check_circle',
      color: 'bg-green-500',
      bg: 'bg-green-50',
      textColor: 'text-green-700',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header giữ nguyên */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface mt-1">Quản lý Báo cáo</h2>
        </div>
      </div>

      {/* Stats Grid tổng hợp toàn bộ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tổng số báo cáo */}
        <div className="bg-surface-container-highest p-6 rounded-3xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-bold text-primary/70 uppercase tracking-widest mb-1">Tổng số báo cáo</p>
            <h3 className="text-4xl font-extrabold text-primary font-headline">{statsAll.total}</h3>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-primary/5 rotate-12 group-hover:rotate-0 transition-transform duration-500">assessment</span>
        </div>
        {/* Đang xử lý */}
        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
          <p className="text-sm font-bold text-secondary uppercase tracking-widest mb-1">Đang xử lý</p>
          <h3 className="text-4xl font-extrabold text-secondary font-headline">{statsAll.inProgress}</h3>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-full bg-secondary-fixed h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: `${statsAll.total ? Math.round((statsAll.inProgress / statsAll.total) * 100) : 0}%` }}></div>
            </div>
            <span className="text-xs font-bold text-secondary">{statsAll.total ? Math.round((statsAll.inProgress / statsAll.total) * 100) : 0}%</span>
          </div>
        </div>
        {/* Đã hoàn thành */}
        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Đã hoàn thành</p>
          <h3 className="text-4xl font-extrabold text-primary font-headline">{statsAll.completed}</h3>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-full bg-primary-fixed h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${statsAll.total ? Math.round((statsAll.completed / statsAll.total) * 100) : 0}%` }}></div>
            </div>
            <span className="text-xs font-bold text-primary">{statsAll.total ? Math.round((statsAll.completed / statsAll.total) * 100) : 0}%</span>
          </div>
        </div>
        {/* Từ chối */}
        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
          <p className="text-sm font-bold text-error uppercase tracking-widest mb-1">Từ chối</p>
          <h3 className="text-4xl font-extrabold text-error font-headline">{statsAll.rejected}</h3>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-full bg-error-container h-1.5 rounded-full overflow-hidden">
              <div className="bg-error h-full rounded-full" style={{ width: `${statsAll.total ? Math.round((statsAll.rejected / statsAll.total) * 100) : 0}%` }}></div>
            </div>
            <span className="text-xs font-bold text-error">{statsAll.total ? Math.round((statsAll.rejected / statsAll.total) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ───────────────────────────────────────── */}
      <div className="bg-surface-container-low p-4 rounded-2xl flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex-1 min-w-[200px]">
          <span className="material-symbols-outlined text-outline">tune</span>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
            className="bg-transparent border-none text-sm font-medium focus:ring-0 w-full cursor-pointer"
          >
            <option value="">Trạng thái: Tất cả</option>
            <option value="0">Chờ xử lý</option>
            <option value="2">Đang xử lý</option>
            <option value="3">Đã hoàn thành</option>
          </select>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex-1 min-w-[200px]">
          <span className="material-symbols-outlined text-outline">category</span>
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}
            className="bg-transparent border-none text-sm font-medium focus:ring-0 w-full cursor-pointer"
          >
            <option value="">Danh mục: Tất cả</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex-1 min-w-[200px]">
          <span className="material-symbols-outlined text-outline">location_on</span>
          <select
            value={filterWard}
            onChange={(e) => { setFilterWard(e.target.value); setPage(1) }}
            className="bg-transparent border-none text-sm font-medium focus:ring-0 w-full cursor-pointer"
          >
            <option value="">Khu vực: Tất cả</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <button className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors" onClick={handleResetFilters}>
          <span className="material-symbols-outlined block">restart_alt</span>
        </button>
      </div>

      {/* ── Selection Bar ────────────────────────────────────── */}
      <SelectionBar count={selectedIds.length} onClear={() => setSelectedIds([])}>
        <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-error text-on-error text-sm font-bold hover:bg-error/90 transition-colors">
          <span className="material-symbols-outlined text-lg">delete</span>
          Xoá ({selectedIds.length})
        </button>
      </SelectionBar>

      {/* ── Data Table ───────────────────────────────────────── */}
      <div className="bg-surface rounded-3xl border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container">
                <th className="px-3 py-4 w-10">
                  <input type="checkbox" className="accent-primary w-4 h-4 cursor-pointer" checked={reports.length > 0 && selectedIds.length === reports.length} onChange={toggleSelectAll} />
                </th>
                <th className="px-5 py-4 text-left font-semibold text-on-surface-variant">STT</th>
                <th className="px-5 py-4 text-left font-semibold text-on-surface-variant">Vấn đề</th>
                <th className="px-5 py-4 text-left font-semibold text-on-surface-variant hidden md:table-cell">Người gửi</th>
                <th className="px-5 py-4 text-left font-semibold text-on-surface-variant hidden lg:table-cell">Khu vực</th>
                <th className="px-5 py-4 text-left font-semibold text-on-surface-variant">Trạng thái</th>
                <th className="px-5 py-4 text-right font-semibold text-on-surface-variant">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-on-surface-variant">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-on-surface-variant">
                    Không có báo cáo nào
                  </td>
                </tr>
              ) : (
                reports.map((r, idx) => {
                  const badge = STATUS_BADGE[r.statusKey] || STATUS_BADGE.submitted
                  return (
                    <tr key={r.id} className={`border-b border-outline-variant/50 hover:bg-surface-container/50 transition-colors ${selectedIds.includes(r.id) ? 'bg-primary-fixed/30' : ''}`}>
                      <td className="px-3 py-4 w-10">
                        <input type="checkbox" className="accent-primary w-4 h-4 cursor-pointer" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} />
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-on-surface-variant">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {r.imageUrl ? (
                            <img
                              src={r.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-on-surface-variant text-lg">image</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface truncate max-w-[220px]">{r.title}</p>
                            <p className="text-xs text-on-surface-variant">{r.categoryName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant hidden md:table-cell">
                        {r.userName || r.user?.fullName || '—'}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant hidden lg:table-cell">{r.location}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Điều phối"
                            onClick={() => setDispatchReport(r)}
                            className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
                          </button>
                          <button
                            title="Xoá báo cáo"
                            onClick={() => handleDeleteReport(r)}
                            className="p-2 rounded-xl hover:bg-error/10 text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={page} totalPages={totalPages} totalRecords={totalRecords} label="báo cáo" onPageChange={setPage} />
      </div>

      {/* ── Bottom Section: Map + Activity ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotspot Map */}
        <div className="bg-surface-container-highest rounded-[2rem] overflow-hidden relative min-h-[280px]">
          <div className="absolute inset-0 z-0">
            <img
              alt="Hanoi map"
              className="w-full h-full object-cover opacity-80 grayscale-[0.2]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9No8O6mIenEwtx588mU7j-Arp9CKmamzNPp8i37QpK16UR1hctH3MImVm5azkjwjZ5GFyrCHkAIM0SX4cDiPFd3GS9wpKgFs3_EDjQILdbrqzZ4oyQ_w2nZQZ6I6yacEKJoGcsczCqU6-nCV_k72JK4ahHVv-1_4reiwPR9FsG9vjNkw2YVK1Z-oM3H3Cxbbgw-LYZMU6CzPLcC5K_U4hBkXZgk-FsMz6otoM5ftzHBXqVB8zRp2VE7k7h1ewtgCC-lBW1uVrxwff"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-5 left-5 right-5 z-20">
            <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold uppercase text-tertiary tracking-widest">
                  Bản đồ điểm nóng
                </span>
                <span className="text-sm font-bold text-on-surface">Theo dõi khu vực nhiều báo cáo</span>
              </div>
              <Link to="/ban-do">
                <span className="material-symbols-outlined text-secondary">farsight_digital</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface rounded-3xl border border-outline-variant p-6 space-y-4">
          <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span>
            Hoạt động gần đây
          </h3>
          {reports.slice(0, 5).map((r) => {
            const badge = STATUS_BADGE[r.statusKey] || STATUS_BADGE.submitted
            return (
              <div key={`act-${r.id}`} className="flex items-start gap-3 py-2 border-b border-outline-variant/40 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  r.statusKey === 'done' ? 'bg-green-500' :
                  r.statusKey === 'processing' ? 'bg-orange-500' :
                  r.statusKey === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-on-surface truncate">{r.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {r.location} &middot;{' '}
                    <span className={`font-semibold ${badge.cls.split(' ')[1]}`}>{badge.label}</span>
                  </p>
                </div>
                <span className="text-xs text-on-surface-variant whitespace-nowrap">
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
                    : ''}
                </span>
              </div>
            )
          })}
          {reports.length === 0 && !loading && (
            <p className="text-sm text-on-surface-variant text-center py-4">Chưa có hoạt động nào</p>
          )}
        </div>
      </div>

      {/* ── Dispatch Modal ───────────────────────────────────── */}
      {dispatchReport && (
        <DispatchModal
          report={dispatchReport}
          onClose={() => setDispatchReport(null)}
          onSuccess={handleDispatchSuccess}
        />
      )}
    </div>
  )
}
