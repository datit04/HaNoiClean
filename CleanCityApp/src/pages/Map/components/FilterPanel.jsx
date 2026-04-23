const STATUS_LEGEND = [
  { color: 'bg-error', ring: 'ring-error-container/50', label: 'Mới nhận (New)' },
  { color: 'bg-yellow-500', ring: 'ring-yellow-100', label: 'Đang xử lý (Processing)' },
  { color: 'bg-primary', ring: 'ring-primary-fixed/50', label: 'Đã hoàn thành (Resolved)' },
]

/**
 * @param {{
 *   filters: { wardId: string, categoryIds: number[] },
 *   wardOptions: Array<{ id: number | string, name: string, districtName?: string }>,
 *   wardCount?: number,
 *   wardsLoading?: boolean,
 *   wardsError?: string | null,
 *   categories: Array<{ id: number, name: string, icon?: string }>,
 *   categoriesLoading?: boolean,
 *   onWardChange: (v: string) => void,
 *   onCategoryToggle: (id: number) => void,
 *   onNewReport: () => void,
 * }} props
 */
import { useState } from 'react'

export default function FilterPanel({
  filters,
  wardOptions,
  wardCount,
  wardsLoading,
  wardsError,
  categories,
  categoriesLoading,
  onWardChange,
  onCategoryToggle,
  onNewReport,
}) {
  return (
    <aside className="fixed left-0 top-[72px] h-[calc(100vh-72px)] w-80 bg-[#eff6e7] dark:bg-emerald-900/10 flex flex-col p-6 gap-6 z-40">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[#206223] dark:text-[#acf4a4] font-headline">
          Bộ lọc bản đồ
        </h2>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-2">
        {/* Ward/Commune filter */}
        <div className="space-y-3">
          <label className="section-label text-tertiary">
            Phường / Xã Hà Nội
          </label>
          <select
            value={filters.wardId}
            onChange={(e) => onWardChange(e.target.value)}
            className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 text-sm focus:ring-primary"
            disabled={wardsLoading}
          >
            {wardOptions.map((w) => (
              <option key={w.id || 'all'} value={String(w.id)}>
                {w.districtName ? `${w.name} (${w.districtName})` : w.name}
              </option>
            ))}
          </select>
          {wardsLoading && (
            <p className="text-xs text-on-surface-variant">Đang tải danh sách phường/xã...</p>
          )}
          {wardsError && (
            <p className="text-xs text-error">{wardsError}</p>
          )}
          {!wardsLoading && !wardsError && typeof wardCount === 'number' && (
            <p className="text-xs text-on-surface-variant">Đang có {wardCount} phường/xã</p>
          )}
        </div>

        {/* Category filter */}
        <div className="space-y-3">
          <label className="section-label text-tertiary">
            Danh mục sự cố
          </label>
          <div className="grid grid-cols-1 gap-2">
            {categoriesLoading && (
              <p className="text-xs text-on-surface-variant p-3">Đang tải danh mục...</p>
            )}
            {categories.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={filters.categoryIds.includes(c.id)}
                  onChange={() => onCategoryToggle(c.id)}
                  className="rounded text-primary focus:ring-primary border-outline-variant/30"
                />
                <span
                  className="material-symbols-outlined group-hover:scale-110 transition-transform"
                  style={{ color: c.color || '#206223' }}
                >
                  {c.icon || 'category'}
                </span>
                <span className="text-sm font-medium">{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-surface-container-highest rounded-2xl p-4 mt-4 space-y-4">
          <h3 className="section-label text-on-surface-variant">
            Chú giải trạng thái
          </h3>
          <div className="space-y-3">
            {STATUS_LEGEND.map(({ color, ring, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${color} ring-4 ${ring}`} />
                <span className="text-xs font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onNewReport}
          className="btn-primary py-4 flex items-center justify-center gap-2 hover:translate-y-[-2px]"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Báo cáo sự cố mới
        </button>
      </div>
    </aside>
  )
}
