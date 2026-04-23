const steps = [
  {
    icon: 'photo_camera',
    bg: 'bg-primary-fixed',
    iconColor: 'text-primary',
    title: '1. Ghi hình',
    desc: 'Chụp ảnh và định vị vị trí có rác thải hoặc vi phạm môi trường.',
    highlight: false,
  },
  {
    icon: 'neurology',
    bg: 'bg-secondary-fixed',
    iconColor: 'text-secondary',
    title: '2. AI Phân loại',
    desc: 'Hệ thống AI tự động phân tích mức độ và loại rác thải ngay lập tức.',
    highlight: false,
  },
  {
    icon: 'share_location',
    bg: 'bg-tertiary-fixed',
    iconColor: 'text-tertiary',
    title: '3. Điều phối',
    desc: 'Báo cáo được gửi trực tiếp tới đơn vị môi trường quận tương ứng.',
    highlight: false,
  },
  {
    icon: 'task_alt',
    bg: 'bg-primary-container',
    iconColor: 'text-on-primary-container',
    title: '4. Giải quyết',
    desc: 'Sự cố được xử lý và thông báo kết quả lại cho người báo cáo.',
    highlight: true,
  },
]

export default function ProcessSection() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-6 tracking-tight">
            Quy trình vận hành thông minh
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Sử dụng công nghệ AI tiên tiến để tối ưu hóa việc phân loại và xử lý sự cố môi
            trường, đảm bảo mọi ý kiến đều được lắng nghe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map(({ icon, bg, iconColor, title, desc, highlight }) => (
            <div
              key={title}
              className={`relative z-10 ${highlight ? 'bg-primary shadow-lg' : 'bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow'} p-8 rounded-[2rem] h-full`}
            >
              <div
                className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center mb-6`}
              >
                <span className={`material-symbols-outlined ${iconColor} text-3xl`}>{icon}</span>
              </div>
              <h3
                className={`font-headline font-bold text-xl mb-3 ${highlight ? 'text-on-primary' : ''}`}
              >
                {title}
              </h3>
              <p className={`text-sm ${highlight ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
