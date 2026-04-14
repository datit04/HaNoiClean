import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getCategories,
} from '../../../services/reportService'
import { swalConfirm } from '../../../utils/swal'

const DEFAULT_FORM = {
  id: null,
  name: '',
  field: '',
  leaderName: '',
  description: '',
  memberCount: 0,
  status: 'active',
}

const PAGE_SIZE = 4

const FIELD_OPTIONS = [
  'Hạ tầng Giao thông',
  'Chiếu sáng Công cộng',
  'Cây xanh & Công viên',
  'Vệ sinh Môi trường',
  'Cấp thoát nước',
  'Tình nguyện',
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang làm việc' },
  { value: 'standby', label: 'Sẵn sàng' },
  { value: 'off', label: 'Nghỉ' },
]

const STATUS_STYLE = {
  active: {
    bg: 'bg-primary-fixed',
    text: 'text-on-primary-fixed',
    dot: 'bg-primary',
    label: 'Đang làm việc',
  },
  standby: {
    bg: 'bg-secondary-fixed',
    text: 'text-on-secondary-fixed',
    dot: 'bg-secondary',
    label: 'Sẵn sàng',
  },
  off: {
    bg: 'bg-surface-dim',
    text: 'text-on-surface-variant',
    dot: 'bg-outline',
    label: 'Nghỉ',
  },
}

function parseApiError(err, fallback = 'Không thể xử lý yêu cầu') {
  const data = err?.response?.data
  if (!data) return err?.message || fallback
  if (typeof data === 'string') return data
  if (typeof data.message === 'string') return data.message
  if (typeof data.title === 'string') return data.title
  if (data.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).flat().filter(Boolean)
    if (messages.length > 0) return messages.join(' | ')
  }
  return fallback
}

function getInitials(name) {
  if (!name) return '??'
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase()
}

