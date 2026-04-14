import { useCallback, useEffect, useRef, useState } from 'react'
import {
  assignTeam,
  updateReportStatus,
  ReportStatus,
  getTeams,
} from '../../../services/reportService'

const STATUS_STEPS = [
  { value: ReportStatus.Received, label: 'Tiếp nhận', icon: 'mark_email_read' },
  { value: ReportStatus.InProgress, label: 'Đang xử lý', icon: 'engineering' },
  { value: ReportStatus.Completed, label: 'Hoàn thành', icon: 'check_circle' },
  { value: ReportStatus.Rejected, label: 'Từ chối', icon: 'block', danger: true },
]

function parseApiError(err, fallback = 'Không thể xử lý yêu cầu') {
  const data = err?.response?.data
  if (!data) return err?.message || fallback
  if (typeof data === 'string') return data
  if (typeof data.message === 'string') return data.message
  if (typeof data.title === 'string') return data.title
  if (data.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).flat().filter(Boolean).join(' | ') || fallback
  }
  return fallback
}

export default function DispatchModal({ report, onClose, onSuccess }) {
  const [teams, setTeams] = useState([])
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(ReportStatus.Received)
  const [note, setNote] = useState('')
  const [imageAfterFile, setImageAfterFile] = useState(null)
  const [imageAfterPreview, setImageAfterPreview] = useState(null)
  const imageAfterRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadTeams = useCallback(async () => {
    try {
      const res = await getTeams()
      const data = res.data
      const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
      setTeams(list.filter((t) => t.status === 'active' || t.isActive))
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  // Determine current report status to show appropriate next steps
  const currentStatus = report?.status ?? 0
  const availableSteps = STATUS_STEPS.filter((s) => s.value > currentStatus || s.value === ReportStatus.Rejected)

  useEffect(() => {
    if (availableSteps.length > 0 && !availableSteps.find((s) => s.value === selectedStatus)) {
      setSelectedStatus(availableSteps[0].value)
    }
  }, [availableSteps, selectedStatus])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // 1) Assign team if selected and status is InProgress
      if (selectedTeamId && selectedStatus === ReportStatus.InProgress) {
        await assignTeam(report.id, { teamId: Number(selectedTeamId) })
      }

      // 2) Update report status
      await updateReportStatus(report.id, {
        status: selectedStatus,
        note: note.trim() || undefined,
        imageAfter: imageAfterFile || undefined,
      })

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!report) return null

  const statusLabel = {
    0: 'Đã gửi',
    1: 'Đã tiếp nhận',
    2: 'Đang xử lý',
    3: 'Hoàn thành',
    4: 'Từ chối',
  }

  return (
    <div className="modal-overlay z-[100]">
      <div className="absolute inset-0" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="modal-panel relative bg-surface-container-lowest w-full max-w-2xl rounded-[2rem]"
      >
        {/* Header */}
        <div className="p-8 pb-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight font-headline">
              Điều phối báo cáo
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-on-surface-variant hover:bg-surface-container-highest p-2 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="text-on-surface-variant">
            Giao đội xử lý và cập nhật trạng thái cho báo cáo #{report.id}.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-8">
          {/* Report Summary */}
          <div className="bg-surface-container-low p-6 rounded-2xl flex gap-5">
            {report.imageUrl && (
              <div className="w-24 h-20 rounded-xl overflow-hidden bg-surface-container shrink-0">
                <img src={report.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-1.5">
              <h4 className="font-bold text-on-surface truncate text-lg">{report.title}</h4>
              <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {report.location}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">category</span>
                  {report.categoryName || report.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-outline uppercase tracking-wider">
                  Trạng thái hiện tại:
                </span>
                <span className="text-xs font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">
                  {statusLabel[currentStatus] || 'Đã gửi'}
                </span>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-tertiary px-1">Chuyển trạng thái</label>
            <div className="grid grid-cols-2 gap-3">
              {availableSteps.map((step) => {
                const isSelected = selectedStatus === step.value
                const isDanger = step.danger
                return (
                  <button
                    key={step.value}
                    type="button"
                    onClick={() => setSelectedStatus(step.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                      isSelected
                        ? isDanger
                          ? 'bg-error-container text-on-error-container ring-2 ring-error'
                          : 'bg-primary-fixed text-on-primary-fixed ring-2 ring-primary'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-variant'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={isSelected ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {step.icon}
                    </span>
                    <span className="font-bold text-sm">{step.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Team Assignment — show when InProgress */}
          {selectedStatus === ReportStatus.InProgress && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-tertiary px-1">Giao cho đội</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface"
              >
                <option value="">Chọn đội xử lý...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}{t.field ? ` — ${t.field}` : ''}
                  </option>
                ))}
              </select>
              {teams.length === 0 && (
                <p className="text-xs text-on-surface-variant px-1">
                  Chưa có đội nào đang hoạt động. Hãy tạo đội trong mục Teams.
                </p>
              )}
            </div>
          )}

          {/* Image After — show when completing */}
          {selectedStatus === ReportStatus.Completed && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-tertiary px-1">Ảnh sau xử lý</label>
              {imageAfterPreview ? (
                <div className="relative w-40 h-32 rounded-xl overflow-hidden">
                  <img src={imageAfterPreview} alt="After" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageAfterFile(null); setImageAfterPreview(null); if (imageAfterRef.current) imageAfterRef.current.value = '' }}
                    className="absolute top-1.5 right-1.5 bg-error text-on-error p-1 rounded-full shadow hover:opacity-90"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => imageAfterRef.current?.click()}
                  className="w-40 h-32 rounded-xl bg-surface-container-low border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all"
                >
                  <span className="material-symbols-outlined text-2xl text-primary/40">cloud_upload</span>
                  <p className="text-xs text-on-surface-variant mt-1">Tải ảnh sau xử lý</p>
                </div>
              )}
              <input
                ref={imageAfterRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setImageAfterFile(file)
                  const reader = new FileReader()
                  reader.onload = (ev) => setImageAfterPreview(ev.target?.result)
                  reader.readAsDataURL(file)
                }}
              />
            </div>
          )}

          {/* Note */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-tertiary px-1">Ghi chú xử lý</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline-variant"
              placeholder="Ghi chú cho đội xử lý hoặc lý do từ chối..."
              rows={3}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-error-container text-on-error-container px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-outline-variant/10 bg-surface-container-lowest flex gap-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-xl font-bold text-primary hover:bg-surface-container-low transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting || (selectedStatus === ReportStatus.InProgress && !selectedTeamId)}
            className="btn-primary px-8 py-3 shadow-primary/20 hover:scale-[1.02]"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận điều phối'}
          </button>
        </div>
      </form>
    </div>
  )
}
