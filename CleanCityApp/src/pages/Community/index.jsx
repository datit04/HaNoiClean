import { useState, useEffect, useMemo } from 'react'
import TopNav from '../../components/layout/TopNav'
import BottomNav from '../../components/layout/BottomNav'
import ReportCard from './components/ReportCard'
import { useReports } from '../../hooks/useReports'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '../../hooks/useDebounce'

const STATUS_OPTIONS = [
  { value: '', key: 'community.all_statuses' },
  { value: '0', key: 'report_status.submitted' },
  { value: '1', key: 'report_status.received' },
  { value: '2', key: 'report_status.processing' },
  { value: '3', key: 'report_status.completed' },
  { value: '4', key: 'report_status.rejected' },
]

export default function CommunityPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { reports, loading, error, setFilters } = useReports({ pageIndex: 1, pageSize: 24 })

  useEffect(() => {
    const next = { pageIndex: 1, pageSize: 24 }
    if (statusFilter !== '') next.status = Number(statusFilter)
    setFilters(next)
  }, [statusFilter, setFilters])

  const filteredReports = useMemo(() => {
    if (!debouncedSearch.trim()) return reports
    const q = debouncedSearch.toLowerCase()
    return reports.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.categoryName?.toLowerCase().includes(q)
    )
  }, [reports, debouncedSearch])

  return (
    <div className="bg-[#f0f2f5] dark:bg-[#18191a] text-on-surface min-h-screen">
      <TopNav />

      {/* Sticky filter bar */}
      <div className="sticky top-[65px] z-40 bg-[#f0f2f5]/90 dark:bg-[#18191a]/90 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col gap-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg select-none">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('community.search_placeholder')}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#3a3b3c] rounded-full text-sm text-on-surface placeholder:text-on-surface-variant border-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full font-semibold text-xs transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-[#3a3b3c] text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {t(opt.key)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="pb-28">
        <div className="max-w-2xl mx-auto px-0 sm:px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-24">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">
                progress_activity
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-24 text-error font-semibold">{error}</div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl opacity-30">eco</span>
              <p className="font-semibold">{t('community.empty')}</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
