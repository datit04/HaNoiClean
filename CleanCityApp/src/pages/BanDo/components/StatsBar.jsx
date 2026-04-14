/**
 * @param {{ totalReports: number, resolvedPercent: number, topDistrict: string }} props
 */
export default function StatsBar({ totalReports, resolvedPercent, topDistrict }) {
  return (
    <div className="absolute bottom-8 left-8 right-8 pointer-events-none flex justify-end">
      <div className="pointer-events-auto bg-[#ffffff]/90 backdrop-blur-2xl p-6 rounded-[2rem] shadow-[0_-12px_32px_rgba(23,29,20,0.06)] flex items-center gap-8 border border-[#bfcaba]/15">
        <div className="flex items-center gap-4 border-r border-outline-variant/30 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl fill-icon">analytics</span>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Tổng báo cáo tháng
            </div>
            <div className="text-2xl font-black font-headline text-primary">
              {totalReports.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-r border-outline-variant/30 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-2xl fill-icon">verified</span>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Đã xử lý
            </div>
            <div className="text-2xl font-black font-headline text-secondary">
              {resolvedPercent}%
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Khu vực tích cực nhất
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-sm">stars</span>
            <span className="text-sm font-bold">{topDistrict}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