export default function TeamManager() {
  const [teams, setTeams] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(DEFAULT_FORM)
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)

  const loadTeams = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getTeams()
      const data = res.data
      setTeams(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      setError(parseApiError(err, 'Không thể tải danh sách đội'))
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCategories = useCallback(async () => {
    try {
      const res = await getCategories()
      setCategories(Array.isArray(res.data) ? res.data : [])
    } catch {
      // ignore – categories are optional for the field dropdown
    }
  }, [])

  useEffect(() => {
    loadTeams()
    loadCategories()
  }, [loadTeams, loadCategories])

  const filteredTeams = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return teams
    return teams.filter((t) =>
      [t.name, t.field, t.leaderName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(keyword))
    )
  }, [teams, search])

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const activeCount = teams.filter((t) => t.status === 'active').length
  const volunteerCount = teams.filter(
    (t) => t.field?.toLowerCase().includes('tình nguyện') || t.field?.toLowerCase().includes('volunteer')
  ).length

  const isEditing = form.id !== null

  const resetForm = () => {
    setForm(DEFAULT_FORM)
    setError('')
  }

  const openCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const openEdit = (team) => {
    setForm({
      id: team.id,
      name: team.name || '',
      field: team.field || '',
      leaderName: team.leaderName || '',
      description: team.description || '',
      memberCount: team.memberCount ?? 0,
      status: team.status || 'active',
    })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Vui lòng nhập tên đội')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        field: form.field.trim(),
        leaderName: form.leaderName.trim(),
        description: form.description.trim(),
        memberCount: Number(form.memberCount) || 0,
        status: form.status,
      }

      if (isEditing) {
        await updateTeam(form.id, payload)
        setTeams((prev) =>
          prev.map((t) => (t.id === form.id ? { ...t, ...payload } : t))
        )
      } else {
        const res = await createTeam(payload)
        const created = res?.data
        if (created) {
          setTeams((prev) => [...prev, created])
        } else {
          await loadTeams()
        }
      }
      closeModal()
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (team) => {
    const confirmed = await swalConfirm(`Xóa đội "${team.name}"?`)
    if (!confirmed) return

    setSubmitting(true)
    setError('')
    try {
      await deleteTeam(team.id)
      setTeams((prev) => prev.filter((t) => t.id !== team.id))
    } catch (err) {
      setError(parseApiError(err, 'Không thể xóa đội'))
    } finally {
      setSubmitting(false)
    }
  }

  const fieldStyle = (field) => {
    const f = (field || '').toLowerCase()
    if (f.includes('tình nguyện') || f.includes('volunteer'))
      return 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
    if (f.includes('điện') || f.includes('electric'))
      return 'bg-secondary-fixed text-on-secondary-fixed'
    return 'bg-surface-container-low text-primary'
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
            Quản lý Đội ngũ
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Quản lý các đội ngũ công nhân, tình nguyện viên và cán bộ xử lý sự cố đô thị tại Hà Nội.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center gap-2 px-6 py-3 hover:scale-95 active:opacity-80"
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span>+ Thêm đội mới</span>
        </button>
      </div>

      {/* Metric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-5 transition-all hover:bg-surface-container-low group">
          <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center text-on-primary-fixed group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              groups
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm uppercase tracking-wider">Tổng số đội</p>
            <p className="text-3xl font-headline font-extrabold text-primary">
              {String(teams.length).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-5 transition-all hover:bg-surface-container-low group">
          <div className="w-14 h-14 bg-secondary-fixed rounded-xl flex items-center justify-center text-on-secondary-fixed group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm uppercase tracking-wider">Đang hoạt động</p>
            <p className="text-3xl font-headline font-extrabold text-secondary">
              {String(activeCount).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-5 transition-all hover:bg-surface-container-low group">
          <div className="w-14 h-14 bg-tertiary-fixed rounded-xl flex items-center justify-center text-on-tertiary-fixed group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              volunteer_activism
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm uppercase tracking-wider">Đội tình nguyện</p>
            <p className="text-3xl font-headline font-extrabold text-tertiary">
              {String(volunteerCount).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && !showModal && (
        <div className="rounded-xl bg-error-container text-on-error-container px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Data Table */}
      <div className="bg-surface-container-highest rounded-3xl overflow-hidden">
        {/* Table Header */}
        <div className="px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container-high">
          <h3 className="font-headline font-bold text-xl text-on-surface">Danh sách đội ngũ</h3>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2 bg-surface-container-lowest rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-outline text-sm">search</span>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Tìm kiếm đội..."
                className="bg-transparent border-none focus:ring-0 text-sm w-40 lg:w-56 placeholder:text-outline-variant/60"
              />
            </div>
            <button
              onClick={loadTeams}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">refresh</span> Tải lại
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50">
                <th className="px-8 py-4 font-headline text-on-surface-variant font-semibold text-sm uppercase tracking-wider">
                  ID Đội
                </th>
                <th className="px-8 py-4 font-headline text-on-surface-variant font-semibold text-sm uppercase tracking-wider">
                  Tên Đội
                </th>
                <th className="px-8 py-4 font-headline text-on-surface-variant font-semibold text-sm uppercase tracking-wider">
                  Lĩnh vực
                </th>
                <th className="px-8 py-4 font-headline text-on-surface-variant font-semibold text-sm uppercase tracking-wider">
                  Trưởng nhóm
                </th>
                <th className="px-8 py-4 font-headline text-on-surface-variant font-semibold text-sm uppercase tracking-wider text-center">
                  Số thành viên
                </th>
                <th className="px-8 py-4 font-headline text-on-surface-variant font-semibold text-sm uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-8 py-4 font-headline text-on-surface-variant font-semibold text-sm uppercase tracking-wider text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-on-surface-variant">
                    Đang tải danh sách đội...
                  </td>
                </tr>
              ) : paginatedTeams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-on-surface-variant">
                    Chưa có đội ngũ nào.
                  </td>
                </tr>
              ) : (
                paginatedTeams.map((team, idx) => {
                  const style = STATUS_STYLE[team.status] || STATUS_STYLE.off
                  return (
                    <tr key={team.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-8 py-6 font-mono text-xs text-outline">
                        TEAM-{String((currentPage - 1) * PAGE_SIZE + idx + 1).padStart(3, '0')}
                      </td>
                      <td className="px-8 py-6 font-bold text-on-surface">{team.name}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${fieldStyle(team.field)}`}>
                          {team.field || 'Chưa phân loại'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border-2 border-primary-fixed">
                            {getInitials(team.leaderName)}
                          </div>
                          <span className="text-sm font-medium">{team.leaderName || '—'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center font-bold">
                        {String(team.memberCount ?? 0).padStart(2, '0')}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(team)}
                            className="material-symbols-outlined p-2 text-outline hover:text-primary hover:bg-primary-fixed/20 rounded-lg transition-all"
                          >
                            edit
                          </button>
                          <button
                            onClick={() => handleDelete(team)}
                            disabled={submitting}
                            className="material-symbols-outlined p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-lg transition-all disabled:opacity-50"
                          >
                            delete
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

        {/* Pagination */}
        <div className="px-8 py-6 flex items-center justify-between border-t border-outline-variant/10">
          <span className="text-sm text-on-surface-variant">
            Hiển thị {paginatedTeams.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-
            {(currentPage - 1) * PAGE_SIZE + paginatedTeams.length} trên tổng số {filteredTeams.length} đội
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-outline hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold ${
                  p === currentPage
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-outline hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay z-[100]">
          <form
            onSubmit={handleSubmit}
            className="modal-panel w-full max-w-2xl"
          >
            {/* Modal Header */}
            <div className="p-8 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-headline font-extrabold text-primary tracking-tight">
                    {isEditing ? 'Cập nhật đội' : 'Thêm đội mới'}
                  </h2>
                  <p className="text-on-surface-variant mt-1">
                    {isEditing
                      ? 'Chỉnh sửa thông tin đội ngũ trong hệ thống.'
                      : 'Tạo một đội ngũ mới cho hệ thống Hanoi CleanCity.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-3xl">close</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-bold text-tertiary px-1">Tên đội ngũ</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline-variant"
                    placeholder="Ví dụ: Đội Phản ứng Nhanh Quận 1"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-tertiary px-1">Lĩnh vực</label>
                  <select
                    value={form.field}
                    onChange={(e) => updateField('field', e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface"
                  >
                    <option value="">Chọn lĩnh vực...</option>
                    {FIELD_OPTIONS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-tertiary px-1">Trưởng nhóm</label>
                  <input
                    value={form.leaderName}
                    onChange={(e) => updateField('leaderName', e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline-variant"
                    placeholder="Nhập tên trưởng nhóm..."
                  />
                </div>
              </div>

              {/* Mission Description */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-tertiary px-1">Mô tả nhiệm vụ</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline-variant"
                  placeholder="Mô tả phạm vi hoạt động và trách nhiệm chính của đội ngũ..."
                  rows={3}
                />
              </div>

              {/* Members Section */}
              <div className="bg-surface-container-low p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-on-surface">Thành viên ban đầu</h3>
                    <p className="text-xs text-on-surface-variant">Thiết lập số lượng nhân sự dự kiến.</p>
                  </div>
                  <div className="flex items-center gap-4 bg-surface-container-lowest px-4 py-2 rounded-xl">
                    <button
                      type="button"
                      onClick={() => updateField('memberCount', Math.max(0, (Number(form.memberCount) || 0) - 1))}
                      className="text-primary hover:bg-primary/10 p-1 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="font-bold text-lg min-w-[2ch] text-center">
                      {String(Number(form.memberCount) || 0).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateField('memberCount', (Number(form.memberCount) || 0) + 1)}
                      className="text-primary hover:bg-primary/10 p-1 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
                {(Number(form.memberCount) || 0) > 0 && (
                  <div className="flex -space-x-3 overflow-hidden">
                    {Array.from({ length: Math.min(Number(form.memberCount) || 0, 4) }, (_, i) => (
                      <div
                        key={i}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest text-xs font-bold ring-4 ring-surface-container-low text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-base">person</span>
                      </div>
                    ))}
                    {(Number(form.memberCount) || 0) > 4 && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest text-xs font-bold ring-4 ring-surface-container-low">
                        +{(Number(form.memberCount) || 0) - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-bold text-on-surface">Kích hoạt ngay</p>
                  <p className="text-sm text-on-surface-variant">
                    Cho phép đội ngũ nhận báo cáo sự cố lập tức sau khi tạo.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.status === 'active'}
                    onChange={(e) => updateField('status', e.target.checked ? 'active' : 'off')}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Error */}
              {error && showModal && (
                <div className="rounded-xl bg-error-container text-on-error-container px-4 py-3 text-sm font-medium">
                  {error}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-outline-variant/10 bg-surface-container-lowest flex gap-4 justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-8 py-3 rounded-xl font-bold text-primary hover:bg-surface-container-low transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary px-8 py-3 shadow-primary/20 hover:scale-[1.02]"
              >
                {submitting ? 'Đang xử lý...' : isEditing ? 'Lưu thay đổi' : 'Lưu đội ngũ'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
