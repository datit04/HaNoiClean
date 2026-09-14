import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import CommentSection from './CommentSection'

const STATUS_COLOR = {
  submitted:  'bg-surface-container-highest text-on-surface-variant',
  received:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  processing: 'bg-secondary-container text-on-secondary-container',
  completed:  'bg-primary-container text-on-primary-container',
  rejected:   'bg-error-container text-on-error-container',
}
const STATUS_I18N = { 0: 'submitted', 1: 'received', 2: 'processing', 3: 'completed', 4: 'rejected' }

function timeAgo(dateStr, lang) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (lang === 'vi') {
    if (mins < 1) return 'Vừa xong'
    if (mins < 60) return `${mins} phút trước`
    const h = Math.floor(mins / 60)
    if (h < 24) return `${h} giờ trước`
    const d = Math.floor(h / 24)
    return d < 30 ? `${d} ngày trước` : new Date(dateStr).toLocaleDateString('vi-VN')
  }
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return d < 30 ? `${d}d` : new Date(dateStr).toLocaleDateString('en-US')
}

function PostAvatar({ name }) {
  const letter = (name || '?')[0].toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full bg-[#206223] text-white flex items-center justify-center font-black text-sm flex-shrink-0 select-none uppercase">
      {letter}
    </div>
  )
}

export default function ReportCard({ report }) {
  const { t, i18n } = useTranslation()
  const [showComments, setShowComments] = useState(false)

  const statusKey = STATUS_I18N[report.status] ?? 'submitted'
  const colorClass = STATUS_COLOR[statusKey] ?? STATUS_COLOR.submitted

  const authorName =
    report.submittedByName ||
    report.submittedBy?.fullName ||
    report.submittedBy?.userName ||
    report.userName ||
    report.fullName ||
    'Người dùng'

  const time = timeAgo(report.createdAt, i18n.language)

  return (
    <article className="bg-white dark:bg-[#242526] rounded-none sm:rounded-2xl shadow-sm overflow-hidden">
      {/* ── Post header ── */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        <PostAvatar name={authorName} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[15px] text-on-surface leading-tight truncate">{authorName}</p>
          <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1 flex-wrap">
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">location_on</span>
              {report.location}
            </span>
            <span>·</span>
            <span>{report.categoryName}</span>
            {time && (
              <>
                <span>·</span>
                <span>{time}</span>
              </>
            )}
          </p>
        </div>
        <span className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${colorClass}`}>
          {t(`report_status.${statusKey}`)}
        </span>
      </div>

      {/* ── Description ── */}
      {report.description && (
        <p className="px-4 pb-3 text-[15px] text-on-surface leading-relaxed">
          {report.description}
        </p>
      )}

      {/* ── Image ── */}
      {report.imageUrl && (
        <img
          src={report.imageUrl}
          alt=""
          loading="lazy"
          className="w-full object-cover max-h-[32rem]"
        />
      )}

      {/* ── Action bar ── */}
      <div className="border-t border-black/5 dark:border-white/5 mx-4" />
      <div className="px-2 py-1">
        <button
          onClick={() => setShowComments((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-sm font-semibold text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">
            {showComments ? 'expand_less' : 'chat_bubble_outline'}
          </span>
          {showComments ? t('community.hide_comments') : t('community.view_comments')}
        </button>
      </div>

      {/* ── Comments ── */}
      {showComments && (
        <>
          <div className="border-t border-black/5 dark:border-white/5" />
          <CommentSection reportId={report.id} />
        </>
      )}
    </article>
  )
}
