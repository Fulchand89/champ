import { STATUS_COLORS } from '../../theme/index.js'

export default function Badge({ status, className = '' }) {
  const color = STATUS_COLORS[status] || 'bg-white/10 text-white/70 border border-white/10'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color} ${className}`}>
      {status}
    </span>
  )
}
