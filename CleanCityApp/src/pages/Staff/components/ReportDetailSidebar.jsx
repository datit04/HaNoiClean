import { useEffect, useState } from 'react'
import { getReportById, statusToKey, priorityToKey } from '../../../services/reportService'

const STATUS_CONFIG = {
  submitted: { label: 'Chờ tiếp nhận', color: '#a855f7', bg: '#f5dbff', icon: 'pending' },
  received: { label: 'Đã tiếp nhận', color: '#fb923c', bg: '#fff7ed', icon: 'inbox' },
  processing: { label: 'Đang xử lý', color: '#fb923c', bg: '#fff7ed', icon: 'engineering' },
  inprogress: { label: 'Đang xử lý', color: '#fb923c', bg: '#fff7ed', icon: 'engineering' },
  done: { label: 'Hoàn thành', color: '#16a34a', bg: '#dcfce7', icon: 'check_circle' },
  resolved: { label: 'Hoàn thành', color: '#16a34a', bg: '#dcfce7', icon: 'check_circle' },
  rejected: { label: 'Từ chối', color: '#ef4444', bg: '#fee2e2', icon: 'cancel' },
}

const PRIORITY_CONFIG = {
  urgent: { label: 'Khẩn cấp', color: '#b91c1c' },
  medium: { label: 'Trung bình', color: '#d97706' },
  low: { label: 'Bình thường', color: '#15803d' },
}

export default function ReportDetailSidebar({ reportId, onClose }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!reportId) return
    setLoading(true)
    setError('')
    setReport(null)
    getReportById(reportId)
      .then((res) => {
        const raw = res.data
        setReport({
          ...raw,
          statusKey: statusToKey(raw.status),
          priorityKey: priorityToKey(raw.priority),
        })
      })
      .catch(() => setError('Không thể tải thông tin báo cáo'))
      .finally(() => setLoading(false))
  }, [reportId])

  const statusCfg = STATUS_CONFIG[report?.statusKey] ?? STATUS_CONFIG.submitted
  const priorityCfg = PRIORITY_CONFIG[report?.priorityKey] ?? PRIORITY_CONFIG.medium

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-on-surface/30 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[2rem] border border-outline-variant/10 bg-surface shadow-2xl">
        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/10 bg-surface-container-highest rounded-t-[2rem]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant font-semibold">Chi tiết báo cáo</p>
            <h2 className="text-xl font-black text-on-surface mt-1">Thông tin đầy đủ</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center h-56 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
              <p className="text-sm">Đang tải báo cáo...</p>
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">
              {error}
            </div>
          )}

          {report && !loading && (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
                <div className="rounded-3xl border border-outline-variant/20 bg-surface-container p-5 shadow-sm">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant font-semibold">Mã thẻ</p>
                          <p className="text-sm font-semibold text-on-surface">#{report.id}</p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-container px-3 py-2">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-base">report</span>
                          </span>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">Trạng thái</p>
                            <p className="text-sm font-semibold text-on-surface">{statusCfg.label}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-on-surface">{report.description || report.title || 'Báo cáo môi trường'}</h3>
                        <p className="text-sm text-on-surface-variant">{report.category?.name || report.categoryName || 'Chưa phân loại'}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoRow icon="location_on" label="Khu vực" value={report.ward?.name || report.location || '—'} />
                      <InfoRow icon="schedule" label="Ngày báo cáo" value={report.createdAt ? formatDate(report.createdAt) : '—'} />
                      {report.completedAt && <InfoRow icon="task_alt" label="Hoàn thành" value={formatDate(report.completedAt)} />}
                      <InfoRow icon="priority_high" label="Mức độ ưu tiên" value={priorityCfg.label} valueClassName="font-semibold" />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-outline-variant/20 bg-surface-container overflow-hidden shadow-sm">
                  {report.imageUrl ? (
                    <img src={report.imageUrl} alt="Ảnh báo cáo" className="h-64 w-full object-cover" />
                  ) : (
                    <div className="h-64 w-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6 rounded-3xl border border-outline-variant/20 bg-surface-container p-5 shadow-sm">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant font-semibold">Miêu tả chi tiết</p>
                    <div className="rounded-3xl border border-outline-variant/20 bg-surface px-4 py-4 text-sm leading-6 text-on-surface">
                      {report.description || 'Không có mô tả chi tiết.'}
                    </div>
                  </div>

                  {(report.reporter?.fullName || report.reporterName) && (
                    <div className="rounded-3xl border border-outline-variant/20 bg-surface p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant font-semibold mb-3">Người báo cáo</p>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{report.reporter?.fullName || report.reporterName}</p>
                          {report.reporter?.phoneNumber && (
                            <p className="text-xs text-on-surface-variant mt-1">{report.reporter.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6 rounded-3xl border border-outline-variant/20 bg-surface-container p-5 shadow-sm">
                  <InfoRow icon="pin_drop" label="Tọa độ" value={(report.lat || report.latitude) ? `${Number(report.lat ?? report.latitude).toFixed(5)}, ${Number(report.lng ?? report.longitude).toFixed(5)}` : '—'} />
                  {report.completedAt && <InfoRow icon="task_alt" label="Thời gian hoàn thành" value={formatDate(report.completedAt)} />}
                  <div className="rounded-3xl bg-surface px-4 py-4 text-sm text-on-surface-variant">
                    <p className="text-xs uppercase tracking-[0.24em] font-semibold text-on-surface-variant">Ghi chú thêm</p>
                    <p className="mt-2 text-sm text-on-surface">{report.note || report.additionalInfo || 'Không có thông tin thêm.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDate(value) {
  const date = new Date(value)
  return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function InfoRow({ icon, label, value, valueClassName = '' }) {
  return (
    <div className="flex items-start gap-3">
      <span className="material-symbols-outlined text-lg text-primary shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant font-semibold mb-1">{label}</p>
        <p className={`text-sm text-on-surface ${valueClassName}`}>{value}</p>
      </div>
    </div>
  )
}
