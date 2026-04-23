import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BentoStats from './components/BentoStats'
import { useReports } from '../../hooks/useReports'
import { useCategoryStatistics } from '../../hooks/useCategoryStatistics'
import { useTopWards } from '../../hooks/useTopWards'
import { useWeeklyStats } from '../../hooks/useWeeklyStats'
import { useTeamPerformance } from '../../hooks/useTeamPerformance'
import { ROUTES } from '../../utils/constants'



const RECENT_ACTIVITIES = [
  {
    icon: 'delete',
    color: 'bg-primary',
    title: 'Đống rác thải trái phép',
    location: 'Hàng Trống, Hoàn Kiếm',
    badge: 'ĐÃ XỬ LÝ',
    badgeClass: 'bg-primary/10 text-primary',
    time: '2 phút trước',
  },
  {
    icon: 'construction',
    color: 'bg-secondary',
    title: 'Vỉa hè bị hư hỏng',
    location: 'Kim Mã, Ba Đình',
    badge: 'ĐANG CHỜ DUYỆT',
    badgeClass: 'bg-secondary/10 text-secondary',
    time: '14 phút trước',
  },
  {
    icon: 'report',
    color: 'bg-error',
    title: 'Cống thoát nước bị tràn',
    location: 'Lý Thường Kiệt',
    badge: 'KHẨN CẤP',
    badgeClass: 'bg-error/10 text-error',
    time: '45 phút trước',
  },
  {
    icon: 'park',
    color: 'bg-primary-container',
    title: 'Cành cây bị gãy đổ',
    location: 'Đường Thanh Niên',
    badge: 'ĐANG ĐIỀU PHỐI',
    badgeClass: 'bg-primary/10 text-primary',
    time: '1 giờ trước',
  },
]

const ABBR_COLORS = [
  { text: 'text-primary', bg: 'bg-primary/10' },
  { text: 'text-secondary', bg: 'bg-secondary/10' },
  { text: 'text-tertiary', bg: 'bg-tertiary/10' },
  { text: 'text-error', bg: 'bg-error/10' },
]

const BAR_COLORS = ['bg-primary', 'bg-secondary', 'bg-primary-container', 'bg-tertiary']

const DONUT_COLORS = [
  '#206223', '#00639a', '#6b4f45', '#9ccf85',
  '#ba1a1a', '#3a7b3a', '#51b2fe', '#85675c',
]

function buildDonutSegments(stats) {
  let offset = 0
  return stats.map((item, i) => {
    const dash = item.percentage
    const seg = { ...item, stroke: DONUT_COLORS[i % DONUT_COLORS.length], dashArray: `${dash} ${100 - dash}`, dashOffset: -offset }
    offset += dash
    return seg
  })
}

