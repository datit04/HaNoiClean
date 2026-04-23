import StatusBadge from './StatusBadge'

const REPORT_STATUS_LABEL = {
  submitted: { label: 'Đã gửi', className: 'bg-surface-dim text-on-surface-variant' },
  received: { label: 'Tiếp nhận', className: 'bg-secondary-fixed text-on-secondary-fixed' },
  processing: { label: 'Đang xử lý', className: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  done: { label: 'Hoàn thành', className: 'bg-primary-fixed text-on-primary-fixed' },
  rejected: { label: 'Từ chối', className: 'bg-error-container text-on-error-container' },
}

/**
 * @param {{
 *   report: {
 *     id: number,
 *     priority: 'urgent' | 'medium' | 'low',
 *     statusKey?: string,
 *     timeAgo: string,
 *     title: string,
 *     location: string,
 *     category: string,
 *     categoryColor: string,
 *     imageUrl: string,
 *   },
 *   onCoordinate?: (id: number) => void
 * }} props
 */
export default function ReportCard({ report, onClick }) {
  const { id, priority, statusKey, timeAgo, title, location, category, categoryColor, imageUrl } = report
  const statusInfo = REPORT_STATUS_LABEL[statusKey]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group bg-surface-container-lowest hover:bg-white transition-colors duration-300 p-6 rounded-[1.5rem] flex flex-col md:flex-row gap-6 items-start md:items-center w-full text-left ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-outline-variant">image</span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge type={priority} />
          {statusInfo && (
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          )}
          <span className="text-xs font-medium text-outline">
             {timeAgo}
          </span>
        </div>
        <h4 className="text-lg font-bold text-on-surface leading-tight">{title}</h4>
        <div className="flex items-center gap-4 text-sm text-tertiary">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {location}
          </span>
          <span
            className={`flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded text-[11px] font-semibold ${categoryColor} uppercase`}
          >
            <span className="material-symbols-outlined text-xs">smart_toy</span>
            {category}
          </span>
        </div>
      </div>
    </button>
  )
}
