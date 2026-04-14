const TEAM_TASKS = [
  {
    id: 1,
    team: 'Đội Alpha',
    status: 'done',
    statusLabel: 'Hoàn thành',
    task: 'Thu gom rác tại Nhà Thờ Lớn',
    meta: 'Cập nhật 10:24 AM',
    icon: 'check',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
    teamColor: 'text-primary',
  },
  {
    id: 2,
    team: 'Đội Delta',
    status: 'active',
    statusLabel: 'Đang thực hiện',
    task: 'Sửa đèn đường Nguyễn Du',
    meta: 'Ước tính xong trong 45p',
    icon: 'running_with_errors',
    iconBg: 'bg-secondary-container',
    iconColor: 'text-on-secondary-container animate-pulse',
    teamColor: 'text-secondary',
  },
  {
    id: 3,
    team: 'Đội Sigma',
    status: 'pending',
    statusLabel: 'Đang chờ',
    task: 'Khử khuẩn khu vực hồ Gươm',
    meta: '',
    icon: 'pending',
    iconBg: 'bg-surface-container-highest',
    iconColor: 'text-outline',
    teamColor: 'text-tertiary',
  },
]

export default function FieldTeams() {
  return (
    <div className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10">
      <h3 className="font-headline text-xl font-extrabold text-on-surface mb-6">Đội hiện trường</h3>
      <div className="space-y-6 relative">
        <div className="absolute left-4 top-2 bottom-2 w-px border-l-2 border-dashed border-tertiary-fixed-dim" />

        {TEAM_TASKS.map((item) => (
          <div
            key={item.id}
            className={`relative pl-10 ${item.status === 'pending' ? 'opacity-60' : ''}`}
          >
            <div
              className={`absolute left-0 top-0 w-8 h-8 ${item.iconBg} rounded-full flex items-center justify-center border-4 border-surface-container-low`}
            >
              <span className={`material-symbols-outlined text-[16px] ${item.iconColor}`}>
                {item.icon}
              </span>
            </div>
            <div className="space-y-1">
              <span className={`block text-xs font-bold ${item.teamColor} uppercase`}>
                {item.team} - {item.statusLabel}
              </span>
              <p className="text-sm font-semibold text-on-surface">{item.task}</p>
              {item.meta && (
                <span className="text-xs text-outline">{item.meta}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
