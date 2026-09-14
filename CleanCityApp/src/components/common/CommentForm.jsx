import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Form nhập comment: textarea + upload ảnh + preview
 * Props:
 *   onSubmit(content, imageFile): async fn
 *   submitting: bool
 *   initialValue?: string  (cho chế độ chỉnh sửa)
 *   onCancel?: fn          (hiện nút Hủy khi edit)
 *   compact?: bool         (compact style cho sidebar)
 */
export default function CommentForm({
  onSubmit,
  submitting = false,
  initialValue = '',
  onCancel,
  compact = false,
}) {
  const { t } = useTranslation()
  const [content, setContent] = useState(initialValue)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileRef = useRef()

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    await onSubmit(content.trim(), imageFile)
    setContent('')
    removeImage()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('comments.placeholder')}
        maxLength={2000}
        rows={compact ? 2 : 3}
        disabled={submitting}
        className={`w-full resize-none rounded-xl border border-outline-variant/30 bg-surface-container px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 transition disabled:opacity-50 ${compact ? 'text-xs' : ''}`}
      />

      {imagePreview && (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt="preview"
            className="h-20 w-28 rounded-lg object-cover border border-outline-variant/20"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center text-xs hover:bg-error/80"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={submitting}
          title={t('comments.image_label')}
          className="p-1.5 rounded-lg hover:bg-surface-container-highest text-outline transition disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-base">image</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageChange}
          className="hidden"
        />

        <span className={`flex-1 text-right text-[10px] text-outline ${content.length > 1800 ? 'text-error' : ''}`}>
          {content.length}/2000
        </span>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-outline hover:bg-surface-container-highest transition disabled:opacity-40"
          >
            {t('common.cancel')}
          </button>
        )}

        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-sm font-bold hover:bg-primary/90 transition active:scale-95 disabled:opacity-40"
        >
          {submitting ? (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            </span>
          ) : t('comments.send')}
        </button>
      </div>
    </form>
  )
}
