/**
 * @param {{ type: 'urgent' | 'medium' | 'low' | 'resolved' }} props
 */
export default function StatusBadge({ type }) {
  const config = {
    urgent: {
      className: 'px-3 py-1 bg-error-container text-on-error-container text-[10px] font-bold uppercase rounded-full tracking-wider',
      label: 'Khẩn cấp',
    },
    medium: {
      className: 'px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold uppercase rounded-full tracking-wider',
      label: 'Trung bình',
    },
    low: {
      className: 'px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase rounded-full tracking-wider',
      label: 'Thấp',
    },
    resolved: {
      className: 'px-3 py-1 bg-primary text-on-primary text-[10px] font-bold uppercase rounded-full tracking-wider',
      label: 'Đã xử lý',
    },
  }

  const { className, label } = config[type] ?? config.medium

  return <span className={className}>{label}</span>
}
