import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const STATUS_LEGEND_KEYS = [
  { color: 'bg-error', ring: 'ring-error-container/50', key: 'map.legend_new' },
  { color: 'bg-yellow-500', ring: 'ring-yellow-100', key: 'map.legend_processing' },
  { color: 'bg-primary', ring: 'ring-primary-fixed/50', key: 'map.legend_resolved' },
]

function WardDropdown({ value, options, loading, error, onChange }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef()

  useEffect(() => {
    if (!open) return
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const filtered = options.filter((w) => {
    if (!search) return true
    const label = w.districtName ? `${w.name} ${w.districtName}` : w.name
    return label.toLowerCase().includes(search.toLowerCase())
  })

  const selected = options.find((w) => String(w.id) === String(value))
  const displayLabel = selected
    ? selected.districtName ? `${selected.name} (${selected.districtName})` : selected.name
    : t('map.ward_all')

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((v) => !v)}
        className="w-full bg-surface-container-highest rounded-xl py-3 px-4 text-sm text-left flex items-center justify-between gap-2 hover:bg-surface-container-high transition-colors disabled:opacity-50"
      >
        <span className="truncate font-medium">{loading ? t('map.ward_loading') : displayLabel}</span>
        <span className={`material-symbols-outlined text-lg text-on-surface-variant transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface rounded-2xl shadow-xl border border-outline-variant/20 z-50 overflow-hidden">
          <div className="p-2 border-b border-outline-variant/10">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('map.ward_search_placeholder')}
                className="w-full pl-9 pr-3 py-2 text-sm bg-surface-container rounded-xl border-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto custom-scrollbar py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-on-surface-variant text-center">{t('map.ward_no_results')}</li>
            ) : (
              filtered.map((w) => {
                const label = w.districtName ? `${w.name} (${w.districtName})` : w.name
                const isSelected = String(w.id) === String(value)
                return (
                  <li key={w.id ?? 'all'}>
                    <button
                      type="button"
                      onClick={() => { onChange(String(w.id)); setOpen(false); setSearch('') }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container transition-colors flex items-center justify-between gap-2 ${isSelected ? 'text-primary font-semibold bg-primary/5' : ''}`}
                    >
                      <span className="truncate">{label}</span>
                      {isSelected && <span className="material-symbols-outlined text-base text-primary flex-shrink-0">check</span>}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}

      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  )
}

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
  open,
  onClose,
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-[72px] h-[calc(100vh-72px)] w-80 bg-[#eff6e7] dark:bg-emerald-900/10
        flex flex-col p-6 gap-6 z-40 transition-transform duration-300
        md:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
      <div className="space-y-1 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#206223] dark:text-[#acf4a4] font-headline">
          {t('map.filter_title')}
        </h2>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-full hover:bg-[#dee5d6] transition-colors"
          aria-label="Đóng bộ lọc"
        >
          <span className="material-symbols-outlined text-[#206223]">close</span>
        </button>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-2">
        <div className="space-y-3">
          <label className="section-label text-tertiary">{t('map.ward_label')}</label>
          <WardDropdown
            value={filters.wardId}
            options={wardOptions}
            loading={wardsLoading}
            error={wardsError}
            onChange={onWardChange}
          />
          {!wardsLoading && !wardsError && typeof wardCount === 'number' && (
            <p className="text-xs text-on-surface-variant">{t('map.ward_count', { count: wardCount })}</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="section-label text-tertiary">{t('map.category_label')}</label>
          <div className="grid grid-cols-1 gap-2">
            {categoriesLoading && (
              <p className="text-xs text-on-surface-variant p-3">{t('map.category_loading')}</p>
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

        <div className="bg-surface-container-highest rounded-2xl p-4 mt-4 space-y-4">
          <h3 className="section-label text-on-surface-variant">{t('map.legend_title')}</h3>
          <div className="space-y-3">
            {STATUS_LEGEND_KEYS.map(({ color, ring, key }) => (
              <div key={key} className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${color} ring-4 ${ring}`} />
                <span className="text-xs font-semibold">{t(key)}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onNewReport}
          className="btn-primary py-4 flex items-center justify-center gap-2 hover:translate-y-[-2px]"
        >
          <span className="material-symbols-outlined">add_circle</span>
          {t('map.new_report_button')}
        </button>
      </div>
    </aside>
    </>
  )
}
