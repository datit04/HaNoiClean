import { useState, useRef, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useComments } from '../../../hooks/useComments'
import { useAuth } from '../../../contexts/AuthContext'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr, lang) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (lang === 'vi') {
    if (mins < 1) return 'Vừa xong'
    if (mins < 60) return `${mins} phút`
    const h = Math.floor(mins / 60)
    if (h < 24) return `${h} giờ`
    const d = Math.floor(h / 24)
    return d < 30 ? `${d} ngày` : new Date(dateStr).toLocaleDateString('vi-VN')
  }
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return d < 30 ? `${d}d` : new Date(dateStr).toLocaleDateString('en-US')
}

// Nếu content bắt đầu bằng @mention thì render highlight
function CommentContent({ content }) {
  if (!content) return null
  const match = content.match(/^(@\S+)([\s\S]*)$/)
  if (match) {
    return (
      <p className="text-[14px] text-on-surface break-words mt-0.5">
        <span className="text-primary font-semibold">{match[1]}</span>
        {match[2]}
      </p>
    )
  }
  return <p className="text-[14px] text-on-surface break-words mt-0.5">{content}</p>
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ name, size = 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-xs'
  return (
    <div className={`${dim} rounded-full bg-[#206223] text-white flex items-center justify-center font-black flex-shrink-0 uppercase select-none`}>
      {(name || '?')[0]}
    </div>
  )
}

// ─── Comment input (Facebook pill style) ─────────────────────────────────────
// mention: string | null — hiển thị @mention badge cố định trước input

function CommentInput({ name, placeholder, onSubmit, submitting, onCancel, autoFocus = false, mention = null }) {
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const fileRef = useRef()
  const { t } = useTranslation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    // Gắn @mention vào đầu nội dung khi reply vào reply
    const content = mention ? `@${mention} ${text.trim()}` : text.trim()
    const result = await onSubmit(content, imageFile)
    if (result?.ok) {
      setText('')
      setImageFile(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) }
    if (e.key === 'Escape' && onCancel) onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start">
      {name && <Avatar name={name} size="sm" />}
      <div className="flex-1 space-y-1">
        <div className="flex items-center bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-full px-3 py-2 gap-1.5">
          {/* Badge @mention cố định */}
          {mention && (
            <span className="text-primary text-[13px] font-bold flex-shrink-0 select-none">
              @{mention}
            </span>
          )}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mention ? '...' : placeholder}
            autoFocus={autoFocus}
            className="flex-1 min-w-0 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title={t('comments.image_label')}
            className="flex-shrink-0 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              {imageFile ? 'image' : 'add_photo_alternate'}
            </span>
          </button>
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="flex-shrink-0 text-primary disabled:text-on-surface-variant/30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>

        {imageFile && (
          <div className="flex items-center gap-1 px-2">
            <span className="text-[11px] text-on-surface-variant truncate max-w-[160px]">{imageFile.name}</span>
            <button type="button" onClick={() => { setImageFile(null); if (fileRef.current) fileRef.current.value = '' }} className="text-error">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-[11px] text-on-surface-variant hover:underline px-2">
            {t('common.cancel')}
          </button>
        )}
      </div>
      <input type="file" ref={fileRef} accept="image/*" className="hidden"
        onChange={(e) => setImageFile(e.target.files[0] || null)} />
    </form>
  )
}

// ─── Single comment bubble ────────────────────────────────────────────────────

