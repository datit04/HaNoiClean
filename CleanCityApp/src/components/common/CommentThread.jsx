import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useComments } from '../../hooks/useComments'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
import { swalSuccess, swalError } from '../../utils/swal'

/**
 * CommentThread — luồng bình luận của 1 báo cáo
 * Props:
 *   reportId: number | string
 *   compact?: bool  (chiều cao bị giới hạn, dùng trong sidebar)
 */
export default function CommentThread({ reportId, compact = false }) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const {
    comments,
    loading,
    error,
    submitting,
    addComment,
    editComment,
    removeComment,
  } = useComments(reportId)

  const bottomRef = useRef()

  // Cuộn xuống cuối khi có comment mới
  useEffect(() => {
    if (comments.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [comments.length])

  const handleAdd = async (content, imageFile) => {
    const res = await addComment(content, imageFile)
    if (res?.ok) {
      swalSuccess(t('comments.send_success'))
    } else {
      swalError(res?.message || t('common.error'))
    }
  }

  return (
    <div className={`flex flex-col ${compact ? 'h-full' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-base text-primary">chat</span>
        <h4 className="text-sm font-bold text-on-surface">
          {t('comments.title')}
          {comments.length > 0 && (
            <span className="ml-2 text-xs font-semibold text-outline">({comments.length})</span>
          )}
        </h4>
      </div>

      {/* List */}
      <div className={`flex-1 space-y-4 ${compact ? 'overflow-y-auto custom-scrollbar pr-1 min-h-0' : ''}`}>
        {loading && (
          <div className="flex justify-center py-6">
            <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          </div>
        )}

        {!loading && error && (
          <p className="text-xs text-error text-center py-4">{t('comments.load_error')}</p>
        )}

        {!loading && !error && comments.length === 0 && (
          <div className="text-center py-8 space-y-1">
            <span className="material-symbols-outlined text-3xl text-outline/40">chat_bubble</span>
            <p className="text-sm text-outline">{t('comments.empty')}</p>
          </div>
        )}

        {!loading && comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onEdit={editComment}
            onDelete={removeComment}
            submitting={submitting}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input form */}
      <div className="mt-4 pt-4 border-t border-outline-variant/10 shrink-0">
        {isAuthenticated ? (
          <CommentForm
            onSubmit={handleAdd}
            submitting={submitting}
            compact={compact}
          />
        ) : (
          <p className="text-xs text-outline text-center py-2">
            {t('comments.login_required')}
          </p>
        )}
      </div>
    </div>
  )
}
