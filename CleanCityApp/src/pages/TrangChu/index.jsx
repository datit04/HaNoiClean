import TopNav from '../../components/layout/TopNav'
import BottomNav from '../../components/layout/BottomNav'
import HeroSection from './components/HeroSection'
import StatsSection from './components/StatsSection'
import ProcessSection from './components/ProcessSection'
import CTASection from './components/CTASection'

export default function TrangChu() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <TopNav />
      <HeroSection />
      <StatsSection />
      <ProcessSection />
      <CTASection />

      <footer className="bg-surface-container-low pt-20 pb-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="text-3xl font-black text-primary tracking-tighter font-headline mb-6">
                Hanoi CleanCity
              </div>
              <p className="text-on-surface-variant max-w-sm leading-relaxed mb-8">
                Dự án hợp tác giữa UBND Thành phố Hà Nội và Công ty Công nghệ Môi trường vì mục
                tiêu phát triển bền vững và đô thị thông minh.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                >
                  <span className="material-symbols-outlined">social_leaderboard</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                >
                  <span className="material-symbols-outlined">share</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-headline font-bold text-on-surface mb-6">Liên kết</h4>
              <ul className="space-y-4 text-on-surface-variant">
                {['Về chúng tôi', 'Hướng dẫn sử dụng', 'Chính sách bảo mật', 'Điều khoản dịch vụ'].map(
                  (item) => (
                    <li key={item}>
                      <a href="#" className="hover:text-primary transition-colors">
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-headline font-bold text-on-surface mb-6">Liên hệ</h4>
              <ul className="space-y-4 text-on-surface-variant">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  hotro@cleancity.vn
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm">call</span>
                  1900 123 456
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  Số 1 Liễu Giai, Ba Đình,
                  <br />
                  Hà Nội, Việt Nam
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-outline-variant/15 text-center text-sm text-on-surface-variant">
            © 2024 Hanoi CleanCity. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>

      <BottomNav />
    </div>
  )
}