export default function CanBoDashboardPage() {
  const { totalRecords } = useReports({ pageSize: 1 })
  const { stats: catStats, total: catTotal, loading: catLoading } = useCategoryStatistics()
  const navigate = useNavigate()

  const donutSegments = buildDonutSegments(catStats)
  const [hoveredSeg, setHoveredSeg] = useState(null)
  const { wards: topWards, loading: topWardsLoading } = useTopWards({ top: 5 })
  const { bars: weekBars, loading: weekLoading } = useWeeklyStats()
  const { teams: perfTeams, loading: perfLoading } = useTeamPerformance()

  const maxCount = weekBars.length > 0 ? Math.max(...weekBars.map((b) => b.tip), 0) : 0
  const step = maxCount === 0 ? 25 : Math.ceil(maxCount / 4)
  const yMax = step * 4
  const yTicks = [yMax, step * 3, step * 2, step, 0]

  return (
    <div className="space-y-8">
      {/* Stats cards */}
      <BentoStats totalReports={totalRecords || 1284} />

      {/* Bar chart + Donut */}
      <section className="grid grid-cols-12 gap-6">
        {/* Bar chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/5">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-extrabold font-headline">Xu hướng Báo cáo (7 ngày qua)</h4>
            <select aria-label="Lọc báo cáo" className="bg-surface-container border-none text-xs font-bold rounded-lg px-4 py-2 focus:ring-primary">
              <option>Tất cả báo cáo</option>
              <option>Chỉ khẩn cấp</option>
            </select>
          </div>
          <div className="h-72 flex flex-col">
            <div className="flex-1 flex gap-4 relative">
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between text-[10px] font-bold text-on-surface-variant/40 h-[calc(100%-20px)] pr-2">
                {yTicks.map((t, i) => <span key={i}>{t}</span>)}
              </div>
              {/* Chart Area */}
              <div className="flex-1 relative h-[calc(100%-20px)]">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="w-full border-t border-outline-variant/5" />
                  <div className="w-full border-t border-outline-variant/5" />
                  <div className="w-full border-t border-outline-variant/5" />
                  <div className="w-full border-t border-outline-variant/5" />
                  <div className="w-full border-t border-outline-variant/5" />
                </div>
                {/* Bars */}
                <div className="absolute inset-0 flex justify-between items-end px-2">
                  {weekLoading ? (
                    Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-[8%] bg-surface-container-high rounded-t-lg animate-pulse"
                        style={{ height: `${20 + i * 10}%` }}
                      />
                    ))
                  ) : (
                    weekBars.map((bar) => (
                      <div
                        key={bar.label}
                        className="relative w-[8%] bg-primary rounded-t-lg transition-[height] duration-500 hover:opacity-80 group cursor-pointer"
                        style={{ height: yMax > 0 ? `${Math.max(Math.round((bar.tip / yMax) * 100), bar.tip > 0 ? 2 : 0)}%` : '0%' }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {bar.tip} báo cáo
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            {/* X-Axis Labels */}
            <div className="flex justify-between pl-8 mt-2">
              {(weekLoading ? Array.from({ length: 7 }).map(() => ({ label: '' })) : weekBars).map((bar, i) => (
                <span key={i} className="w-[14.28%] text-center text-[10px] font-black text-on-surface-variant/60">
                  {bar.label ? bar.label.replace('Thứ ', 'T').replace('Chủ Nhật', 'CN') : '·'}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Donut chart */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-highest p-8 rounded-3xl border border-primary/5 flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h4 className="text-xl font-extrabold font-headline mb-1">Tổng hợp danh mục</h4>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative z-10 gap-2">
            <div className="relative w-40 h-40">
              {catLoading ? (
                <div className="w-full h-full rounded-full border-4 border-surface-container-high animate-pulse" />
              ) : (
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Track */}
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#e3ebdc" strokeWidth="4" />
                  {donutSegments.length === 0 ? (
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#bfcaba" strokeWidth="4" strokeDasharray="100 0" />
                  ) : (
                    donutSegments.map((seg, i) => (
                      <circle
                        key={seg.categoryId ?? i}
                        cx="18" cy="18" r="15.915"
                        fill="transparent"
                        stroke={seg.stroke}
                        strokeWidth="4"
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredSeg(seg)}
                        onMouseLeave={() => setHoveredSeg(null)}
                      />
                    ))
                  )}
                </svg>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black font-headline">
                  {catTotal >= 1000 ? `${(catTotal / 1000).toFixed(1)}k` : catTotal}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-tighter text-on-surface-variant">TỔNG</span>
              </div>
            </div>
            {/* Tooltip box dưới donut */}
            <div className={`h-8 flex items-center justify-center transition-opacity duration-150 ${hoveredSeg ? 'opacity-100' : 'opacity-0'}`}>
              <span className="bg-on-surface text-surface text-[11px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                {hoveredSeg ? `${hoveredSeg.categoryName}: ${hoveredSeg.count}` : ''}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
            {catLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-surface-container-high rounded animate-pulse" />
              ))
            ) : catStats.length === 0 ? (
              <p className="col-span-2 text-center text-xs text-on-surface-variant">Chưa có dữ liệu</p>
            ) : (
              catStats.slice(0, 8).map((item, i) => (
                <div
                  key={item.categoryId ?? i}
                  className="flex items-center gap-2"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                  />
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase truncate">
                    {item.categoryName} ({item.percentage}%)
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Hotspot + Recent activity */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Hotspot */}
        <div className="xl:col-span-2 bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/5">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-extrabold font-headline">Điểm nóng theo Khu vực</h4>
            <Link to={ROUTES.MAP} className="text-secondary text-sm font-bold flex items-center hover:underline">
              Xem Bản đồ <span className="material-symbols-outlined text-sm ml-1">open_in_new</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Map thumbnail */}
            <div className="rounded-xl overflow-hidden h-64 bg-surface-container relative group">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuACi1_6Aywy6p5SR9oupsWGwC16fAhI7oFM-61lxdi4zXRaJgqGcBOvB3dmw-c68oact8jG6F64cyIAM4TnLGfvKXc9YD00-owrcX8QLKlSF8IVRKjkfi2n-UVhhwJH99VpkH7ORoficSJSJOiRZPuNLgJcMWmLo6t-eLo-8NoOSsiIUNr5XYHy7GWTRM4m9FeHhHeEy5AZqSRn2rcIlZbszjD2Q3v5p8-crQdl9gRG27Wip6QHK1lbF25dJCyaPgFf2UtZMmHL7KnK')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-bold text-sm">Bản đồ Nhiệt Thời gian thực</p>
                <p className="text-white/70 text-[10px]">Cập nhật 2 phút trước</p>
              </div>
            </div>

            {/* Top wards */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase text-on-surface-variant tracking-widest border-b border-outline-variant/10 pb-2">
                TOP PHƯỜNG/XÃ TRỌNG ĐIỂM
              </h5>
              {topWardsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-surface-container-low rounded-xl animate-pulse" />
                ))
              ) : topWards.length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-4">Chưa có dữ liệu</p>
              ) : (
                topWards.map((w, i) => {
                  const rankColor =
                    i === 0 ? 'text-error' :
                    i === 1 ? 'text-error' :
                    i === 2 ? 'text-tertiary' : 'text-on-surface-variant'
                  return (
                    <div key={w.wardId ?? i} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-primary bg-primary/10 w-6 h-6 flex items-center justify-center rounded">
                          {i + 1}
                        </span>
                        <span className="text-sm font-bold">{w.wardName}</span>
                      </div>
                      <span className={`text-xs font-bold ${rankColor}`}>{w.totalReports} Báo cáo</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/5">
          <h4 className="text-xl font-extrabold font-headline mb-6">Hoạt động Gần đây</h4>
          <div className="space-y-6 relative">
            <div className="absolute left-[1.125rem] top-2 bottom-2 w-px border-l-2 border-dashed border-tertiary-fixed-dim" />
            {RECENT_ACTIVITIES.map((act, i) => (
              <div key={i} className="relative flex gap-4 pl-10">
                <div className={`absolute left-0 top-1 w-6 h-6 ${act.color} rounded-full flex items-center justify-center z-10`}>
                  <span
                    className="material-symbols-outlined text-white text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {act.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface leading-tight">{act.title}</p>
                  <p className="text-xs text-on-surface-variant mb-2">{act.location}</p>
                  <span className={`text-[10px] font-bold px-2 py-1 ${act.badgeClass} rounded-full uppercase`}>
                    {act.badge}
                  </span>
                  <p className="text-[10px] text-on-surface-variant mt-2 font-medium">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to={ROUTES.STAFF_REPORTS}
            className="block w-full mt-8 py-3 border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface-variant text-center hover:bg-surface-container-low transition-colors"
          >
            Xem tất cả hoạt động
          </Link>
        </div>
      </section>

      {/* Team performance table */}
      <section className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/5">
        <div className="flex justify-between items-center mb-8">
          <h4 className="text-xl font-extrabold font-headline">Hiệu suất Đội ngũ</h4>
          <div className="flex gap-2">
            <button className="p-2 bg-surface-container-high rounded-lg">
              <span className="material-symbols-outlined text-sm">filter_list</span>
            </button>
            <button className="p-2 bg-surface-container-high rounded-lg">
              <span className="material-symbols-outlined text-sm">download</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest border-b border-outline-variant/10">
                <th className="pb-4 px-4">Phường / Đội ngũ</th>
                <th className="pb-4 px-4">Nhân viên</th>
                <th className="pb-4 px-4">Thời gian xử lý TB</th>
                <th className="pb-4 px-4">Hoàn thành</th>
                <th className="pb-4 px-4">Hiệu suất</th>
                <th className="pb-4 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {perfLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="py-4 px-4">
                        <div className="h-5 bg-surface-container-high rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : perfTeams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-on-surface-variant">Chưa có dữ liệu</td>
                </tr>
              ) : (
                perfTeams.slice(0, 5).map((team, i) => {
                  const abbr = (team.teamName ?? 'N/A').slice(0, 2).toUpperCase()
                  const color = ABBR_COLORS[i % ABBR_COLORS.length]
                  const barColor = BAR_COLORS[i % BAR_COLORS.length]
                  const rate = team.completionRate ?? 0
                  return (
                    <tr key={team.teamId} className="border-b border-outline-variant/5 hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${color.bg} rounded-lg flex items-center justify-center ${color.text} font-bold text-xs`}>
                            {abbr}
                          </div>
                          <div>
                            <p className="font-bold">{team.teamName}</p>
                            <p className="text-[10px] text-on-surface-variant">{team.wardName ?? team.categoryName ?? ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">{team.memberCount} Thành viên</td>
                      <td className="py-4 px-4">
                        {team.averageProcessingHours != null
                          ? `${team.averageProcessingHours.toFixed(1)} Giờ`
                          : '—'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-bold">
                          {team.completedReports}/{team.totalAssignedReports}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className={`${barColor} h-full transition-[width] duration-500`}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-on-surface-variant">{rate}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button aria-label="Thêm tùy chọn" className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
                          <span className="material-symbols-outlined" aria-hidden="true">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
