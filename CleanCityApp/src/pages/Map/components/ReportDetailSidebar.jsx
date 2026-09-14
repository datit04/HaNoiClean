import { useEffect, useState } from 'react'
import { getReportById, statusToKey, priorityToKey } from '../../../services/reportService'

const STATUS_CONFIG = {
  submitted: { label: 'Chờ tiếp nhận', color: '#ba1a1a', bg: '#ffdad6', icon: 'pending' },
  received: { label: 'Đã tiếp nhận', color: '#5b5f70', bg: '#e2e2ec', icon: 'inbox' },
  processing: { label: 'Đang xử lý', color: '#7c5800', bg: '#ffddb4', icon: 'engineering' },
  inprogress: { label: 'Đang xử lý', color: '#7c5800', bg: '#ffddb4', icon: 'engineering' },
  done: { label: 'Hoàn thành', color: '#206223', bg: '#c3efca', icon: 'check_circle' },
  resolved: { label: 'Hoàn thành', color: '#206223', bg: '#c3efca', icon: 'check_circle' },
  rejected: { label: 'Từ chối', color: '#5b5f70', bg: '#e2e2ec', icon: 'cancel' },
}

const PRIORITY_CONFIG = {
  urgent: { label: 'Khẩn cấp', color: '#ba1a1a' },
  medium: { label: 'Trung bình', color: '#7c5800' },
  low: { label: 'Bình thường', color: '#206223' },
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
    <div className="absolute top-0 right-0 h-full w-80 z-20 flex flex-col bg-surface-container-lowest shadow-2xl border-l border-outline-variant/10 animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 shrink-0">
        <span className="text-sm font-black text-primary font-headline">Chi tiết báo cáo</span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-outline">
            <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
            <p className="text-sm">Đang tải...</p>
          </div>
        )}

        {error && (
          <div className="m-4 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {report && !loading && (
          <div className="space-y-0">
            {/* Image */}
            {report.imageUrl ? (
              <div className="aspect-video w-full overflow-hidden bg-surface-container-highest">
                <img
                  src={report.imageUrl}
                  alt="Ảnh báo cáo"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-outline/40">image_not_supported</span>
              </div>
            )}

            <div className="p-5 space-y-4">
              {/* Status + priority */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: statusCfg.bg, color: statusCfg.color }}
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {statusCfg.icon}
                  </span>
                  {statusCfg.label}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-container"
                  style={{ color: priorityCfg.color }}
                >
                  {priorityCfg.label}
                </span>
              </div>

              {/* Title / description */}
              <div>
                <p className="text-sm font-black text-on-surface leading-snug">
                  {report.description || report.title || 'Báo cáo môi trường'}
                </p>
              </div>

              {/* Meta */}
              <div className="space-y-2.5">
                <MetaRow icon="category" label="Danh mục" value={report.category?.name || report.categoryName || '—'} />
                <MetaRow icon="location_on" label="Phường/Xã" value={report.ward?.name || report.location || '—'} />
                <MetaRow
                  icon="schedule"
                  label="Ngày báo cáo"
                  value={report.createdAt ? new Date(report.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                />
                {report.completedAt && (
                  <MetaRow
                    icon="task_alt"
                    label="Hoàn thành"
                    value={new Date(report.completedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  />
                )}
                {(report.lat || report.latitude) && (
                  <MetaRow
                    icon="pin_drop"
                    label="Tọa độ"
                    value={`${Number(report.lat ?? report.latitude).toFixed(5)}, ${Number(report.lng ?? report.longitude).toFixed(5)}`}
                  />
                )}
              </div>

              {/* After image */}
              {report.imageAfterUrl && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase text-outline tracking-wider">Ảnh sau xử lý</p>
                  <div className="rounded-xl overflow-hidden aspect-video bg-surface-container-highest">
                    <img
                      src={report.imageAfterUrl}
                      alt="Ảnh sau xử lý"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Reporter */}
              {(report.reporter?.fullName || report.reporterName) && (
                <div className="pt-2 border-t border-outline-variant/10">
                  <p className="text-[11px] font-bold uppercase text-outline tracking-wider mb-1.5">Người báo cáo</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-sm text-on-primary-container">person</span>
                    </div>
                    <span className="text-sm font-medium text-on-surface">
                      {report.reporter?.fullName || report.reporterName}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MetaRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="material-symbols-outlined text-base text-outline shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase text-outline tracking-wide">{label}</p>
        <p className="text-sm text-on-surface font-medium break-words">{value}</p>
      </div>
    </div>
  )
}
