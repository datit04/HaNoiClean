/**
 * @param {{
 *   notifications: Array<{
 *     id: number,
 *     type: 'status' | 'reward' | 'system',
 *     timeAgo: string,
 *     message: string,
 *   }>
 * }} props
 */
export default function NotificationSidebar({ notifications }) {
  const typeConfig = {
    status: {
      borderColor: 'border-primary',
      labelColor: 'text-primary',
      label: 'Cập nhật trạng thái',
    },
    reward: {
      borderColor: 'border-secondary',
      labelColor: 'text-secondary',
      label: 'Phần thưởng',
    },
    system: {
      borderColor: '',
      labelColor: 'text-on-surface-variant',
      label: 'Hệ thống',
      dimmed: true,
    },
  }

  return (
    <div className="bg-surface-container-low rounded-[2rem] p-6 space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">history</span>
        Thông báo mới
      </h3>

      <div className="space-y-4">
        {notifications.map((notif) => {
          const config = typeConfig[notif.type] ?? typeConfig.system
          return (
            <div
              key={notif.id}
              className={`bg-surface-container-lowest p-4 rounded-2xl space-y-2 shadow-sm ${config.dimmed ? 'opacity-60' : `border-l-4 ${config.borderColor}`}`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs font-bold uppercase ${config.labelColor}`}>
                  {config.label}
                </span>
                <span className="text-[10px] text-on-surface-variant">{notif.timeAgo}</span>
              </div>
              <p className="text-sm font-medium text-on-surface">{notif.message}</p>
            </div>
          )
        })}
      </div>

      <button className="w-full text-center text-sm font-bold text-primary py-2 hover:underline">
        Xem tất cả
      </button>
    </div>
  )
}
