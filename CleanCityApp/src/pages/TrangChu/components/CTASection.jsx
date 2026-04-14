export default function CTASection() {
  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <div className="bg-surface-container-highest rounded-[3.5rem] p-12 lg:p-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <span className="material-symbols-outlined text-[300px] text-primary rotate-12">park</span>
          </div>
          <div className="relative z-10 lg:flex items-center justify-between">
            <div className="lg:max-w-2xl">
              <h2 className="font-headline text-4xl lg:text-5xl font-extrabold text-primary mb-8 tracking-tighter">
                Sẵn sàng hành động vì Hà Nội xanh?
              </h2>
              <p className="text-xl text-on-surface-variant mb-12 leading-relaxed">
                Tham gia cộng đồng hơn 50,000 tình nguyện viên và người dân đang nỗ lực mỗi ngày
                để bảo vệ vẻ đẹp của Thủ đô.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-4 p-4 bg-surface rounded-2xl">
                  <span className="material-symbols-outlined text-secondary">ios</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-tighter text-tertiary">
                      Download on
                    </p>
                    <p className="font-bold text-on-surface">App Store</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-surface rounded-2xl">
                  <span className="material-symbols-outlined text-primary">play_store_installed</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-tighter text-tertiary">
                      Get it on
                    </p>
                    <p className="font-bold text-on-surface">Google Play</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 lg:mt-0">
              <div className="w-48 h-48 bg-white p-4 rounded-3xl shadow-xl flex items-center justify-center mx-auto lg:mx-0 relative">
                <div className="grid grid-cols-4 gap-1 w-full h-full opacity-20">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={i % 2 === 0 ? 'bg-primary rounded-sm' : 'bg-on-surface'}
                    />
                  ))}
                </div>
                <span className="material-symbols-outlined absolute text-primary text-4xl">
                  qr_code_2
                </span>
              </div>
              <p className="text-center mt-4 font-bold text-sm text-tertiary">
                Quét để tải ứng dụng
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