function CommentBubble({ comment, currentUser, lang, onReply, onEdit, onDelete }) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content ?? '')
  const [saving, setSaving] = useState(false)

  const authorName = comment.author?.fullName || 'Người dùng'
  const time = timeAgo(comment.createdAt, lang)
  const isOwner = currentUser && currentUser.id === comment.author?.id

  const handleEditSave = async () => {
    if (!editText.trim()) return
    setSaving(true)
    const result = await onEdit(comment.id, editText.trim())
    if (result.ok) setEditing(false)
    setSaving(false)
  }

  return (
    <div className="flex gap-2">
      <Avatar name={authorName} size="sm" />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-1">
            <div className="bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-2xl px-3 py-2">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSave()
                  if (e.key === 'Escape') setEditing(false)
                }}
                className="w-full bg-transparent text-sm text-on-surface focus:outline-none"
              />
            </div>
            <div className="flex gap-2 px-1">
              <button onClick={handleEditSave} disabled={saving}
                className="text-[11px] font-semibold text-primary hover:underline disabled:opacity-50">
                {t('common.save')}
              </button>
              <span className="text-[11px] text-on-surface-variant">·</span>
              <button onClick={() => setEditing(false)}
                className="text-[11px] text-on-surface-variant hover:underline">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-2xl px-3 py-2 inline-block max-w-full">
              <p className="text-[13px] font-bold text-on-surface leading-tight">{authorName}</p>
              <CommentContent content={comment.content} />
            </div>

            {comment.imageUrl && (
              <div className="mt-1">
                <img src={comment.imageUrl} alt="" className="max-h-48 max-w-[240px] rounded-2xl object-cover" />
              </div>
            )}

            {/* Action row */}
            <div className="flex items-center gap-2 mt-1 px-1 flex-wrap">
              {time && <span className="text-[11px] text-on-surface-variant">{time}</span>}
              <span className="text-[11px] text-on-surface-variant">·</span>
              <button onClick={() => onReply(comment.id, authorName)}
                className="text-[12px] font-semibold text-on-surface-variant hover:text-primary transition-colors">
                {t('comments.reply')}
              </button>
              {isOwner && (
                <>
                  <span className="text-[11px] text-on-surface-variant">·</span>
                  <button onClick={() => { setEditing(true); setEditText(comment.content ?? '') }}
                    className="text-[12px] font-semibold text-on-surface-variant hover:text-primary transition-colors">
                    {t('comments.edit')}
                  </button>
                  <span className="text-[11px] text-on-surface-variant">·</span>
                  <button onClick={() => onDelete(comment.id)}
                    className="text-[12px] font-semibold text-on-surface-variant hover:text-error transition-colors">
                    {t('comments.delete')}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── CommentSection ───────────────────────────────────────────────────────────

export default function CommentSection({ reportId }) {
  const { t, i18n } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const { comments, loading, error, submitting, addComment, editComment, removeComment } =
    useComments(reportId)

  // { id: rootCommentId, name: authorName, mention: string|null }
  const [replyingTo, setReplyingTo] = useState(null)
  const [expanded, setExpanded] = useState(new Set())

  const lang = i18n.language

  // Tách top-level và replies
  const topLevel = useMemo(() => comments.filter((c) => !c.parentCommentId), [comments])
  const getReplies = useCallback(
    (parentId) => comments.filter((c) => c.parentCommentId === parentId),
    [comments]
  )

  const handleAddComment = (content, imageFile) => addComment(content, imageFile, null)

  const handleAddReply = async (content, imageFile) => {
    if (!replyingTo) return { ok: false }
    const result = await addComment(content, imageFile, replyingTo.id)
    if (result.ok) {
      setReplyingTo(null)
      // Auto mở reply thread khi vừa gửi
      setExpanded((prev) => new Set([...prev, replyingTo.id]))
    }
    return result
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm(t('comments.confirm_delete'))) return
    await removeComment(commentId)
    setExpanded((prev) => { const s = new Set(prev); s.delete(commentId); return s })
  }

  const toggleExpanded = (commentId) =>
    setExpanded((prev) => {
      const s = new Set(prev)
      s.has(commentId) ? s.delete(commentId) : s.add(commentId)
      return s
    })

  // Khi bấm "Phản hồi" trên comment gốc → replyingTo.mention = null
  // Khi bấm "Phản hồi" trên reply → replyingTo.mention = tên người đó (dùng cho @badge)
  const handleReplyToRoot = (id, name) => setReplyingTo({ id, name, mention: null })
  const handleReplyToReply = (rootId, replyAuthorName) =>
    setReplyingTo({ id: rootId, name: replyAuthorName, mention: replyAuthorName })

  return (
    <div className="px-4 py-3 space-y-3">
      {/* Ô nhập comment mới */}
      {isAuthenticated ? (
        <CommentInput
          name={user?.fullName || user?.userName}
          placeholder={t('comments.placeholder')}
          onSubmit={handleAddComment}
          submitting={submitting}
        />
      ) : (
        <p className="text-[12px] text-center text-on-surface-variant italic py-1">
          {t('comments.login_required')}
        </p>
      )}

      {loading && <p className="text-[12px] text-on-surface-variant">{t('common.loading')}</p>}
      {error && <p className="text-[12px] text-error">{t('comments.load_error')}</p>}
      {!loading && !error && topLevel.length === 0 && (
        <p className="text-[12px] text-on-surface-variant italic">{t('comments.empty')}</p>
      )}

      {/* Danh sách comment thread */}
      <div className="space-y-3">
        {topLevel.map((comment) => {
          const replies = getReplies(comment.id)
          const isExpanded = expanded.has(comment.id)
          const isReplying = replyingTo?.id === comment.id
          // Hiện đường line khi đang xem replies hoặc đang nhập reply
          const showLine = (isExpanded && replies.length > 0) || isReplying

          return (
            <div key={comment.id} className="relative">
              {/*
               * Đường line dọc — nối avatar comment gốc với các reply bên dưới
               * left-3.5  = 14px = tâm avatar (w-7 = 28px)
               * top-8     = 32px = ngay dưới avatar (h-7 = 28px + gap nhỏ)
               * bottom-0  = kéo xuống hết container
               */}
              {showLine && (
                <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-[#ced0d4] dark:bg-[#4a4b4c]" />
              )}

              {/* Comment gốc */}
              <CommentBubble
                comment={comment}
                currentUser={user}
                lang={lang}
                onReply={handleReplyToRoot}
                onEdit={editComment}
                onDelete={handleDelete}
              />

              {/* Nút xem/ẩn replies — thụt vào cùng với vùng content */}
              {replies.length > 0 && (
                <div className="ml-10 mt-1">
                  <button
                    onClick={() => toggleExpanded(comment.id)}
                    className="flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isExpanded ? 'expand_less' : 'subdirectory_arrow_right'}
                    </span>
                    {isExpanded
                      ? t('comments.hide_replies')
                      : t('comments.view_replies', { count: replies.length })}
                  </button>
                </div>
              )}

              {/* Danh sách replies */}
              {isExpanded && (
                <div className="ml-10 mt-1.5 space-y-2">
                  {replies.map((reply) => (
                    <div key={reply.id} className="relative">
                      {/* Nhánh ngang nối line dọc vào avatar reply */}
                      <div className="absolute -left-6 top-3.5 w-6 h-0.5 bg-[#ced0d4] dark:bg-[#4a4b4c]" />
                      <CommentBubble
                        comment={reply}
                        currentUser={user}
                        lang={lang}
                        onReply={(_, replyAuthorName) =>
                          handleReplyToReply(comment.id, replyAuthorName)
                        }
                        onEdit={editComment}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Ô nhập reply */}
              {isReplying && isAuthenticated && (
                <div className="ml-10 mt-2 pb-1">
                  <CommentInput
                    name={user?.fullName || user?.userName}
                    placeholder={t('comments.reply_placeholder', { name: replyingTo.name })}
                    mention={replyingTo.mention}
                    onSubmit={handleAddReply}
                    submitting={submitting}
                    onCancel={() => setReplyingTo(null)}
                    autoFocus
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
