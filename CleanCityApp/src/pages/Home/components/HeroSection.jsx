import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <header className="relative min-h-[921px] flex items-center overflow-hidden bg-surface-container-low">
      <div className="absolute inset-0 z-0">
        <img
          alt="Hanoi Skyline"
          className="w-full h-full object-cover opacity-40 mix-blend-multiply"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpM9QT6QHovuJgxIZlYJSP0LpRORC45LiamaGaxjqIntYPZL1yH6va1iPgx3xH6BP6K2xexpkYWudvXEQ4zcgi1rTycP7tL3pldyZGAWbWvAgRA9WBZpu7dST9hGmLh_ND1KgccX9BW_TOwYJxq58ydIw0VIOWWAirlKR53DcVf6i8Rr3LzHh40IpYRC7iQMHHJN7fPbu-g-2iNjzFSj1w2f9JVlCdSAPUUuR4GcHuWVOrEVEnE_3crFboVfANqH3os2ccKlPVSccQ"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <h1 className="font-headline font-extrabold text-5xl lg:text-7xl text-primary leading-tight mb-6 tracking-tighter">
            Kiến tạo Thủ đô <br />
            <span className="text-secondary italic">Xanh &amp; Bền vững</span>
          </h1>
          <p className="text-xl text-on-surface-variant mb-10 max-w-xl leading-relaxed">
            Hệ thống quản lý đô thị thông minh giúp mỗi công dân trở thành một người bảo tồn thành
            phố. Báo cáo các vấn đề môi trường chỉ trong 30 giây.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/nguoi-dan"
              className="btn-primary px-8 py-4 shadow-primary/10 hover:shadow-primary/20 text-lg"
            >
              Báo cáo ngay
            </Link>
            <Link
              to="/ban-do"
              className="px-8 py-4 border-2 border-primary/20 text-primary font-bold rounded-xl hover:bg-primary-fixed/20 transition-all text-lg"
            >
              Xem bản đồ thực tế
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 hidden lg:block">
          <div className="relative">
            <div className="bg-surface-container-highest rounded-[3rem] p-4 shadow-2xl rotate-3">
              <img
                alt="Reporting Tool"
                className="rounded-[2.5rem] w-full h-[500px] object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqi4ds2YDMW0R9C81M6U0xtJpeIFd7UqYHshs6lvXlqr1xyM1Cw55--r7d5dsG_A1ddVDV2w1UdC3Cz_Sp1STTtEZgjnayC__SAyrGQsxWIg5-upkMTAflxuPv-fj_s-CXpKdhDsPUI1W6XNtzxZj1RvkK0DHQDtB4NHj2U-BLErG0H5ovZmRmeupQ7STkKHk-dJVosabpQ-VklYBlRURg_cg9HA7LOcy82Y3ZVRhvrN2c59EAiGufSm2i8I6SLKC9xiyXLRDjezZu"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 glass-panel p-6 rounded-3xl shadow-xl border border-white/20 max-w-xs">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">verified</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-tertiary uppercase tracking-wider">Mới nhất</p>
                  <p className="font-bold text-on-surface">Đã xử lý tại Hoàn Kiếm</p>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant">
                Khu vực Hồ Gươm đã được làm sạch sau 2 giờ báo cáo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
