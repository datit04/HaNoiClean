/**
 * Reusable pagination component.
 *
 * @param {{ currentPage: number, totalPages: number, totalRecords?: number, label?: string, onPageChange: (page: number) => void }} props
 */
export default function Pagination({ currentPage, totalPages, totalRecords, label = '', onPageChange }) {
  if (totalPages <= 1) return null

  const summary = totalRecords != null
    ? `Trang ${currentPage} / ${totalPages} · ${totalRecords} ${label || 'mục'}`
    : `Trang ${currentPage} / ${totalPages}`

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/10">
      <span className="text-xs text-on-surface-variant">{summary}</span>
      <div className="flex items-center gap-1">
        <button
          aria-label="Trang trước"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 rounded-xl hover:bg-surface-container-low disabled:opacity-40 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        {pages.map((p, idx, arr) => {
          const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
          return (
            <span key={p} className="contents">
              {showEllipsis && <span className="px-1 text-on-surface-variant select-none">…</span>}
              <button
                onClick={() => onPageChange(p)}
                className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                  p === currentPage
                    ? 'bg-primary text-on-primary'
                    : 'hover:bg-surface-container-low text-on-surface-variant'
                }`}
              >
                {p}
              </button>
            </span>
          )
        })}
        <button
          aria-label="Trang sau"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 rounded-xl hover:bg-surface-container-low disabled:opacity-40 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
  )
}
