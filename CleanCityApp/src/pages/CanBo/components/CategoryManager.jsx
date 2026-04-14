import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../../../services/reportService'
import { swalConfirm } from '../../../utils/swal'

const DEFAULT_FORM = {
  id: null,
  name: '',
  icon: 'category',
  color: '#206223',
  isActive: true,
}

const PAGE_SIZE = 4

const ICON_OPTIONS = [
  'recycling', 'warning', 'architecture', 'delete',
  'water_drop', 'eco', 'construction', 'streetview',
  'lightbulb', 'local_fire_department', 'pest_control', 'category',
]

const COLOR_OPTIONS = [
  '#206223', '#00639a', '#ba1a1a',
  '#6b4f45', '#FF9800', '#7B1FA2',
]

function parseApiError(err, fallback = 'Không thể xử lý danh mục') {
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

export default function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(DEFAULT_FORM)
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getCategories()
      setCategories(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setError(parseApiError(err, 'Không thể tải danh mục'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return categories
    return categories.filter((category) =>
      [category.name, category.icon, category.color]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    )
  }, [categories, search])

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const activeCount = categories.filter((c) => c.isActive).length
  const hotCategory = useMemo(() => {
    if (categories.length === 0) return '—'
    return categories[0]?.name || '—'
  }, [categories])

  const isEditing = form.id !== null

  const resetForm = () => {
    setForm(DEFAULT_FORM)
    setError('')
  }

  const openCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const openEdit = (category) => {
    setForm({
      id: category.id,
      name: category.name || '',
      icon: category.icon || 'category',
      color: category.color || '#206223',
      isActive: Boolean(category.isActive ?? true),
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
      setError('Vui lòng nhập tên danh mục')
      return
    }

    setSubmitting(true)
    try {
      if (isEditing) {
        await updateCategory(form.id, form)
        setCategories((prev) =>
          prev.map((c) => (c.id === form.id ? { ...c, ...form } : c))
        )
      } else {
        const res = await createCategory(form)
        const created = res?.data
        if (created) {
          setCategories((prev) => [...prev, created])
        } else {
          await loadCategories()
        }
      }
      closeModal()
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (category) => {
    setSubmitting(true)
    setError('')
    try {
      await updateCategory(category.id, { ...category, isActive: !category.isActive })
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, isActive: !category.isActive } : c))
      )
    } catch (err) {
      setError(parseApiError(err, 'Không thể cập nhật trạng thái'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (category) => {
    const confirmed = await swalConfirm(`Xóa danh mục "${category.name}"?`)
    if (!confirmed) return

    setSubmitting(true)
    setError('')
    try {
      await deleteCategory(category.id)
      await loadCategories()
    } catch (err) {
      setError(parseApiError(err, 'Không thể xóa danh mục'))
    } finally {
      setSubmitting(false)
    }
  }

  const activePercent = categories.length > 0
    ? Math.round((activeCount / categories.length) * 100)
    : 0

  return (
    <section className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">
            Quản lý Danh mục
          </h1>
          <p className="text-on-surface-variant max-w-lg">
            Cấu hình và phân loại các vấn đề đô thị để tối ưu hóa quy trình tiếp nhận và xử lý phản ánh.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-surface-container-low rounded-xl px-4 py-2 flex items-center gap-2 border border-outline-variant/10 shadow-sm focus-within:ring-2 ring-primary/20 transition-all">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="bg-transparent border-none focus:ring-0 text-sm w-48 lg:w-64 placeholder:text-on-surface-variant/50"
              placeholder="Tìm kiếm danh mục..."
              type="text"
            />
          </div>
          <button
            onClick={openCreate}
            className="bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Thêm danh mục mới
          </button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-sm flex flex-col justify-between h-32">
          <span className="text-sm font-semibold text-on-surface-variant">Tổng số danh mục</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-headline">{categories.length}</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-sm flex flex-col justify-between h-32">
          <span className="text-sm font-semibold text-on-surface-variant">Đang hoạt động</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-headline">{activeCount}</span>
            <span className="text-xs text-secondary font-bold">{activePercent}% tổng số</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-sm flex flex-col justify-between h-32">
          <span className="text-sm font-semibold text-on-surface-variant">Không hoạt động</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-headline">{categories.length - activeCount}</span>
            <span className="text-xs text-tertiary font-bold">Đã vô hiệu hóa</span>
          </div>
        </div>
        <div className="bg-surface-container-highest p-6 rounded-2xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-sm font-semibold text-primary">Danh mục đầu tiên</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-headline truncate">{hotCategory}</span>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[8rem] text-primary/5 select-none">
            auto_graph
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && !showModal && (
        <div className="rounded-xl bg-error-container text-on-error-container px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Categories Data Table */}
      <div className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_32px_rgba(23,29,20,0.04)] overflow-hidden border border-outline-variant/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">Mã ID</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">Tên Danh Mục</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">Icon &amp; Màu sắc</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 text-center">Trạng thái</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant">
                    Đang tải danh mục...
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant">
                    Chưa có danh mục phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category, idx) => (
                  <tr key={category.id} className="group hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-8 py-6 text-sm font-medium text-on-surface-variant">
                      #{String((currentPage - 1) * PAGE_SIZE + idx + 1).padStart(3, '0')}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-on-surface">{category.name}</span>
                        <span className="text-xs text-on-surface-variant/60">{category.icon || 'category'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: (category.color || '#206223') + '15' }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ color: category.color || '#206223' }}
                          >
                            {category.icon || 'category'}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-medium text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">
                          {category.color || '#206223'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {category.isActive ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-fixed text-on-primary-fixed">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline mr-2" />
                          Vô hiệu
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="p-2 hover:bg-surface-container-high rounded-lg text-secondary transition-colors"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleActive(category)}
                          disabled={submitting}
                          className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors disabled:opacity-50"
                          title={category.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          <span className="material-symbols-outlined">
                            {category.isActive ? 'block' : 'check_circle'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          disabled={submitting}
                          className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors disabled:opacity-50"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-5 bg-surface-container-low/50 flex items-center justify-between border-t border-outline-variant/10">
          <span className="text-xs font-medium text-on-surface-variant">
            Hiển thị {paginatedCategories.length} trên tổng số {filteredCategories.length} danh mục
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant disabled:text-on-surface-variant/30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  p === currentPage
                    ? 'bg-primary text-on-primary'
                    : 'hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant disabled:text-on-surface-variant/30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-primary h-64 p-8 flex flex-col justify-center text-on-primary">
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-bold font-headline">Tối ưu hóa quy trình phân loại</h3>
            <p className="max-w-md opacity-90 text-sm leading-relaxed">
              Sử dụng hệ thống màu sắc tương phản cao cho các danh mục nguy cấp để đội ngũ hiện trường có thể nhận diện nhanh chóng trên bản đồ điều hành.
            </p>
          </div>
          <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-[15rem] opacity-10 rotate-12 select-none">
            settings_suggest
          </span>
        </div>
        <div className="bg-surface-container-high rounded-3xl p-8 flex flex-col gap-6">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-secondary-container">lightbulb</span>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-on-surface">Mẹo nhỏ</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Bạn có thể thay đổi icon và màu sắc của mỗi danh mục bằng cách nhấn vào nút chỉnh sửa trên từng hàng trong bảng.
            </p>
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
                    {isEditing ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
                  </h2>
                  <p className="text-on-surface-variant mt-1">
                    {isEditing
                      ? 'Chỉnh sửa thông tin danh mục trong hệ thống Hanoi CleanCity.'
                      : 'Tạo một danh mục báo cáo mới cho hệ thống Hanoi CleanCity.'}
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

            {/* Modal Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-8">
              {/* Section 1: Name */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-on-surface-variant tracking-wider uppercase">
                  Tên danh mục
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-lg font-medium text-on-surface placeholder:text-outline-variant/60 transition-all"
                  placeholder="Ví dụ: Rác thải nguy hại"
                  type="text"
                />
              </div>

              {/* Section 2: Icon & Color Picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Icon Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-on-surface-variant tracking-wider uppercase">
                    Biểu tượng
                  </label>
                  <div className="grid grid-cols-4 gap-3 p-4 bg-surface-container-low rounded-xl">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => updateField('icon', icon)}
                        className={`aspect-square flex items-center justify-center rounded-lg transition-all active:scale-95 ${
                          form.icon === icon
                            ? 'bg-primary text-on-primary shadow-lg'
                            : 'text-primary hover:bg-surface-variant'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={form.icon === icon ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          {icon}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-on-surface-variant tracking-wider uppercase">
                    Màu sắc chủ đạo
                  </label>
                  <div className="grid grid-cols-3 gap-3 p-4 bg-surface-container-low rounded-xl h-full content-start">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateField('color', color)}
                        className={`h-10 rounded-full hover:scale-105 transition-transform ${
                          form.color === color
                            ? 'border-4 border-white shadow-sm ring-2 ring-primary'
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Status Toggle */}
              <div className="flex items-center justify-between p-6 bg-surface-container-low rounded-xl">
                <div>
                  <span className="block font-bold text-on-surface">Trạng thái hoạt động</span>
                  <span className="text-sm text-on-surface-variant">
                    Cho phép người dân gửi báo cáo thuộc danh mục này ngay lập tức.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => updateField('isActive', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary" />
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
            <div className="p-8 bg-surface-container-low border-t border-outline-variant/10 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-8 py-3 text-primary font-bold hover:bg-surface-variant rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary px-10 py-3 hover:shadow-primary/20 hover:scale-[1.02]"
              >
                {submitting ? 'Đang xử lý...' : isEditing ? 'Lưu thay đổi' : 'Lưu danh mục'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}