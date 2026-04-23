/**
 * Thanh thao tác hàng loạt – hiện khi có bản ghi được chọn.
 *
 * Props:
 *   count      – số bản ghi đã chọn
 *   onClear    – callback bỏ chọn tất cả
 *   children   – các nút hành động tuỳ ý (delete, approve, …)
 */
export default function SelectionBar({ count, onClear, children }) {
  if (!count) return null

  return (
    <div className="flex items-center justify-between gap-4 bg-primary-fixed/60 backdrop-blur px-6 py-3 rounded-2xl shadow-lg animate-in slide-in-from-bottom-2">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">check_circle</span>
        <span className="text-sm font-bold text-on-primary-fixed-variant">
          Đã chọn <span className="text-primary">{count}</span> bản ghi
        </span>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-primary hover:underline ml-2"
        >
          Bỏ chọn
        </button>
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  )
}
