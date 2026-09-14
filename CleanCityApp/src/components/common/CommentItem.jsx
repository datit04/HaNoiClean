import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import CommentForm from './CommentForm'
import { swalSuccess, swalError, swalConfirm } from '../../utils/swal'

// Badge màu theo role
const ROLE_CONFIG = {
  Citizen:  { label: 'Người dân', bg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  Staff:    { label: 'Cán bộ',    bg: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  Team:     { label: 'Đội xử lý', bg: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  Admin:    { label: 'Quản trị',  bg: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  if (diffH < 24) return `${diffH} giờ trước`
  if (diffD < 7) return `${diffD} ngày trước`
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function AuthorAvatar({ author }) {
  const cfg = ROLE_CONFIG[author?.role] ?? ROLE_CONFIG.Citizen
  const initials = (author?.fullName || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase()
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${cfg.bg}`}>
      {initials}
    </div>
  )
}

/**
 * CommentItem — hiển thị 1 comment
 * Props:
 *   comment: ReportCommentVm
 *   onEdit(commentId, content, imageFile)
 *   onDelete(commentId)
 *   submitting: bool
 */
export default function CommentItem({ comment, onEdit, onDelete, submitting }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [editMode, setEditMode] = useState(false)

  const cfg = ROLE_CONFIG[comment.author?.role] ?? ROLE_CONFIG.Citizen
  const isOwn = user && (user.id === comment.author?.id || user.userName === comment.author?.id)

  const handleEdit = async (content, imageFile) => {
    const res = await onEdit(comment.id, content, imageFile)
    if (res?.ok) {
      swalSuccess(t('comments.edit_success'))
      setEditMode(false)
    } else {
      swalError(res?.message || t('common.error'))
    }
  }

  const handleDelete = async () => {
    const confirmed = await swalConfirm(t('comments.confirm_delete'))
    if (!confirmed) return
    const res = await onDelete(comment.id)
    if (res?.ok) swalSuccess(t('comments.delete_success'))
    else swalError(res?.message || t('common.error'))
  }

  return (
    <div className="flex gap-3 group">
      <AuthorAvatar author={comment.author} />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-on-surface truncate">
            {comment.author?.fullName || 'Người dùng'}
          </span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          <span className="text-[11px] text-outline ml-auto shrink-0">
            {formatTime(comment.createdAt)}
            {comment.updatedAt && (
              <span className="ml-1 italic opacity-70">(đã sửa)</span>
            )}
          </span>
        </div>

        {/* Content */}
        {editMode ? (
          <div className="mt-2">
            <CommentForm
              initialValue={comment.content}
              onSubmit={handleEdit}
              submitting={submitting}
              onCancel={() => setEditMode(false)}
              compact
            />
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-on-surface leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>
            {comment.imageUrl && (
              <a href={comment.imageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={comment.imageUrl}
                  alt="ảnh đính kèm"
                  className="mt-2 rounded-xl max-h-48 object-cover border border-outline-variant/20 hover:opacity-90 transition"
                />
              </a>
            )}
          </>
        )}

        {/* Actions */}
        {isOwn && !editMode && (
          <div className="flex gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditMode(true)}
              className="text-[11px] text-outline hover:text-primary font-medium transition"
            >
              {t('comments.edit')}
            </button>
            <button
              onClick={handleDelete}
              className="text-[11px] text-outline hover:text-error font-medium transition"
            >
              {t('comments.delete')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
