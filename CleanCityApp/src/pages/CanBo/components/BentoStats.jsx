/**
 * @param {{
 *   totalReports: number,
 *   fieldTeams: number,
 *   hotDistrict: string,
 *   aiClassified: number,
 * }} props
 */
export default function BentoStats({ totalReports, fieldTeams, hotDistrict, aiClassified }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Highlight Card */}
      <div className="md:col-span-2 bg-primary rounded-[2rem] p-8 text-on-primary relative overflow-hidden flex flex-col justify-between min-h-[240px]">
        <div className="z-10">
          <h3 className="font-headline text-3xl font-extrabold mb-1">Hiệu suất Đô thị</h3>
          <p className="text-primary-fixed-dim opacity-90 font-medium">
            Tháng 10, 2023 • Hoàn thành 94%
          </p>
        </div>
        <div className="z-10 flex items-end gap-4 mt-8">
          <div>
            <span className="block text-4xl font-black font-headline">{totalReports.toLocaleString()}</span>
            <span className="section-label opacity-80">Báo cáo mới</span>
          </div>
          <div className="h-12 w-px bg-on-primary/20" />
          <div>
            <span className="block text-4xl font-black font-headline">{fieldTeams}</span>
            <span className="section-label opacity-80">Đội hiện trường</span>
          </div>
        </div>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary-container rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Hot district */}
      <div className="bg-surface-container-highest rounded-[2rem] p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="material-symbols-outlined text-secondary text-3xl">location_city</span>
          <span className="text-primary font-bold text-sm">+12%</span>
        </div>
        <div>
          <span className="block text-3xl font-black font-headline text-on-surface">{hotDistrict}</span>
          <span className="text-sm font-medium text-tertiary">Khu vực năng động nhất</span>
        </div>
      </div>

      {/* AI classified */}
      <div className="bg-secondary rounded-[2rem] p-8 text-on-primary flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="material-symbols-outlined text-on-primary text-3xl">auto_awesome</span>
          <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase">
            AI Active
          </span>
        </div>
        <div>
          <span className="block text-3xl font-black font-headline">{aiClassified}</span>
          <span className="text-sm font-medium opacity-80">Phân loại tự động</span>
        </div>
      </div>
    </section>
  )
}
