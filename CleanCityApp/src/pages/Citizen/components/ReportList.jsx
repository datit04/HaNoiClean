const STEP_CONFIG = {
  submitted: { label: 'Đã gửi', filled: true, active: false },
  received: { label: 'Tiếp nhận', filled: true, active: false },
  processing: { label: 'Đang xử lý', filled: false, active: true },
  done: { label: 'Hoàn thành', filled: false, active: false },
}

/**
 * @param {{ currentStatus: 'submitted' | 'received' | 'processing' | 'done' }} props
 */
function ProgressTracker({ currentStatus }) {
  if (currentStatus === 'rejected') {
    return (
      <div className="bg-error-container text-on-error-container px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm">
        <span className="material-symbols-outlined">cancel</span>
        BAO CAO BI TU CHOI
      </div>
    )
  }

  const steps = Object.entries(STEP_CONFIG)
  const currentIndex = steps.findIndex(([key]) => key === currentStatus)

  return (
    <div className="relative pt-8 pb-4 px-2">
      <div className="absolute top-10 left-0 w-full h-[2px] bg-tertiary-fixed-dim border-dashed border-t-2 border-tertiary" />
      <div className="relative flex justify-between">
        {steps.map(([key, { label }], idx) => {
          const isPast = idx < currentIndex
          const isCurrent = idx === currentIndex
          return (
            <div key={key} className="flex flex-col items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                  isPast
                    ? 'bg-primary text-white'
                    : isCurrent
                    ? 'bg-surface-container border-2 border-primary'
                    : 'bg-surface-container-high opacity-40'
                }`}
              >
                {isPast && (
                  <span className="material-symbols-outlined text-xs">check</span>
                )}
                {isCurrent && (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isPast || isCurrent ? 'text-primary' : 'text-on-surface opacity-40'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * @param {{
 *   reports: Array<{
 *     id: number,
 *     title: string,
 *     location: string,
 *     imageUrl: string,
 *     status: 'submitted' | 'received' | 'processing' | 'done',
 *     completedAt?: string,
 *   }>
 * }} props
 */
export default function ReportList({ reports }) {
  return (
    <div className="space-y-6">
      {reports.map((report) => (
        <div
          key={report.id}
          className="bg-surface-container-highest rounded-xl p-6 flex flex-col md:flex-row gap-6 transition-transform hover:translate-y-[-4px]"
        >
          <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden shrink-0 bg-surface-container flex items-center justify-center">
            {report.imageUrl ? (
              <img
                src={report.imageUrl}
                alt={report.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-5xl text-outline-variant">image</span>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-on-surface">{report.title}</h3>
              <p className="text-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">location_on</span>
                {report.location}
              </p>
              <p className="text-sm text-on-surface-variant mt-2">{report.categoryName}</p>
            </div>

            {report.statusKey === 'done' ? (
              <div className="bg-primary-fixed text-on-primary-fixed px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm">
                <span className="material-symbols-outlined">check_circle</span>
                ĐÃ HOÀN THÀNH{report.completedAt ? ` - ${report.completedAt}` : ''}
              </div>
            ) : (
              <ProgressTracker currentStatus={report.statusKey} />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
