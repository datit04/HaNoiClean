import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const TYPE_CONFIG = {
  success: { icon: 'check_circle', iconColor: 'text-primary', bg: 'bg-primary/10' },
  error:   { icon: 'cancel',       iconColor: 'text-error',   bg: 'bg-error/10'   },
  status:  { icon: 'update',       iconColor: 'text-secondary', bg: 'bg-secondary/10' },
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  return `${Math.floor(diff / 86400)} ngày trước`
}

export default function NotificationsDropdown({ notifications, onClose, markRead }) {
  const { t } = useTranslation()
  const ref = useRef()

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-outline-variant/20 z-[70] overflow-hidden animate-fadeIn"
    >
      <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between">
        <h3 className="font-bold text-on-surface text-sm">{t('notif.title')}</h3>
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-outline-variant/10">
        {notifications.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl block mb-2 opacity-40">
              notifications_none
            </span>
            {t('notif.empty')}
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.status
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-surface-container/60 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
              >
                <div className={`w-9 h-9 rounded-full ${cfg.bg} flex-shrink-0 flex items-center justify-center mt-0.5`}>
                  <span className={`material-symbols-outlined text-lg ${cfg.iconColor}`}>{cfg.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-on-surface">
                    Báo cáo #{n.reportId} —{' '}
                    <span className={cfg.iconColor}>{n.statusName}</span>
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    {timeAgo(n.updatedAt)}
                    {n.updatedBy && <> · {n.updatedBy}</>}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
