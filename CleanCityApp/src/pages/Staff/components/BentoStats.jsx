/**
 * @param {{
 *   totalReports: number,
 *   processingRate?: string,
 *   activeUsers?: number,
 *   resolvedToday?: number,
 * }} props
 */
export default function BentoStats({ totalReports, processingRate = '94.2%', activeUsers = 8590, resolvedToday = 156 }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Tổng báo cáo */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/5">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-primary-fixed text-on-primary-fixed rounded-lg">
            <span className="material-symbols-outlined" aria-hidden="true">folder_open</span>
          </div>
          <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-full">+12% so với tuần trước</span>
        </div>
        <h3 className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Tổng Báo Cáo</h3>
        <p className="text-3xl font-black font-headline mt-1">{totalReports?.toLocaleString('vi-VN') ?? '1,284'}</p>
      </div>

      {/* Tỉ lệ xử lý */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/5">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-secondary-fixed text-on-secondary-fixed rounded-lg">
            <span className="material-symbols-outlined" aria-hidden="true">analytics</span>
          </div>
          <span className="text-xs font-bold text-secondary px-2 py-1 bg-secondary/10 rounded-full">Ổn định</span>
        </div>
        <h3 className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Tỉ Lệ Xử Lý</h3>
        <p className="text-3xl font-black font-headline mt-1">{processingRate}</p>
      </div>

      {/* Người dân hoạt động */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/5">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg">
            <span className="material-symbols-outlined" aria-hidden="true">groups</span>
          </div>
          <span className="text-xs font-bold text-tertiary px-2 py-1 bg-tertiary/10 rounded-full">+420 mới</span>
        </div>
        <h3 className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Người Dân Hoạt Động</h3>
        <p className="text-3xl font-black font-headline mt-1">{activeUsers?.toLocaleString('vi-VN')}</p>
      </div>

      {/* Sự cố đã giải quyết */}
      <div className="bg-primary-container p-6 rounded-3xl shadow-lg shadow-primary/10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-primary-fixed text-on-primary-fixed rounded-lg">
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
        </div>
        <h3 className="text-on-primary/70 text-sm font-semibold uppercase tracking-wider">Sự Cố Đã Giải Quyết Hôm Nay</h3>
        <p className="text-3xl font-black font-headline mt-1 text-on-primary">{resolvedToday}</p>
      </div>
    </section>
  )
}
