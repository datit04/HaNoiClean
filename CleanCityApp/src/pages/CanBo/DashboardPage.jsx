import { Link, useNavigate } from 'react-router-dom'
import BentoStats from './components/BentoStats'
import ReportCard from '../../components/common/ReportCard'
import FieldTeams from './components/FieldTeams'
import { useReports } from '../../hooks/useReports'
import { ROUTES } from '../../utils/constants'

export default function CanBoDashboardPage() {
  const { reports, totalRecords, loading } = useReports({ pageSize: 20, status: 0 })
  const navigate = useNavigate()

  const displayReports = reports
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      status: r.status,
      statusKey: r.statusKey,
      priority: r.priorityKey,
      timeAgo: r.createdAt
        ? new Date(r.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
        : '',
      title: r.title,
      location: r.location,
      category: r.categoryName,
      categoryName: r.categoryName,
      categoryColor: 'text-primary',
      imageUrl: r.imageUrl,
    }))

  return (
    <div className="space-y-10">
      <BentoStats
        totalReports={totalRecords || 1284}
        fieldTeams={42}
        hotDistrict="Hoàn Kiếm"
        aiClassified={892}
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end mb-2 gap-4">
            <div>
              <p className="section-label text-tertiary">Tổng quan vận hành</p>
              <h3 className="font-headline text-3xl font-extrabold text-on-surface mt-2">Báo cáo đến</h3>
            </div>
            <Link to={ROUTES.STAFF_REPORTS} className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
              Xem tất cả
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-on-surface-variant">Đang tải...</p>
            ) : (
              displayReports.map((report) => (
                <ReportCard key={report.id} report={report} onClick={() => navigate(ROUTES.STAFF_REPORTS)} />
              ))
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-container-highest rounded-[2.5rem] overflow-hidden relative min-h-[320px] shadow-lg">
            <div className="absolute inset-0 z-0">
              <img
                alt="Hanoi map"
                className="w-full h-full object-cover opacity-80 grayscale-[0.2]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9No8O6mIenEwtx588mU7j-Arp9CKmamzNPp8i37QpK16UR1hctH3MImVm5azkjwjZ5GFyrCHkAIM0SX4cDiPFd3GS9wpKgFs3_EDjQILdbrqzZ4oyQ_w2nZQZ6I6yacEKJoGcsczCqU6-nCV_k72JK4ahHVv-1_4reiwPR9FsG9vjNkw2YVK1Z-oM3H3Cxbbgw-LYZMU6CzPLcC5K_U4hBkXZgk-FsMz6otoM5ftzHBXqVB8zRp2VE7k7h1ewtgCC-lBW1uVrxwff"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              <button className="bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-sm hover:bg-white transition-all">
                <span className="material-symbols-outlined text-on-surface">zoom_in</span>
              </button>
              <button className="bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-sm hover:bg-white transition-all">
                <span className="material-symbols-outlined text-on-surface">zoom_out</span>
              </button>
            </div>
            <div className="absolute bottom-6 left-6 right-6 z-20">
              <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold uppercase text-tertiary tracking-widest">
                    Bản đồ nhiệt
                  </span>
                  <span className="text-sm font-bold text-on-surface">
                    Đang theo dõi 28 điểm nóng
                  </span>
                </div>
                <Link to="/ban-do">
                  <span className="material-symbols-outlined text-secondary">farsight_digital</span>
                </Link>
              </div>
            </div>
          </div>

          <FieldTeams />
        </div>
      </section>

    </div>
  )
}