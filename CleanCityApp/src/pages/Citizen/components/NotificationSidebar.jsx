const TYPE_CONFIG = {
  success: { borderColor: 'border-primary',   labelColor: 'text-primary',            label: 'Hoàn thành'          },
  error:   { borderColor: 'border-error',     labelColor: 'text-error',              label: 'Từ chối'             },
  status:  { borderColor: 'border-secondary', labelColor: 'text-secondary',          label: 'Cập nhật trạng thái' },
  reward:  { borderColor: 'border-secondary', labelColor: 'text-secondary',          label: 'Phần thưởng'         },
  system:  { borderColor: '',                 labelColor: 'text-on-surface-variant', label: 'Hệ thống', dimmed: true },
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  return `${Math.floor(diff / 86400)} ngày trước`
}

import { useTranslation } from 'react-i18next'

export default function NotificationSidebar({ notifications = [], markRead }) {
  const { t } = useTranslation()
  return (
    <div className="bg-surface-container-low rounded-[2rem] p-6 space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">history</span>
        {t('citizen.notifications_title')}
      </h3>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-4">{t('citizen.no_notifications')}</p>
        ) : (
          notifications.slice(0, 5).map((notif) => {
            const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system
            const label = notif.statusName || config.label
            const message = `Báo cáo #${notif.reportId} — "${notif.statusName}"`
            const time = notif.updatedAt ? timeAgo(notif.updatedAt) : notif.timeAgo || ''

            return (
              <button
                key={notif.id}
                onClick={() => markRead?.(notif.id)}
                className={`w-full text-left bg-surface-container-lowest p-4 rounded-2xl space-y-2 shadow-sm transition-opacity ${
                  config.dimmed ? 'opacity-60' : `border-l-4 ${config.borderColor}`
                } ${!notif.read ? 'ring-1 ring-primary/20' : 'opacity-75'}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-bold uppercase ${config.labelColor}`}>
                    {label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-on-surface-variant">{time}</span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium text-on-surface">{message}</p>
              </button>
            )
          })
        )}
      </div>

      <button className="w-full text-center text-sm font-bold text-primary py-2 hover:underline">
        {t('citizen.view_all')}
      </button>
    </div>
  )
}
