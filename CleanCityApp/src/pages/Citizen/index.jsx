import { useState, useEffect } from 'react'
import TopNav from '../../components/layout/TopNav'
import BottomNav from '../../components/layout/BottomNav'
import ReportList from './components/ReportList'
import NotificationSidebar from './components/NotificationSidebar'
import CreateReportModal from '../Staff/components/CreateReportModal'
import { useMyReports } from '../../hooks/useMyReports'
import { getMyGreenPoints } from '../../services/greenPointApi'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import { useTranslation } from 'react-i18next'

export default function CitizenPage() {
  const { user } = useAuth()
  const { reports, loading, error, refetch } = useMyReports()
  const [isOpen, setIsOpen] = useState(false)
  const [greenPoints, setGreenPoints] = useState(0)
  const [greenHistory, setGreenHistory] = useState([])
  const { notifications, markRead } = useNotifications()
  const { t } = useTranslation()

  useEffect(() => {
    getMyGreenPoints().then(res => {
      setGreenPoints(res.data?.total || 0)
      setGreenHistory(res.data?.history || [])
    })
  }, [])

  const handleCreateSuccess = () => {
    setIsOpen(false)
    refetch()
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <TopNav />

      <main className="p-6 md:p-10 pb-32">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight leading-none">
                {t('citizen.greeting', { name: user?.fullName || user?.userName || '...' })}
              </h1>
              <p className="text-lg text-on-surface-variant font-medium">
                {t('citizen.subtitle')}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="btn-primary px-8 py-4 flex items-center gap-3 hover:opacity-90"
            >
              <span
                className="material-symbols-outlined fill-icon"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add_circle
              </span>
              {t('citizen.new_report_button')}
            </button>
          </header>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Report Feed */}
            <section className="md:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-primary">{t('citizen.my_reports_title')}</h2>
                <span className="text-sm font-semibold text-secondary px-3 py-1 bg-secondary-fixed rounded-full">
                  {t('citizen.report_count', { count: reports.length })}
                </span>
              </div>

              {loading ? (
                <p className="text-on-surface-variant">{t('citizen.loading')}</p>
              ) : error ? (
                <p className="text-error">{error}</p>
              ) : (
                <ReportList reports={reports} />
              )}
            </section>

            {/* Sidebar */}
            <aside className="md:col-span-4 space-y-8">
              {/* QR Scanner */}
              <div className="bg-secondary-container text-on-secondary-container p-8 rounded-[2rem] space-y-6 relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-on-secondary-container/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
                <div className="relative z-10 space-y-4">
                  <span className="material-symbols-outlined text-5xl">qr_code_scanner</span>
                  <h3 className="text-2xl font-black leading-tight">{t('citizen.qr_title')}</h3>
                  <p className="text-sm font-medium opacity-80 leading-relaxed">
                    {t('citizen.qr_desc')}
                  </p>
                  <button className="bg-on-secondary-container text-secondary-container w-full py-4 rounded-xl font-black tracking-tighter hover:opacity-90 transition-all">
                    {t('citizen.qr_button')}
                  </button>
                </div>
              </div>

              <NotificationSidebar notifications={notifications} markRead={markRead} />

              {/* City Health Card */}
              <div className="bg-surface-container-highest rounded-[2rem] p-8 overflow-hidden relative h-48 flex items-end">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDEdPKHyW3H9uE8CHD0MegXO2L-qhFPDDicbyeJfLidBocmTHb6rLiA92iErG4Wuy-QsejsbJ0EKVLJff1LDk-LMBFW0oQcrHiKBR_eEI5jjQ-BRLnwO-izI-9Yet_SNo6K2ef9FnysRBlbYeYIzWnUluaO9-POXOgqu6nXYO__aPk2g7Xy3kYMZOxhAb5FkHwwjl-rUjDL6KpbpC9kzg-C0SmC69N7xGDdR_OXq1cwzDqYi0KSGndoCf4h_SB5vMpPrQ1fYkdKKUiU')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="relative z-10 w-full flex justify-between items-end text-white">
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase opacity-80">
                      {t('citizen.green_points_label')}
                    </p>
                    <h4 className="text-3xl font-black">{greenPoints}</h4>
                  </div>
                  <span
                    className="material-symbols-outlined text-4xl text-primary-fixed fill-icon"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    eco
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <BottomNav />

      {/* FAB – mobile only */}
      <div className="md:hidden fixed bottom-28 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

      {isOpen && (
        <CreateReportModal
          onClose={() => setIsOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  )
}
