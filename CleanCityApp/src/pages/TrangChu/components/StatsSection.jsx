const stats = [
  {
    value: '1000+',
    label: 'Báo cáo đã xử lý',
    color: 'text-primary',
    desc: 'Hành động thực tế cho kết quả thực tế mỗi ngày.',
  },
  {
    value: '20+',
    label: 'Quận huyện tham gia',
    color: 'text-secondary',
    desc: 'Mạng lưới kết nối toàn diện trên khắp địa bàn Hà Nội.',
  },
  {
    value: '5 Tấn',
    label: 'Rác thải đã thu gom',
    color: 'text-tertiary',
    desc: 'Giảm thiểu ô nhiễm, bảo vệ hệ sinh thái đô thị.',
  },
]

export default function StatsSection() {
  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map(({ value, label, color, desc }) => (
            <div
              key={label}
              className="bg-surface-container-low p-10 rounded-[2.5rem] text-center group hover:bg-surface-container-high transition-colors"
            >
              <div className={`text-6xl font-headline font-black ${color} mb-2`}>{value}</div>
              <div className="text-tertiary font-bold tracking-widest uppercase text-xs mb-4">
                {label}
              </div>
              <p className="text-on-surface-variant text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
